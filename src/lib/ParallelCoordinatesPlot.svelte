<script>
    //@ts-nocheck
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    let chartDiv;
  
    let dimensions = [];
  
    onMount(async () => {
      // Dynamically import Plotly only on the client
      const Plotly = (await import('plotly.js-dist')).default;
  
      const raw = await d3.csv("/CA_Weather_Fire_Dataset_1984-2025.csv", d3.autoType);
  
      const metrics = [
        "PRECIPITATION",
        "MAX_TEMP",
        "MIN_TEMP",
        "AVG_WIND_SPEED",
        "TEMP_RANGE",
        "WIND_TEMP_RATIO"
      ];
  
      dimensions = metrics.map(metric => ({
        label: metric,
        values: raw.map(row => row[metric]),
        range: d3.extent(raw, d => d[metric]),
      }));
  
      const colorMetric = "AVG_WIND_SPEED";
      const fireColors = raw.map(d => d[colorMetric]);
      const colorScale = 'Jet';
  
      Plotly.newPlot(chartDiv, [{
        type: 'parcoords',
        line: {
          color: fireColors,
          colorscale: colorScale,
          showscale: true,
          colorbar: {
            title: colorMetric.replace(/_/g, ' '),
          }
        },
        dimensions: dimensions.map(d => ({
          label: d.label,
          values: d.values,
          range: d.range
        }))
      }], {
        margin: { t: 50, r: 50, l: 50, b: 30 },
        title: 'California Wildfires - Parallel Coordinates',
      });
    });
  </script>
  
  <div bind:this={chartDiv} style="width: 100%; height: 700px;"></div>
  