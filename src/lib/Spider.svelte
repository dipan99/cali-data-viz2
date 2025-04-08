<script>
    //@ts-nocheck
    import { onMount } from "svelte";
    import * as d3 from "d3";

    let chartDiv;
    let Plotly;
    let allData = [];
    let selectedYear = 2013;
    let showAllYears = false;
    const yearRange = { min: 1984, max: 2020 };

    const metrics = [
        "PRECIPITATION",
        "MAX_TEMP",
        "MIN_TEMP",
        "AVG_WIND_SPEED",
        "TEMP_RANGE",
        "WIND_TEMP_RATIO",
    ];

    let normalizedDataByKey = {}; // Store normalized values for each year or decade

    async function fetchData() {
        const raw = await d3.csv(
            "./CA_Weather_Fire_Dataset_1984-2025.csv",
            d3.autoType,
        );
        let grouped;
        if (showAllYears) {
            grouped = d3.rollup(
                raw,
                (v) =>
                    Object.fromEntries(
                        metrics.map((m) => [m, d3.mean(v, (d) => d[m])]),
                    ),
                (d) => `${Math.floor(+d.YEAR / 10) * 10}s`,
            );
        } else {
            grouped = d3.rollup(
                raw,
                (v) =>
                    Object.fromEntries(
                        metrics.map((m) => [m, d3.mean(v, (d) => d[m])]),
                    ),
                (d) => +d.YEAR,
            );
        }
        allData = Array.from(grouped.entries()).map(([key, values]) => ({
            key,
            ...values,
        }));
        normalizeData();
    }

    function normalizeData() {
        const normalized = {};
        metrics.forEach((metric) => {
            const values = allData.map((d) => d[metric]);
            const min = d3.min(values);
            const max = d3.max(values);
            allData.forEach((d) => {
                if (!normalized[d.key]) normalized[d.key] = {};
                normalized[d.key][metric] = (d[metric] - min) / (max - min);
            });
        });
        normalizedDataByKey = normalized;
    }

    async function drawChart() {
        if (!Plotly) Plotly = (await import("plotly.js-dist")).default;

        const keys = showAllYears
            ? Array.from(
                  new Set(
                      Object.keys(normalizedDataByKey).filter((k) =>
                          /\ds$/.test(k),
                      ),
                  ),
              ).sort()
            : [selectedYear];

        const traces = keys.map((key, i) => ({
            type: "scatterpolar",
            r: metrics.map((m) => normalizedDataByKey[key]?.[m]),
            theta: metrics,
            name: key,
            line: { shape: "spline" },
        }));

        const layout = {
            polar: {
                radialaxis: { visible: true, range: [0, 1] },
            },
            showlegend: showAllYears,
            margin: { t: 40, l: 30, r: 30, b: 30 },
            title: showAllYears
                ? "Radar Chart by Decade"
                : `Radar Chart (${selectedYear})`,
        };

        Plotly.newPlot(chartDiv, traces, layout, {
            displayModeBar: false,
            responsive: true,
        });
    }

    onMount(async () => {
        await fetchData();
        drawChart();
    });

    $: if (
        chartDiv &&
        normalizedDataByKey &&
        (selectedYear || showAllYears !== undefined)
    ) {
        fetchData().then(drawChart);
    }
</script>

<div style="max-width: 600px; margin-bottom: 20px">
    <label>
        <input type="checkbox" bind:checked={showAllYears} />
        Show by Decade (1980s–2020s)
    </label>

    {#if !showAllYears}
        <div>
            <input
                type="range"
                min={yearRange.min}
                max={yearRange.max}
                bind:value={selectedYear}
                step="1"
            />
            <div>Year: {selectedYear}</div>
        </div>
    {/if}
</div>

<div bind:this={chartDiv} style="width: 100%; height: 600px;"></div>
