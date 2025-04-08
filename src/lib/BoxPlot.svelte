<script>
    //@ts-nocheck
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    let container;
    let data = [];
    let selectedYear = 2013;
    let yearRange = { min: 2013, max: 2020 };
    let showAllYears = false;
    
    onMount(async () => {
      try {
        const response = await fetch('./fires_duration_precip.csv');
        const text = await response.text();
        data = d3.csvParse(text, d3.autoType);
        
        if (container) drawBoxPlot();
      } catch (error) {
        console.error("Error loading data:", error);
        d3.select(container)
          .append("div")
          .style("color", "red")
          .style("font-family", "sans-serif")
          .text("Error loading data: " + error.message);
      }
    });
    
    function updateYear(event) {
      selectedYear = parseInt(event.target.value);
      drawBoxPlot();
    }
    
    // Remove the toggleAllYears function and use reactivity instead
    
    // This reactive statement will run whenever showAllYears changes
    $: if (data.length > 0 && container) {
      if (showAllYears !== undefined) {  // Only redraw if showAllYears is defined
        drawBoxPlot();
      }
    }
    
    function drawBoxPlot() {
      const margin = { top: 50, right: 40, bottom: 60, left: 70 };
      const width = 800 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom;
      
      d3.select(container).selectAll("svg").remove(); // Clear old svg
      d3.select(container).selectAll(".tooltip").remove(); // Also clear old tooltips
      
      const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Filter data based on toggle
      let filteredData;
      if (showAllYears) {
        filteredData = data;
      } else {
        filteredData = data.filter(d => d.Year === selectedYear);
      }
      
      // Filter data with valid PrecipBucket and Duration fields
      const cleanData = filteredData.filter(d => d.PrecipBucket && d.Duration != null);
      
      if (cleanData.length === 0) {
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .style("font-family", "sans-serif")
          .style("font-size", "16px")
          .text(showAllYears ? "No valid data found" : `No valid data found for year ${selectedYear}`);
        return;
      }
      
      // Get unique precipitation buckets
      const groups = Array.from(new Set(cleanData.map(d => String(d.PrecipBucket)))).sort();
      
      const x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding(0.4);
      
      // Add X axis
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "12px");
      
      // Add X axis label
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .attr("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", "14px")
        .text("Precipitation Bucket");
      
      // Find max duration for Y scale with some padding
      const maxDuration = d3.max(cleanData, d => d.Duration) * 1.1;
      
      // Calculate Y scale based on data
      const y = d3.scaleLinear()
        .domain([0, maxDuration]).nice()
        .range([height, 0]);
      
      // Add Y axis
      svg.append("g")
        .call(d3.axisLeft(y))
        .style("font-size", "12px");
      
      // Add Y axis label
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", "14px")
        .text("Fire Duration (days)");
      
      // Add title with year or "All Years"
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text(showAllYears 
          ? `Fire Duration by Precipitation Bucket (All Years)`
          : `Fire Duration by Precipitation Bucket (${selectedYear})`
        );
      
      // Create tooltip
      const tooltip = d3.select(container)
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px")
        .style("padding", "8px")
        .style("pointer-events", "none")
        .style("z-index", "100");
      
      // Create boxplots for each group
      groups.forEach(group => {
        const groupData = cleanData
          .filter(d => String(d.PrecipBucket) === group)
          .map(d => d.Duration)
          .sort(d3.ascending);
        
        if (groupData.length < 1) return;
        
        const q1 = d3.quantile(groupData, 0.25);
        const median = d3.quantile(groupData, 0.5);
        const q3 = d3.quantile(groupData, 0.75);
        const interQuantileRange = q3 - q1;
        const min = Math.max(d3.min(groupData), q1 - 1.5 * interQuantileRange);
        const max = Math.min(d3.max(groupData), q3 + 1.5 * interQuantileRange);
        
        const center = x(group) + x.bandwidth() / 2;
        const boxWidth = x.bandwidth();
        
        // Draw vertical line (whisker)
        svg.append("line")
          .attr("x1", center)
          .attr("x2", center)
          .attr("y1", y(min))
          .attr("y2", y(max))
          .attr("stroke", "black")
          .attr("stroke-width", 1);
        
        // Draw horizontal lines at min and max
        svg.append("line")
          .attr("x1", center - boxWidth / 3)
          .attr("x2", center + boxWidth / 3)
          .attr("y1", y(min))
          .attr("y2", y(min))
          .attr("stroke", "black")
          .attr("stroke-width", 1);
        
        svg.append("line")
          .attr("x1", center - boxWidth / 3)
          .attr("x2", center + boxWidth / 3)
          .attr("y1", y(max))
          .attr("y2", y(max))
          .attr("stroke", "black")
          .attr("stroke-width", 1);
        
        // Draw box
        svg.append("rect")
          .attr("x", center - boxWidth / 2)
          .attr("y", y(q3))
          .attr("height", Math.max(1, y(q1) - y(q3))) // Ensure minimum height
          .attr("width", boxWidth)
          .attr("fill", "#fa8072")
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .on("mouseover", () => tooltip.style("opacity", 0.9))
          .on("mousemove", (event) => {
            tooltip.html(
              `<strong>${group} Precipitation</strong><br>
              <hr style="margin: 4px 0">
              ${showAllYears ? `<span style="font-weight: bold">Years:</span> ${yearRange.min}-${yearRange.max}<br>` : ''}
              <span style="font-weight: bold">Count:</span> ${groupData.length} fires<br>
              <span style="font-weight: bold">Q1:</span> ${q1.toFixed(1)} days<br>
              <span style="font-weight: bold">Median:</span> ${median.toFixed(1)} days<br>
              <span style="font-weight: bold">Q3:</span> ${q3.toFixed(1)} days<br>
              <span style="font-weight: bold">Min:</span> ${min.toFixed(1)} days<br>
              <span style="font-weight: bold">Max:</span> ${max.toFixed(1)} days`
            )
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 10}px`);
          })
          .on("mouseout", () => tooltip.style("opacity", 0));
        
        // Draw median line
        svg.append("line")
          .attr("x1", center - boxWidth / 2)
          .attr("x2", center + boxWidth / 2)
          .attr("y1", y(median))
          .attr("y2", y(median))
          .attr("stroke", "black")
          .attr("stroke-width", 2);
        
        // Draw outliers if any
        const outliers = groupData.filter(d => d < min || d > max);
        outliers.forEach(d => {
          svg.append("circle")
            .attr("cx", center)
            .attr("cy", y(d))
            .attr("r", 3)
            .attr("fill", "black")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .on("mouseover", () => tooltip.style("opacity", 0.9))
            .on("mousemove", (event) => {
              tooltip.html(`<span style="font-weight: bold">Outlier:</span> ${d.toFixed(1)} days`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 10}px`);
            })
            .on("mouseout", () => tooltip.style("opacity", 0));
        });
      });
      
      // Add count text in the bottom right
      svg.append("text")
        .attr("x", width)
        .attr("y", height + 40)
        .attr("text-anchor", "end")
        .style("font-family", "sans-serif")
        .style("font-size", "12px")
        .style("font-style", "italic")
        .text(`Total fires: ${cleanData.length}`);
    }
  </script>
  
  <style>
    .tooltip {
      font-family: sans-serif;
      font-size: 12px;
      border-radius: 4px;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.15);
    }
    
    .slider-container {
      margin: 20px 0;
      width: 800px;
      font-family: sans-serif;
    }
    
    .slider-label {
      display: block;
      margin-bottom: 10px;
      font-weight: bold;
    }
    
    .slider {
      width: 100%;
    }
    
    .year-display {
      font-size: 16px;
      font-weight: bold;
      margin-left: 10px;
    }
    
    .toggle-container {
      margin: 15px 0;
      font-family: sans-serif;
    }
    
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
      vertical-align: middle;
    }
    
    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 34px;
    }
    
    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
    
    input:checked + .toggle-slider {
      background-color: #fa8072;
    }
    
    input:focus + .toggle-slider {
      box-shadow: 0 0 1px #fa8072;
    }
    
    input:checked + .toggle-slider:before {
      transform: translateX(26px);
    }
    
    .toggle-label {
      margin-left: 10px;
      font-weight: bold;
    }
  </style>
  
  <div style="font-family: sans-serif; max-width: 800px;">
    <div class="toggle-container">
      <label class="toggle-switch">
        <input type="checkbox" bind:checked={showAllYears}>
        <span class="toggle-slider"></span>
      </label>
      <span class="toggle-label">Show All Years (2013-2020)</span>
    </div>
    
    {#if !showAllYears}
      <div class="slider-container">
        <label class="slider-label">
          Select Year:
          <span class="year-display">{selectedYear}</span>
        </label>
        <input
          type="range"
          min={yearRange.min}
          max={yearRange.max}
          value={selectedYear}
          class="slider"
          on:input={updateYear}
          step="1"
        />
        <div style="display: flex; justify-content: space-between;">
          <span>{yearRange.min}</span>
          <span>{yearRange.max}</span>
        </div>
      </div>
    {/if}
    
    <div bind:this={container}></div>
  </div>