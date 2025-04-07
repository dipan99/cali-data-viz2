<script>
    //@ts-nocheck
    import { onMount } from "svelte";
    import * as d3 from "d3";

    let svg;
    let data = [];
    let geojson;
    let windData = [];
    let selectedYear;
    let yearExtent = [2000, 2023];

    const width = 800;
    const height = 600;

    let avgWindDisplay = 0;
    let fireCountDisplay = 0;

    onMount(async () => {
        data = await d3.csv("/fire_points.csv", d3.autoType);
        data = data.filter((d) => d.latitude && d.longitude);

        geojson = await d3.json("/california-counties.geojson");
        windData = await d3.csv("/CA_Weather_Fire_Dataset_1984-2025.csv", d3.autoType);

        const years = [...new Set(data.map((d) => d.year))];
        selectedYear = yearExtent[0];
    });

    $: if (svg && data.length && geojson && windData.length && selectedYear !== undefined) {
        drawMap();
    }

    function drawMap() {
        const svgSel = d3
            .select(svg)
            .attr("width", width)
            .attr("height", height);
        svgSel.selectAll("*").remove();

        const projection = d3
            .geoMercator()
            .center([-119.5, 37.5])
            .scale(3200)
            .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        // Compute average wind for selected year across CA
        const filteredWind = windData.filter((d) => d.YEAR === selectedYear);
        const avgWind = d3.mean(filteredWind, (d) => d.AVG_WIND_SPEED);
        avgWindDisplay = avgWind?.toFixed(2) || "N/A";

        const windExtent = [0, 10]; // Increased contrast sensitivity
        const colorScale = d3.scaleSequential(d3.interpolateBlues).domain(windExtent);

        // Draw CA counties with same wind color
        svgSel
            .selectAll("path")
            .data(geojson.features)
            .join("path")
            .attr("d", path)
            .attr("fill", colorScale(avgWind))
            .attr("stroke", "#aaa")
            .attr("stroke-width", 0.5);

        // Filter fires for current year
        const yearData = data.filter((d) => d.year === selectedYear);
        fireCountDisplay = yearData.length;

        // Plot fire points
        svgSel
            .selectAll("circle")
            .data(yearData)
            .join("circle")
            .attr("cx", (d) => {
                const coords = projection([d.longitude, d.latitude]);
                return coords ? coords[0] : -100;
            })
            .attr("cy", (d) => {
                const coords = projection([d.longitude, d.latitude]);
                return coords ? coords[1] : -100;
            })
            .attr("r", (d) => Math.sqrt(d.acres) * 0.03)
            .attr("fill", "red")
            .attr("opacity", 0.6);

        // Add legend (adjusted for visibility)
        const legendX = width - 140;
        const legendY = height - 70;

        svgSel.append("rect")
            .attr("x", legendX)
            .attr("y", legendY)
            .attr("width", 140)
            .attr("height", 50)
            .attr("fill", "white")
            .attr("stroke", "#ccc")
            .attr("rx", 4);

        svgSel.append("circle")
            .attr("cx", legendX + 15)
            .attr("cy", legendY + 20)
            .attr("r", 6)
            .attr("fill", "red")
            .attr("opacity", 0.6);

        svgSel.append("text")
            .attr("x", legendX + 30)
            .attr("y", legendY + 24)
            .text("Fire Incident")
            .attr("font-size", 12)
            .attr("fill", "#333");

        // Add wind/fire stats top-right of chart (within SVG bounds)
        svgSel.append("rect")
            .attr("x", width - 220)
            .attr("y", 60)
            .attr("width", 200)
            .attr("height", 45)
            .attr("fill", "white")
            .attr("stroke", "#ccc")
            .attr("rx", 4);

        svgSel.append("text")
            .attr("x", width - 210)
            .attr("y", 78)
            .text(`Wind Speed: ${avgWindDisplay} mph`)
            .attr("font-size", 12)
            .attr("fill", "#333");

        svgSel.append("text")
            .attr("x", width - 210)
            .attr("y", 92)
            .text(`Fire Count: ${fireCountDisplay}`)
            .attr("font-size", 12)
            .attr("fill", "#333");
    }
</script>

<div class="mb-4">
    <label for="year-slider"><strong>Year:</strong> {selectedYear}</label>
    <input
        id="year-slider"
        type="range"
        min={yearExtent[0]}
        max={yearExtent[1]}
        step="1"
        bind:value={selectedYear}
    />
</div>

<svg bind:this={svg}></svg>