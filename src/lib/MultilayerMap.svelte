<script>
    //@ts-nocheck
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    let svg;
    let data = [];
    let geojson;
    let weatherData = [];
    let selectedYear;
    let yearExtent = [2000, 2023];
  
    const width = 800;
    const height = 600;
  
    onMount(async () => {
      data = await d3.csv("./fire_points.csv", d3.autoType);
      data = data.filter((d) => d.latitude && d.longitude);
  
      geojson = await d3.json("./california-counties.geojson");
  
      weatherData = await d3.csv("./CA_Weather_Fire_Dataset_1984-2025.csv", d3.autoType);
  
      selectedYear = yearExtent[0];
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
  
      const validTemps = tempYearData
        .map(d => (d.MAX_TEMP + d.MIN_TEMP) / 2)
        .filter(v => !isNaN(v));
  
      const avgTemp = validTemps.length ? d3.mean(validTemps) : null;
  
      const minTemp = d3.min(validTemps);
      const maxTemp = d3.max(validTemps);
      console.log("Temperature Range:", { min: minTemp, max: maxTemp });
  
      const tempColor = d3.scaleSequential(d3.interpolateRgb("#fff5f0", "#67000d")).domain([30, 100]);
  
      svgSel.selectAll("path")
        .data(geojson.features)
        .join("path")
        .attr("d", path)
        .attr("fill", avgTemp != null ? tempColor(avgTemp) : "#eee")
        .attr("stroke", "#aaa")
        .attr("stroke-width", 0.5);
  
      svgSel.selectAll("circle")
        .data(yearData)
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
        .text(`Avg Temp: ${avgTemp != null ? avgTemp.toFixed(2) + '°F' : 'N/A'}`)
        .attr("font-size", 12);
  
      svgSel.append("text")
        .attr("x", width - 230)
        .attr("y", 45)
        .text(`Fire Incidents: ${yearData.length}`)
        .attr("font-size", 12);
    }
  </script>
  
  <div class="mb-4">
    <label for="year-slider"><strong>Year:</strong> {selectedYear}</label>
    <input
      id="year-slider"
      type="range"
      min={yearExtent[0]}
      max={yearExtent[1]}
      step="1"
      bind:value={selectedYear}
    />
  </div>
  
  <svg bind:this={svg}></svg>