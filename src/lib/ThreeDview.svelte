<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let viewer: any;
  let fireData: any[] = [];
  let selectedYear = 2005;
  let availableYears: number[] = [];

  function goBack() {
    history.length > 1 ? history.back() : goto("/");
  }

  function parseCSV(text: string) {
    const [headerLine, ...lines] = text.trim().split("\n");
    const headers = headerLine.split(",");
    return lines.map((line) => {
      const parts = line.split(",");
      const row: any = {};
      headers.forEach((h, i) => {
        row[h.trim()] = parts[i]?.trim();
      });
      row.latitude = +row.latitude;
      row.longitude = +row.longitude;
      row.acres = +row.acres;
      row.year = +row.year;
      return row;
    });
  }

  async function updateFires(Cesium: any, year: number) {
    viewer.entities.removeAll();
    fireData
      .filter(d => d.year === year && typeof d.latitude === 'number' && typeof d.longitude === 'number')
      .forEach(d => {
        const entity = viewer.entities.add({
          name: `Fire ${d.fire_name}`,
          position: Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude),
          billboard: {
            image: './open-fire-11190_256.gif',
            width: 16,
            height: 16,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
          },
          description: `
            <b>Name:</b> ${d.fire_name}<br/>
            <b>Acres:</b> ${d.acres}<br/>
            <b>County:</b> ${d.county}<br/>
            <b>Year:</b> ${d.year}
          `,
        });

        viewer.scene.postRender.addEventListener(() => {
          const cameraHeight = viewer.camera.positionCartographic.height;
          const scale = Math.min(64, Math.max(16, 800000 / cameraHeight));
          entity.billboard.width = scale;
          entity.billboard.height = scale;
        });
      });
  }

  async function flyToCalifornia(Cesium: any) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-122.4175, 37.655, 2000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
      },
      duration: 5
    });
  }

  onMount(async () => {
    const Cesium = (window as any).Cesium;
    if (!Cesium) {
      console.error("Cesium not available");
      return;
    }

    Cesium.Ion.defaultAccessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2YTZlNTY2Zi1mNGY1LTQ2Y2EtYTA1ZS0xZmFhZjYwZGI5NDYiLCJpZCI6Mjk0MDQxLCJpYXQiOjE3NDQ2NTA0MzR9.noUc-GDwJGe5SCmqKtr4P0UnGgnu2f3bx9ww6DolHzY";

    viewer = new Cesium.Viewer("cesiumContainer", {
      terrain: Cesium.Terrain.fromWorldTerrain()
    });

    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(-93.23256, 44.97452, 500),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: 0
      }
    });

    const tileset = await Cesium.createOsmBuildingsAsync();
    viewer.scene.primitives.add(tileset);

    const countySource = await Cesium.GeoJsonDataSource.load('./california-counties.geojson');
    countySource.entities.values.forEach(entity => {
      entity.polygon.material = Cesium.Color.YELLOW.withAlpha(0.1);
      entity.polygon.outline = true;
      entity.polygon.outlineColor = Cesium.Color.YELLOW;
      entity.polygon.outlineWidth = 1;
    });
    viewer.dataSources.add(countySource);

    const res = await fetch("./fire_points_updated.csv");
    const text = await res.text();
    fireData = parseCSV(text);
    availableYears = [...new Set(fireData.map((d) => +d.year))].sort();

    updateFires(Cesium, selectedYear);
  });

  function onYearChange(event: Event) {
    selectedYear = +(event.target as HTMLInputElement).value;
    const Cesium = (window as any).Cesium;
    updateFires(Cesium, selectedYear);
  }
</script>

<svelte:head>
  <link
    href="https://cesium.com/downloads/cesiumjs/releases/1.128/Build/Cesium/Widgets/widgets.css"
    rel="stylesheet"
  />
  <script
    src="https://cesium.com/downloads/cesiumjs/releases/1.128/Build/Cesium/Cesium.js"
    defer
  ></script>
</svelte:head>

<div class="top-controls">
  <button on:click={goBack}>← Back</button>
  <button on:click={() => flyToCalifornia((window as any).Cesium)}>Fly Me to California</button>
  <label>
    <strong>Year:</strong> {selectedYear}
    <input
      type="range"
      min="2000"
      max="2020"
      step="1"
      bind:value={selectedYear}
      on:input={onYearChange}
    />
  </label>
</div>

<div id="cesiumContainer"></div>

<style>
  #cesiumContainer {
    width: 100%;
    height: 100vh;
    display: block;
  }

  .top-controls {
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: rgba(255, 255, 255, 0.9);
    padding: 10px 20px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    font-family: sans-serif;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  input[type="range"] {
    width: 200px;
    margin-left: 10px;
  }
</style>
