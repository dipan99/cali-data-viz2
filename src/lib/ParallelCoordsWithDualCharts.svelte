<script>
  //@ts-nocheck
  import { onMount } from "svelte";
  import * as d3 from "d3";
  export let progress = 0;

  let selectedChart = "precip";
  let chartDiv;
  let precipChartDiv;
  let tempChartDiv;
  let windChartDiv;
  let Plotly;
  let dimensions = [];
  let selectedYears = [];
  let enrichedData = [];
  let allMetrics = [];
  let precipData, tempData, windData;
  let currentMaxYear = 1984; // Initialize with the minimum year
  let maxDataYear = 2020; // Will be updated after loading data
  // let visibleYearLabel = 1984;
  // $: visibleYearLabel = currentMaxYear;

  const chartMaxWidth = 450;
  const chartHeight = 190;

  const chartOptions = [
    { value: "precip", label: "Precipitation vs Fire Count" },
    { value: "temp", label: "Temperature vs Fire Count" },
    { value: "wind", label: "Wind Speed vs Fire Count" },
  ];

  function progressToYear(progress) {
    const minP = 12,
      maxP = 100;
    const p = Math.max(minP, Math.min(progress, maxP));
    const ratio = (p - minP) / (maxP - minP);
    return Math.floor(1984 + ratio * (maxDataYear - 1984));
  }

  $: {
    // Update visualization whenever progress changes
    if (Plotly && enrichedData.length > 0) {
      const newMaxYear = progressToYear(progress);
      if (newMaxYear !== currentMaxYear) {
        currentMaxYear = newMaxYear;
        updateVisualization();
      }
    }
  }

  onMount(async () => {
    if (!Plotly) Plotly = (await import("plotly.js-dist"))?.default;

    const weatherData = await d3.csv(
      "./CA_Weather_Fire_Dataset_1984-2025.csv",
      d3.autoType,
    );
    const fireData = await d3.csv("./fire_points.csv", d3.autoType);

    precipData = await d3.csv("./yearly_precip_fire.csv", d3.autoType);
    tempData = await d3.csv("./yearly_avgtemp_fire.csv", d3.autoType);
    windData = await d3.csv("./yearly_windspeed_fire.csv", d3.autoType);

    const fireCounts = d3.rollup(
      fireData,
      (v) => v.length,
      (d) => d.year,
    );

    const avgTempByYear = new Map();
    tempData.forEach((d) => {
      if (d.YEAR && d.AvgTemp != null) {
        avgTempByYear.set(d.YEAR, d.AvgTemp);
      }
    });

    const metrics = [
      "PRECIPITATION",
      // "MAX_TEMP",
      // "MIN_TEMP",
      "AVG_TEMP",
      "AVG_WIND_SPEED",
      // "TEMP_RANGE",
      // "WIND_TEMP_RATIO",
    ];

    enrichedData = weatherData.map((d) => ({
      ...d,
      AVG_TEMP: avgTempByYear.get(d.YEAR) || 0,
      FIRE_COUNT: fireCounts.get(d.YEAR) || 0,
    }));

    // Determine the maximum year in the dataset
    if (enrichedData.length > 0) {
      maxDataYear = d3.max(enrichedData, (d) => d.YEAR);
    }

    allMetrics = [...metrics, "FIRE_COUNT"];

    dimensions = allMetrics.map((metric) => ({
      label: metric.replace(/_/g, " "),
      values: enrichedData.map((row) => row[metric]),
      range: d3.extent(enrichedData, (d) => d[metric]),
      constraintrange: null,
    }));

    // Initial visualization with current progress
    currentMaxYear = progressToYear(progress);
    updateVisualization();

    chartDiv.on("plotly_restyle", updateSelectedYears);
    chartDiv.on("plotly_relayout", updateSelectedYears);
  });

  function updateVisualization() {
    // Filter data based on current max year for parallel coordinates
    const filteredData = enrichedData.filter((d) => d.YEAR <= currentMaxYear);

    const colorMetric = "AVG_WIND_SPEED";
    const fireColors = filteredData.map((d) => d[colorMetric]);

    // Update dimensions for the filtered data
    const filteredDimensions = allMetrics.map((metric) => ({
      label: metric.replace(/_/g, " "),
      values: filteredData.map((row) => row[metric]),
      range: d3.extent(filteredData, (d) => d[metric]),
      constraintrange: null,
    }));

    const styledDimensions = filteredDimensions.map((dim) => ({
      ...dim,
      tickangle: 45, // Angle the tick labels 45 degrees
      tickfont: {
        size: 9, // Make the labels smaller
      },
    }));

    Plotly.react(
      chartDiv,
      [
        {
          type: "parcoords",
          line: {
            color: fireColors,
            colorscale: "Jet",
            showscale: true,
            colorbar: {
              title: {
                text: "Avg Wind Speed", // 🔧 Set the label you want here
                side: "right", // Optional: position the label
              },
              tickfont: { size: 10 },
              titlefont: { size: 12 },
            },
          },
          dimensions: styledDimensions,
        },
      ],
      {
        margin: { t: 50, r: 50, l: 50, b: 30 },
        title: `California Wildfires (1984-${currentMaxYear}) - Parallel Coordinates`,
        displaylogo: false,
        width: chartMaxWidth,
        height: 290,
      },
      {
        displaylogo: false,
        modeBarButtonsToRemove: ["sendDataToCloud"],
        displayModeBar: true,
      },
    );

    updateSelectedYears();
  }

  function updateSelectedYears() {
    let filtered = enrichedData.filter((d) => d.YEAR <= currentMaxYear);

    dimensions.forEach((dim, i) => {
      if (dim.constraintrange) {
        const constraintRanges = Array.isArray(dim.constraintrange[0])
          ? dim.constraintrange
          : [dim.constraintrange];
        const metric = allMetrics[i];
        filtered = filtered.filter((d) =>
          constraintRanges.some(
            ([min, max]) => d[metric] >= min && d[metric] <= max,
          ),
        );
      }
    });

    selectedYears = [...new Set(filtered.map((d) => d.YEAR))];

    clearCharts();
    drawAllCharts();
    updateChartVisibility();
  }

  function clearCharts() {
    d3.select(precipChartDiv).selectAll("*").remove();
    d3.select(tempChartDiv).selectAll("*").remove();
    d3.select(windChartDiv).selectAll("*").remove();
  }

  function drawAllCharts() {
    drawDualChart("precip", precipChartDiv, precipData);
    drawDualChart("temp", tempChartDiv, tempData);
    drawDualChart("wind", windChartDiv, windData);
  }

  function updateChartVisibility() {
    precipChartDiv.style.display = "none";
    tempChartDiv.style.display = "none";
    windChartDiv.style.display = "none";

    if (selectedChart === "precip") precipChartDiv.style.display = "block";
    else if (selectedChart === "temp") tempChartDiv.style.display = "block";
    else if (selectedChart === "wind") windChartDiv.style.display = "block";
  }

  function handleChartSelection() {
    updateChartVisibility();
  }

  function drawDualChart(type, container, rawData) {
    if (!rawData || !container) return;

    let yMetric, label;
    if (type === "precip") {
      yMetric = "AvgPrecip";
      label = "Avg Precipitation";
    } else if (type === "wind") {
      yMetric = "AvgWindSpeed";
      label = "Avg Wind Speed";
    } else if (type === "temp") {
      yMetric = "AvgTemp";
      label = "Avg Temperature";
    }

    // Filter data to only show years up to the current max year
    let data = rawData.filter(
      (d) =>
        d.YEAR &&
        d.YEAR <= currentMaxYear &&
        d[yMetric] != null &&
        d.FireCount != null,
    );

    // Apply any selected year filters
    if (selectedYears.length > 0) {
      data = data.filter((d) => selectedYears.includes(d.YEAR));
    }

    const margin = { top: 20, right: 60, bottom: 50, left: 60 };
    const width = chartMaxWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.YEAR))
      .range([0, width]);
    const yLeft = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[yMetric])])
      .nice()
      .range([height, 0]);
    const yRight = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.FireCount)])
      .nice()
      .range([height, 0]);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));
    svg.append("g").call(d3.axisLeft(yLeft));
    svg
      .append("g")
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisRight(yRight));

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(label);

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", width + 45)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Fire Count");

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .line()
          .x((d) => x(d.YEAR))
          .y((d) => yLeft(d[yMetric])),
      );

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "crimson")
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .line()
          .x((d) => x(d.YEAR))
          .y((d) => yRight(d.FireCount)),
      );
  }
</script>

<div class="chart-container">
  <!-- <div class="year-label">
    <strong>{visibleYearLabel}</strong>
  </div> -->

  <div bind:this={chartDiv} class="chart-div"></div>

  <div class="chart-selector">
    <label for="chart-select">Select Chart: </label>
    <select
      id="chart-select"
      bind:value={selectedChart}
      on:change={handleChartSelection}
    >
      {#each chartOptions as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </div>

  <div bind:this={precipChartDiv} class="dual-chart"></div>
  <div bind:this={tempChartDiv} class="dual-chart"></div>
  <div bind:this={windChartDiv} class="dual-chart"></div>
</div>

<style>
  .chart-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .chart-div,
  .dual-chart {
    width: 100%;
    max-width: 600px;
  }

  .chart-selector {
    margin: 20px 0;
  }

  :global(.js-plotly-plot) {
    max-width: 100%;
    overflow: hidden;
  }

  .year-label {
    position: absolute;
    top: 25px;
    right: 5px;
    font-size: 24px;
    font-weight: 900;
    color: #3e2c28;
    background: rgba(255, 255, 255, 0.85);
    padding: 8px 16px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }
</style>
