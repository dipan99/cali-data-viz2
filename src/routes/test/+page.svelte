<script>
    //@ts-nocheck
    import { scaleLinear, scaleTime } from 'd3-scale';
    import { brushX } from 'd3-brush';
    import { select } from 'd3-selection';
    import { timeParse } from 'd3-time-format';
    import { onMount } from 'svelte';
  
    // Sample data - could be dates or numbers
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    let minValue = Math.min(...data);
    let maxValue = Math.max(...data);
    let brushMin = minValue;
    let brushMax = maxValue;
    
    let brushSelection;
    let svg;
    
    const width = 500;
    const height = 100;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    
    onMount(() => {
      const innerWidth = width - margin.left - margin.right;
      
      // For numeric data
      const xScale = scaleLinear()
        .domain([minValue, maxValue])
        .range([0, innerWidth]);
      
      const brush = brushX()
        .extent([[0, 0], [innerWidth, 50]])
        .on("brush", brushed)
        .on("end", brushed);
      
      brushSelection = select(svg)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(brush);
      
      function brushed(event) {
        if (!event.selection) return;
        
        const [x0, x1] = event.selection;
        brushMin = xScale.invert(x0);
        brushMax = xScale.invert(x1);
        
        // Round values if using numbers
        if (typeof brushMin === 'number') {
          brushMin = Math.round(brushMin * 100) / 100;
          brushMax = Math.round(brushMax * 100) / 100;
        }
        
        // For dates you might want to format them here
      }
    });
  </script>
  
  <div class="brush-container">
    <h2>Brush Selection Example</h2>
    
    <div class="values-display">
      <p>Selected Range: <strong>{brushMin}</strong> to <strong>{brushMax}</strong></p>
      <p>Full Range: {minValue} to {maxValue}</p>
    </div>
    
    <svg bind:this={svg} width={width} height={height}></svg>
    
    <p>Drag the gray area to select a range</p>
  </div>
  
  <style>
    .brush-container {
      font-family: Arial, sans-serif;
      max-width: 500px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #eee;
      border-radius: 8px;
    }
    
    .values-display {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    
  </style>