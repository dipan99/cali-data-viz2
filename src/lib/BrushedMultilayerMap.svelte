<script>
    //@ts-nocheck
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    let svg;
    let brushSvg;
    let data = [];
    let geojson;
    let weatherData = [];
    let selectedYear;
    let yearExtent = [2000, 2023];
    let tempBrushRange = [30, 100];
  
    const width = 800;
    const height = 600;
  
    onMount(async () => {
      data = await d3.csv("/fire_points.csv", d3.autoType);
      data = data.filter((d) => d.latitude && d.longitude);
  
      geojson = await d3.json("/california-counties.geojson");
      weatherData = await d3.csv("/CA_Weather_Fire_Dataset_1984-2025.csv", d3.autoType);
  
      selectedYear = yearExtent[0];
      setupBrush();
    });
  
    $: if (svg && data.length && geojson && weatherData.length && selectedYear !== undefined) {
      drawMap();
    }
  
    function drawMap() {
      const svgSel = d3.select(svg).attr("width", width).attr("height", height);
      svgSel.selectAll("*").remove();
  
      const projection = d3.geoMercator()
        .center([-119.5, 37.5])
        .scale(3200)
        .translate([width / 2, height / 2]);
  
      const path = d3.geoPath().projection(projection);
  
      const yearData = data.filter((d) => d.year === selectedYear);
      const tempYearData = weatherData.filter((d) => d.YEAR === selectedYear);
  
      const tempByDay = new Map();
      tempYearData.forEach(d => {
        const avg = (d.MAX_TEMP + d.MIN_TEMP) / 2;
        if (!isNaN(avg)) {
          tempByDay.set(+d.DAY_OF_YEAR, avg);
        }
      });
  
      const firesWithTemp = yearData.map(d => {
        const temp = tempByDay.get(+d.day_of_year || +d.DAY_OF_YEAR);
        return { ...d, temp };
      }).filter(d => d.temp >= tempBrushRange[0] && d.temp <= tempBrushRange[1]);
  
      svgSel.selectAll("path")
        .data(geojson.features)
        .join("path")
        .attr("d", path)
        .attr("fill", "#f0f0f0")
        .attr("stroke", "#aaa")
        .attr("stroke-width", 0.5);
  
      svgSel.selectAll("circle")
        .data(firesWithTemp)
        .join("circle")
        .attr("cx", (d) => projection([d.longitude, d.latitude])?.[0] || -100)
        .attr("cy", (d) => projection([d.longitude, d.latitude])?.[1] || -100)
        .attr("r", (d) => Math.sqrt(d.acres) * 0.02)
        .attr("fill", "blue")
        .attr("opacity", 0.6);
  
      svgSel.append("rect")
        .attr("x", width - 240)
        .attr("y", 10)
        .attr("width", 230)
        .attr("height", 50)
        .attr("fill", "white")
        .attr("stroke", "#ccc");
  
      svgSel.append("text")
        .attr("x", width - 230)
        .attr("y", 30)
        .text(`Year: ${selectedYear}`)
        .attr("font-size", 12);
  
      svgSel.append("text")
        .attr("x", width - 230)
        .attr("y", 45)
        .text(`Fire Incidents: ${firesWithTemp.length}`)
        .attr("font-size", 12);
    }
  
    function setupBrush() {
      const svgBrush = d3.select(brushSvg).attr("width", width).attr("height", 100);
      svgBrush.selectAll("*").remove();
  
      const margin = { left: 40, right: 40 };
      const x = d3.scaleLinear().domain([30, 100]).range([margin.left, width - margin.right]);
  
      svgBrush.append("g")
        .attr("transform", `translate(0,80)`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(d => `${d}°F`));
  
      const brush = d3.brushX()
        .extent([[margin.left, 30], [width - margin.right, 70]])
        .on("brush end", (event) => {
          const sel = event.selection;
          if (sel) {
            const [start, end] = sel.map(x.invert);
            tempBrushRange = [Math.round(start), Math.round(end)];
          } else {
            tempBrushRange = [30, 100];
          }
        });
  
      svgBrush.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, [x(tempBrushRange[0]), x(tempBrushRange[1])]);
    }
  </script>
  
  <div class="mb-4">
    <label for="year-slider"><strong>Year:</strong></label>
    <input
      id="year-slider"
      type="range"
      min={yearExtent[0]}
      max={yearExtent[1]}
      step="1"
      bind:value={selectedYear}
    />
  </div>
  
  <div class="d-flex justify-content-end mb-4">
    <strong>Filter by Daily Avg Temp (°F): {tempBrushRange[0]}°F – {tempBrushRange[1]}°F</strong>
    <svg bind:this={brushSvg}></svg>
  </div>
  
  <svg bind:this={svg}></svg>