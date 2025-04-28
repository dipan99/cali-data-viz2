<script>
    //@ts-nocheck
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    export let progress = 0;
  
    let container;
    let data = [];
    let yearRange = { min: 2013, max: 2020 };
    let currentYear = yearRange.min;
  
    const chartMaxWidth = 500;
    const chartHeight = 600;
  
    function progressToYear(progress) {
      const minP = 12, maxP = 100;
      const p = Math.max(minP, Math.min(progress, maxP));
      const ratio = (p - minP) / (maxP - minP);
      return Math.floor(yearRange.min + ratio * (yearRange.max - yearRange.min));
    }
  
    $: currentYear = progressToYear(progress);
  
    onMount(async () => {
      try {
        const response = await fetch('./California_Fire_Incidents_with_precip_2013-2020.csv');
        const text = await response.text();
        data = d3.csvParse(text, d3.autoType);
  
        data.forEach(d => {
          if (d.Started) {
            d.Year = new Date(d.Started).getFullYear();
          } else if (d.Started_naive) {
            d.Year = new Date(d.Started_naive).getFullYear();
          } else if (d.fire_year) {
            d.Year = d.fire_year;
          }
        });
  
        if (container) drawScatterPlot();
      } catch (error) {
        console.error("Error loading data:", error);
        d3.select(container)
          .append("div")
          .style("color", "red")
          .style("font-family", "sans-serif")
          .text("Error loading data: " + error.message);
      }
    });
  
    $: if (data.length > 0 && container && progress > 0) {
      drawScatterPlot();
    }
  
    function drawScatterPlot() {
      const margin = { top: 50, right: 40, bottom: 60, left: 70 };
      const width = chartMaxWidth - margin.left - margin.right;
      const height = chartHeight - margin.top - margin.bottom;
  
      d3.select(container).selectAll("svg").remove();
      d3.select(container).selectAll(".tooltip").remove();
  
      const containerDiv = d3.select(container).style("position", "relative");
  
      const tooltip = containerDiv.append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px")
        .style("padding", "8px")
        .style("pointer-events", "none")
        .style("z-index", "1000")
        .style("font-family", "sans-serif")
        .style("font-size", "12px")
        .style("box-shadow", "0 0 6px rgba(0, 0, 0, 0.3)");
  
      const svg = containerDiv.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      let filteredData = data.filter(d => d.Year <= currentYear);
  
      const cleanData = filteredData.filter(d => 
        d.average_precip_norm != null && 
        d.duration != null && 
        !isNaN(d.average_precip_norm) && 
        !isNaN(d.duration)
      );
  
      if (cleanData.length === 0) {
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .style("font-family", "sans-serif")
          .style("font-size", "16px")
          .text("No valid data found");
        return;
      }
  
      const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
      const y = d3.scaleLinear().domain([0, d3.max(cleanData, d => d.duration) * 1.1]).range([height, 0]);
  
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)).selectAll("text").style("font-size", "12px");
  
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 15)
        .attr("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", "13px")
        .text("Normalized Precipitation (0-100)");
  
      svg.append("g").call(d3.axisLeft(y)).style("font-size", "12px");
  
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", "13px")
        .text("Fire Duration (days)");
  
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(`Fire Duration vs. Precipitation (≤ ${currentYear})`);
  
      const colorScale = d3.scaleOrdinal()
        .domain(["LOW", "MEDIUM", "HIGH"])
        .range(["#ff6b6b", "#4dabf7", "#51cf66"]);
  
      svg.selectAll("circle")
        .data(cleanData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.average_precip_norm))
        .attr("cy", d => y(d.duration))
        .attr("r", 4)
        .attr("fill", d => colorScale(d.precip_bucket_qcut))
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("opacity", 0.7)
        .on("mouseover", function(event, d) {
          d3.select(this).attr("r", 7).attr("opacity", 1);
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip.html(
            `<strong>${d.Name || "Unnamed Fire"}</strong><br>
             <hr style="margin: 4px 0">
             <span style="font-weight: bold">Year:</span> ${d.Year}<br>
             <span style="font-weight: bold">Duration:</span> ${d.duration.toFixed(1)} days<br>
             <span style="font-weight: bold">Precip Level:</span> ${d.precip_bucket_qcut || "N/A"}<br>
             <span style="font-weight: bold">Normalized Precip:</span> ${d.average_precip_norm.toFixed(1)}<br>
             ${d.AcresBurned ? `<span style="font-weight: bold">Acres Burned:</span> ${d.AcresBurned.toLocaleString()}<br>` : ""}
             ${d.StructuresDestroyed ? `<span style="font-weight: bold">Structures Destroyed:</span> ${d.StructuresDestroyed}<br>` : ""}`
          );
          tooltip.style("left", `${event.pageX + 10}px`).style("top", `${event.pageY - 10}px`);
        })
        .on("mouseout", function() {
          d3.select(this).attr("r", 4).attr("opacity", 0.7);
          tooltip.transition().duration(500).style("opacity", 0);
        });
  
      const legend = svg.append("g").attr("transform", `translate(${width - 100}, 0)`);
      ["LOW", "MEDIUM", "HIGH"].forEach((bucket, i) => {
        const row = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
        row.append("circle").attr("r", 4).attr("fill", colorScale(bucket)).attr("stroke", "black").attr("stroke-width", 1);
        row.append("text").attr("x", 10).attr("y", 4).style("font-family", "sans-serif").style("font-size", "11px").text(`${bucket} Precip`);
      });
  
      svg.append("text")
        .attr("x", width)
        .attr("y", height + 40)
        .attr("text-anchor", "end")
        .style("font-family", "sans-serif")
        .style("font-size", "11px")
        .style("font-style", "italic")
        .text(`Total fires: ${cleanData.length}`);
    }
  </script>
  
  <div class="chart-container">
    <div bind:this={container} style="width: 100%; max-width: 600px;"></div>
  </div>
  
  <style>
    .chart-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  
    :global(.tooltip) {
      font-family: sans-serif !important;
      font-size: 12px !important;
      border-radius: 4px !important;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.3) !important;
      background: white !important;
      color: #333 !important;
      z-index: 1000 !important;
      pointer-events: none !important;
    }
  </style>
  