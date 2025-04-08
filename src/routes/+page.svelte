<script>
    import { base } from "$app/paths";
    import GroupCard from "$lib/GroupCard.svelte";
</script>

<div class="container border rounded mt-5 p-3">
    <button
        class="btn btn-primary btn-sm"
        data-bs-toggle="modal"
        data-bs-target="#groupModal"
    >
        View Group Members
    </button>
    <GroupCard modalId="groupModal" />
</div>

<div class="container mt-3 border rounded p-3">
    <p><strong>Visualizations</strong> </p>
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

<div class="container mt-3 border rounded p-3 pb-0">
    <p><strong>The California Story</strong> &#40;<i>coming soon! See <a href="https://www.canva.com/design/DAGkEZyUToQ/7FScuYSLHvSP-LcsI2CvKw/edit?utm_content=DAGkEZyUToQ&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" target="_blank">plan here</a>  </i>&#41;</p>
    
</div>
