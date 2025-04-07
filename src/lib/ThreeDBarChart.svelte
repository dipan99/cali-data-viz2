<script>
    //@ts-nocheck
    import { onMount } from "svelte";
    import * as THREE from "three";
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
    import * as d3 from "d3";

    let container;
    let scene, camera, renderer, controls;
    let data = [],
        geojson;

    let selectedYear = 2000;
    let allYears = [];
    let countyCentroids = {}; // Store centroids of counties

    const WIDTH = 800;
    const HEIGHT = 600;
    const BAR_WIDTH = 300;
    // Even larger scale for the map
    const MAP_SCALE = 25000;

    onMount(async () => {
        try {
            const raw = await fetch("/fire_counts_by_county_and_year.csv");
            const text = await raw.text();
            const parsed = d3.csvParse(text, d3.autoType);
            data = parsed;
            
            allYears = [...new Set(data.map((d) => d.year))]
                .filter((y) => y >= 2000)
                .sort();

            geojson = await (await fetch("/california-counties.geojson")).json();
            
            init();
            animate();
        } catch (error) {
            console.error("Error loading data:", error);
        }
    });

    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 1, 5000000);
        // Position camera to see the full map from above
        camera.position.set(0, 100000, 0);
        camera.lookAt(0, 0, 0);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(WIDTH, HEIGHT);
        container.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = true;
        controls.minDistance = 5000;   // Allow much closer zoom
        controls.maxDistance = 500000; // Allow much further zoom

        const maxFire = d3.max(data, (d) => d.fire_count);
        const colorScale = d3
            .scaleSequential(d3.interpolateOrRd)
            .domain([0, maxFire]);

        // Draw map first, which will compute centroids
        drawMap();
        
        // Then use those centroids for bar placement
        updateBars(data, selectedYear, colorScale);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 100000, 100000);
        scene.add(light);
        scene.add(new THREE.AmbientLight(0x888888));
    }

    function drawMap() {
        // Use larger scale for the map
        const projection = d3
            .geoMercator()
            .center([-119.5, 37.5])
            .scale(MAP_SCALE)
            .translate([0, 0]);

        const mapGroup = new THREE.Group();
        mapGroup.name = "californiaMap";

        // Process each county feature
        geojson.features.forEach((feature) => {
            const countyName = feature.properties.name;
            
            const coordsArray =
                feature.geometry.type === "Polygon"
                    ? [feature.geometry.coordinates]
                    : feature.geometry.coordinates;

            // For multi-polygon counties, find the largest polygon
            let largestPoly = null;
            let maxArea = 0;
            
            coordsArray.forEach((poly, polyIndex) => {
                if (!poly[0] || !Array.isArray(poly[0])) return;
                
                // Calculate area to find largest polygon
                try {
                    const area = Math.abs(d3.polygonArea(poly[0]));
                    if (area > maxArea) {
                        maxArea = area;
                        largestPoly = poly;
                    }
                } catch (e) {
                    console.warn("Error calculating area for", countyName, e);
                }
                
                // Create county shape for the map
                const shape = new THREE.Shape();
                let firstPoint = true;

                poly[0].forEach((point) => {
                    if (!Array.isArray(point)) return;
                    const [lng, lat] = point;
                    const [x, z] = projection([lng, lat]); // x,z for proper orientation
                    
                    if (firstPoint) {
                        shape.moveTo(x, z); // Use x,z instead of x,y
                        firstPoint = false;
                    } else {
                        shape.lineTo(x, z); // Use x,z instead of x,y
                    }
                });

                const extrudeSettings = {
                    depth: 300,  // Thicker counties
                    bevelEnabled: false,
                };
                
                const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                const material = new THREE.MeshLambertMaterial({
                    color: 0xd0d0d0,
                    transparent: false,
                    opacity: 1.0,
                });
                
                const mesh = new THREE.Mesh(geometry, material);
                // Rotate the map to lie flat on the x-z plane
                mesh.rotation.x = Math.PI / 2;
                mesh.userData = { county: countyName };
                
                mapGroup.add(mesh);
            });
            
            // Calculate and store centroid for the largest polygon
            if (largestPoly && largestPoly[0]) {
                try {
                    const centroid = d3.polygonCentroid(largestPoly[0]);
                    const [x, z] = projection(centroid); // x,z for proper orientation
                    countyCentroids[countyName] = { x, z }; // Store as x,z
                } catch (e) {
                    console.warn("Error calculating centroid for", countyName, e);
                }
            }
        });
        
        scene.add(mapGroup);
    }

    function updateBars(data, year, colorScale) {
        // Remove existing bars
        const existingBars = scene.getObjectByName("bars");
        if (existingBars) scene.remove(existingBars);

        const barGroup = new THREE.Group();
        barGroup.name = "bars";

        const filtered = data.filter((d) => d.year === year);
        
        // Find the max fire count for this year for better scaling
        const maxYearFire = d3.max(filtered, d => d.fire_count) || 1;
        
        // Process each county's fire data
        filtered.forEach((d) => {
            const countyName = d.county;
            
            // Look for different variations of the county name
            const possibleNames = [
                countyName,
                countyName + " County",
                countyName.replace(/ County$/, "")
            ];
            
            // Find the centroid for this county
            let centroid = null;
            for (const name of possibleNames) {
                if (countyCentroids[name]) {
                    centroid = countyCentroids[name];
                    break;
                }
            }
            
            if (!centroid) {
                console.warn(`Centroid not found for county: ${countyName}`);
                return;
            }
            
            // Scale height based on fire count - much smaller scale
            const HEIGHT_SCALE = 10;
            const barHeight = Math.max(300, d.fire_count * HEIGHT_SCALE);
            
            // Create bar
            const geometry = new THREE.BoxGeometry(BAR_WIDTH, barHeight, BAR_WIDTH);
            const material = new THREE.MeshPhongMaterial({
                color: new THREE.Color(colorScale(d.fire_count)),
                transparent: true,
                opacity: 0.8
            });
            
            const bar = new THREE.Mesh(geometry, material);
            
            // Position at the county centroid on the x-z plane with y for height
            bar.position.set(centroid.x, barHeight / 2 + 300, centroid.z);
            
            bar.userData = { 
                county: countyName,
                fireCount: d.fire_count
            };
            
            barGroup.add(bar);
        });

        scene.add(barGroup);
    }

    $: if (scene && data.length > 0 && allYears.length > 0 && geojson) {
        const maxFire = d3.max(data, (d) => d.fire_count);
        const colorScale = d3
            .scaleSequential(d3.interpolateOrRd)
            .domain([0, maxFire]);
        updateBars(data, selectedYear, colorScale);
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
</script>

<div class="controls">
    <label>
        <strong>Year:</strong>
        {selectedYear}
        <input
            type="range"
            min={2000}
            max={allYears[allYears.length - 1] || 2023}
            step="1"
            bind:value={selectedYear}
        />
    </label>
</div>
<div class="visualization" bind:this={container}></div>

<style>
    .controls {
        margin-bottom: 10px;
        font-family: Arial, sans-serif;
    }
    
    .visualization {
        width: 800px;
        height: 600px;
        border: 1px solid #ccc;
    }
    
    :global(canvas) {
        display: block;
    }
</style>