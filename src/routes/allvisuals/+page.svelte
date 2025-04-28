<script>
    import { base } from "$app/paths";
    import Back from "$lib/Back.svelte";
</script>

<div class="container mt-3 border rounded p-3">
    <Back />
    <p class="mt-2"><strong>Visualizations</strong> </p>
    <div class="d-flex flex-column gap-2">
        <a href="{base}/linechart">California Wildfires Line Chart</a>
        <a href="{base}/scatterchart">Scatter Chart</a>
        <a href="{base}/animatedmap">Animated Map</a>
        <a href="{base}/threedbarchart">3D View</a>
        <a href="{base}/hexbinmap">Hexbin</a>
        <a href="{base}/parallelcoordinatesplot">Parallel Coordinates</a>
        <a href="{base}/multilayermap">Multilayer Map</a>
        <a href="{base}/brushedmultilayermap">Brushed Multilayer Map</a>
        <a href="{base}/boxplot">Box Plot</a>
        <a href="{base}/dualaxislinechart">Dual Axis Line Chart</a>
        <a href="{base}/spider">Spider Chart</a>
    </div>    
</div>