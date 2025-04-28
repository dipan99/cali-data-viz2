<script>
    //@ts-nocheck
    import { onMount } from "svelte";
    import * as d3 from "d3";

    let chartDiv;
    let dimensions = [];

    onMount(async () => {
        const Plotly = (await import("plotly.js-dist")).default;

        const weatherData = await d3.csv(
            "./CA_Weather_Fire_Dataset_1984-2025.csv",
            d3.autoType,
        );
        const fireData = await d3.csv("./fire_points.csv", d3.autoType);

        // Compute fire count per year
        const fireCounts = d3.rollup(
            fireData,
            (v) => v.length,
            (d) => d.year,
        );

        const metrics = [
            "PRECIPITATION",
            "MAX_TEMP",
            "MIN_TEMP",
            "AVG_WIND_SPEED",
            "TEMP_RANGE",
            "WIND_TEMP_RATIO",
        ];

        // Combine metrics with FIRE_COUNT per row
        const enrichedData = weatherData.map((d) => ({
            ...d,
            FIRE_COUNT: fireCounts.get(d.YEAR) || 0,
        }));

        const allMetrics = [...metrics, "FIRE_COUNT"];

        dimensions = allMetrics.map((metric) => ({
            label: metric.replace(/_/g, " "),
            values: enrichedData.map((row) => row[metric]),
            range: d3.extent(enrichedData, (d) => d[metric]),
        }));

        const colorMetric = "AVG_WIND_SPEED";
        const fireColors = enrichedData.map((d) => d[colorMetric]);
        const colorScale = "Jet";

        Plotly.newPlot(
            chartDiv,
            [
                {
                    type: "parcoords",
                    line: {
                        color: fireColors,
                        colorscale: colorScale,
                        showscale: true,
                        colorbar: {
                            title: colorMetric.replace(/_/g, " "),
                        },
                    },
                    dimensions: dimensions.map((d) => ({
                        label: d.label,
                        values: d.values,
                        range: d.range,
                    })),
                },
            ],
            {
                margin: { t: 50, r: 50, l: 50, b: 30 },
                title: "California Wildfires - Parallel Coordinates",
            },
            {
                displaylogo: false,
            },
        );
    });
</script>

<div bind:this={chartDiv} style="width: 100%; height: 700px;"></div>
