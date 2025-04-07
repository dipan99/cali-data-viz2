<script>
    //@ts-nocheck
    import { onMount } from "svelte";
    import * as d3 from "d3";

    let svg;
    let data = [];
    let minYear = null;
    let maxYear = null;
    let counties = [];
    let top10Counties = [];
    let selectedCounties = new Set();

    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 50, left: 60 };

    onMount(async () => {
        const raw = await d3.csv(
            "/fire_counts_by_county_and_year.csv",
            d3.autoType,
        );

        const totalByCounty = d3.rollup(
            raw,
            (v) => d3.sum(v, (d) => d.fire_count),
            (d) => d.county,
        );
        top10Counties = [...totalByCounty.entries()]
            .sort((a, b) => d3.descending(a[1], b[1]))
            .slice(0, 5)
            .map((d) => d[0]);

        counties = [...new Set(raw.map((d) => d.county))].sort();
        selectedCounties = new Set(top10Counties);
        data = raw;
        const yearExtent = d3.extent(data, (d) => d.year);
        // minYear = yearExtent[0];
        minYear = 1990;
        maxYear = yearExtent[1];
    });

    $: if (
        data.length &&
        svg &&
        selectedCounties.size > 0 &&
        minYear !== null &&
        maxYear !== null
    ) {
        drawChart();
    }

    function unSelectAll(){
        selectedCounties = new Set();
    }

    function toggleCounty(county) {
        if (selectedCounties.has(county)) {
            selectedCounties.delete(county);
        } else {
            selectedCounties.add(county);
        }
        selectedCounties = new Set(selectedCounties); // force reactivity
    }

    function resetToTop10() {
        selectedCounties = new Set(top10Counties);
    }

    function drawChart() {
        d3.select(svg).selectAll("*").remove();

        const selected = [...selectedCounties];
        const filtered = data.filter((d) => selected.includes(d.county));
        // const grouped = d3.group(filtered, (d) => d.county);
        const filteredData = data.filter(
            (d) =>
                selected.includes(d.county) &&
                d.year >= minYear &&
                d.year <= maxYear,
        );

        const grouped = d3.group(filteredData, (d) => d.county);
        const years = [...new Set(filteredData.map((d) => d.year))];

        const x = d3
            .scaleLinear()
            .domain([minYear, maxYear])
            .range([margin.left, width - margin.right]);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(filtered, (d) => d.fire_count)])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const color = d3
            .scaleOrdinal()
            .domain([...grouped.keys()])
            .range(d3.schemeTableau10);

        const xAxis = (g) =>
            g
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        const yAxis = (g) =>
            g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y));

        const line = d3
            .line()
            .x((d) => x(d.year))
            .y((d) => y(d.fire_count));

        const svgSel = d3
            .select(svg)
            .attr("width", width)
            .attr("height", height);
        svgSel.append("g").call(xAxis);
        svgSel.append("g").call(yAxis);

        for (const [county, values] of grouped) {
            svgSel
                .append("path")
                .datum(values)
                .attr("fill", "none")
                .attr("stroke", color(county))
                .attr("stroke-width", 2)
                .attr("d", line);

            svgSel
                .append("text")
                .datum(values[values.length - 1])
                .attr("x", (d) => x(d.year) + 5)
                .attr("y", (d) => y(d.fire_count))
                .text(county)
                .attr("font-size", 10)
                .attr("fill", color(county));
        }
    }
</script>

<div>
    <h3>Select Counties:</h3>
    <div class="d-flex gap-2 align-items-center">
        <button on:click={resetToTop10}>Reset to Top 5</button>
        <div style="margin: 1rem 0;">
            <label>
                Year Range:
                <input
                    type="number"
                    bind:value={minYear}
                    min={d3.min(data, (d) => d.year)}
                    max={d3.max(data, (d) => d.year)}
                />
                -
                <input
                    type="number"
                    bind:value={maxYear}
                    min={d3.min(data, (d) => d.year)}
                    max={d3.max(data, (d) => d.year)}
                />
            </label>
        </div>
        <button on:click={unSelectAll}>Deselect All</button>
    </div>
    

    <div style="columns: 5; max-height: 300px; overflow-y: auto;">
        {#each counties as county}
            <label>
                <input
                    type="checkbox"
                    value={county}
                    checked={selectedCounties.has(county)}
                    on:change={() => toggleCounty(county)}
                />
                {county}
            </label><br />
        {/each}
    </div>
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
