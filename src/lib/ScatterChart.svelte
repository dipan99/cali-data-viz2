<script>
    //@ts-nocheck
    import { onMount } from "svelte";
    import * as d3 from "d3";

    let svg;
    let data = [];
    let counties = [];
    let top5Counties = [];
    let selectedCounties = new Set();
    let yearExtent = [2000, 2023];
    let selectedYear;

    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };

    onMount(async () => {
        const raw = await d3.csv(
            "./scatter_unemployment_vs_acres.csv",
            d3.autoType,
        );
        data = raw;

        counties = [...new Set(raw.map((d) => d.county))].sort();

        const totalByCounty = d3.rollup(
            raw,
            (v) => d3.sum(v, (d) => d.total_acres_burned),
            (d) => d.county,
        );
        top5Counties = [...totalByCounty.entries()]
            .sort((a, b) => d3.descending(a[1], b[1]))
            .slice(0, 5)
            .map((d) => d[0]);

        selectedCounties = new Set(top5Counties);

        const years = [...new Set(data.map((d) => d.year))];
        yearExtent = [d3.min(years), d3.max(years)];
        selectedYear = yearExtent[0];
    });

    function toggleCounty(county) {
        if (selectedCounties.has(county)) {
            selectedCounties.delete(county);
        } else {
            selectedCounties.add(county);
        }
        selectedCounties = new Set(selectedCounties);
    }

    function resetToTop5() {
        selectedCounties = new Set(top5Counties);
    }

    function unSelectAll() {
        selectedCounties = new Set();
    }

    $: if (data.length && svg && selectedYear && selectedCounties.size > 0) {
        drawChart();
    }

    function drawChart() {
        const svgSel = d3
            .select(svg)
            .attr("width", width)
            .attr("height", height);
        svgSel.selectAll("*").remove();

        const yearData = data.filter(
            (d) => d.year === selectedYear && selectedCounties.has(d.county),
        );

        const x = d3
            .scaleLinear()
            .domain(d3.extent(data, (d) => d.unemployment_rate))
            .nice()
            .range([margin.left, width - margin.right]);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d.total_acres_burned)])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const color = d3
            .scaleOrdinal()
            .domain(counties)
            .range(d3.schemeTableau10);

        const xAxis = (g) =>
            g
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x));

        const yAxis = (g) =>
            g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y));

        svgSel.append("g").call(xAxis);
        svgSel.append("g").call(yAxis);

        svgSel
            .selectAll("circle")
            .data(yearData, (d) => d.county)
            .join("circle")
            .attr("r", 6)
            .attr("fill", (d) => color(d.county))
            .attr("opacity", 0.8)
            .attr("cx", (d) => x(d.unemployment_rate))
            .attr("cy", (d) => y(d.total_acres_burned));
    }
</script>

<div style="margin-bottom: 1rem;">
    <label for="year-slider"><strong>Select Year:</strong> {selectedYear}</label
    >
    <input
        id="year-slider"
        type="range"
        min={yearExtent[0]}
        max={yearExtent[1]}
        step="1"
        bind:value={selectedYear}
    />
</div>

<div class="d-flex gap-2 align-items-center">
    <button on:click={resetToTop5}>Reset to Top 5</button>
    <button on:click={unSelectAll}>Deselect All</button>
</div>

<div
    style="columns: 5; max-height: 300px; overflow-y: auto; margin-bottom: 1rem;"
>
    {#each counties as county}
        <label>
            <input
                type="checkbox"
                checked={selectedCounties.has(county)}
                on:change={() => toggleCounty(county)}
            />
            {county}
        </label><br />
    {/each}
</div>

<div class="d-flex gap-2">
    <svg bind:this={svg}></svg>
    {#if data.length && selectedCounties.size > 0}
        <div style="margin-top: 1rem;">
            <h4>Legend:</h4>
            <ul style="list-style: none; padding-left: 0;">
                {#each [...selectedCounties] as county, i}
                    <li
                        style="margin-bottom: 4px; display: flex; align-items: center;"
                    >
                        <span
                            style="
                  width: 16px;
                  height: 16px;
                  margin-right: 8px;
                  display: inline-block;
                  background-color: {d3.schemeTableau10[
                                i % d3.schemeTableau10.length
                            ]};
                "
                        ></span>
                        {county}
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</div>
