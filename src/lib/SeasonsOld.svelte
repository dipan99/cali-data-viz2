<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let csvPath = '/fire_climate_data.csv';
  export let currentProgress = 0;

  let container;

  let data = [];
  let aggData = [];
  let svg, g, x, y, color;
  let currentDate;
  let currentYearIndex = 0;

  const margin = { top: 60, right: 150, bottom: 60, left: 80 };
  const width = 600, height = 300;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  onMount(async () => {
    data = await d3.csv(csvPath, d => {
      const year = +d.YEAR, month = +d.MONTH;
      const date = new Date(year, month - 1, 1);
      return {
        YEAR: year,
        MONTH: month,
        fire_count: +d.fire_count,
        SEASON: d.SEASON,
        date
      };
    });

    data.sort((a, b) => a.date - b.date);

    const aggMap = d3.rollup(
      data,
      v => ({
        total: d3.sum(v, d => d.fire_count),
        Winter: d3.sum(v.filter(d => d.SEASON === 'Winter'), d => d.fire_count),
        Spring: d3.sum(v.filter(d => d.SEASON === 'Spring'), d => d.fire_count),
        Summer: d3.sum(v.filter(d => d.SEASON === 'Summer'), d => d.fire_count),
        Fall: d3.sum(v.filter(d => d.SEASON === 'Fall'), d => d.fire_count)
      }),
      d => d.YEAR
    );

    aggData = Array.from(aggMap, ([year, values]) => ({ YEAR: +year, ...values }))
                   .sort((a, b) => a.YEAR - b.YEAR);

    initChart();
  });

  function initChart() {
    svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    svg.append("text")
      .attr("x", (width - margin.right) / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "24px")
      .attr("font-weight", "bold")
      .text("Monthly Fire Count with Season-Based Color (1992–2020)");

    g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    x = d3.scaleTime().range([0, innerWidth]);
    y = d3.scaleLinear().range([innerHeight, 0]);
    color = d3.scaleOrdinal().range(d3.schemeTableau10);

    g.append("g").attr("class", "x-axis").attr("transform", `translate(0, ${innerHeight})`);
    g.append("g").attr("class", "y-axis");

    drawAxes();
  }

  function drawAxes() {
    if (data.length === 0) return;

    x.domain(d3.extent(data, d => d.date));
    y.domain([0, d3.max(data, d => d.fire_count)]).nice();

    const seasons = Array.from(new Set(data.map(d => d.SEASON)));
    color.domain(seasons);

    g.select(".x-axis").call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));
    g.select(".y-axis").call(d3.axisLeft(y));

    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);
    seasons.forEach((season, i) => {
      const row = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`);
      row.append("rect").attr("width", 18).attr("height", 18).attr("fill", color(season));
      row.append("text").attr("x", 25).attr("y", 14).style("font-size", "14px").text(season);
    });
  }

  $: if (aggData.length > 0 && currentProgress >= 12) {
  const totalYears = aggData.length;
  const progressAfterThreshold = currentProgress - 12;
  const remainingProgress = 100 - 12;
  const adjustedIndex = Math.floor((progressAfterThreshold / remainingProgress) * totalYears);
  currentYearIndex = Math.max(0, adjustedIndex);
  const year = aggData[Math.min(currentYearIndex, totalYears - 1)].YEAR;
  currentDate = new Date(year, 11, 31);

  updateChart(currentDate);
}


  function updateChart(untilDate) {
    const filtered = data.filter(d => d.date <= untilDate);
    g.selectAll(".line-group").remove();

    const lineGroup = g.append("g").attr("class", "line-group");
    for (let i = 1; i < filtered.length; i++) {
      const d0 = filtered[i - 1], d1 = filtered[i];
      lineGroup.append("path")
        .attr("fill", "none")
        .attr("stroke", color(d0.SEASON))
        .attr("stroke-width", 2)
        .attr("d", d3.line()
          .x(d => x(d.date))
          .y(d => y(d.fire_count))([d0, d1]));
    }
  }
</script>

<div style="display: flex; flex-direction: column; align-items: center; max-width: 1200px; margin: auto;">
  <div bind:this={container} style="width: 100%;"></div>
</div>

<style>
  svg {
    font-family: sans-serif;
  }
</style>
