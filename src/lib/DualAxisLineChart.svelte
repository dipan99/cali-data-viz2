<script>
    //@ts-nocheck
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    let container;
    let data = [];
  
    onMount(async () => {
      const raw = await d3.csv('/yearly_precip_fire.csv', d3.autoType);
      data = raw.filter(d => d.YEAR && d.AvgPrecip != null && d.FireCount != null);
      if (container) drawChart();
    });
  
    function drawChart() {
      const margin = { top: 30, right: 60, bottom: 50, left: 60 };
      const width = 800 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom;
  
      d3.select(container).selectAll("*").remove(); // clear any previous
  
      const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.YEAR))
        .range([0, width]);
  
      const yLeft = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgPrecip)]).nice()
        .range([height, 0]);
  
      const yRight = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.FireCount)]).nice()
        .range([height, 0]);
  
      // Axes
      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  
      svg.append("g")
        .call(d3.axisLeft(yLeft));
  
      svg.append("g")
        .attr("transform", `translate(${width}, 0)`)
        .call(d3.axisRight(yRight));
  
      // Left y-axis label
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .text("Avg Precipitation");
  
      // Right y-axis label
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", width + 45)
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .text("Fire Count");
  
      // Line for precipitation (blue)
      const precipLine = d3.line()
        .x(d => x(d.YEAR))
        .y(d => yLeft(d.AvgPrecip));
  
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2.5)
        .attr("d", precipLine);
  
      // Line for fire count (red)
      const fireLine = d3.line()
        .x(d => x(d.YEAR))
        .y(d => yRight(d.FireCount));
  
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "crimson")
        .attr("stroke-width", 2.5)
        .attr("d", fireLine);
  
      // Optional: add legends
      svg.append("circle").attr("cx", 10).attr("cy", -10).attr("r", 6).attr("fill", "steelblue");
      svg.append("text").attr("x", 20).attr("y", -6).text("Avg Precipitation").style("font-size", "12px");
  
      svg.append("circle").attr("cx", 170).attr("cy", -10).attr("r", 6).attr("fill", "crimson");
      svg.append("text").attr("x", 180).attr("y", -6).text("Fire Count").style("font-size", "12px");
    }
  </script>
  
  <div bind:this={container}></div>
  