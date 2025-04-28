<script>
    import { base } from "$app/paths";
    import GroupCard from "$lib/GroupCard.svelte";
</script>

<div class="container border rounded mt-5 p-3">
    <h4 class="mb-4">Team Flex</h4>
    <button
        class="btn btn-primary btn-sm"
        data-bs-toggle="modal"
        data-bs-target="#groupModal"
    >
        View Group Members
    </button>
    <GroupCard modalId="groupModal" />
</div>

<div class="container mt-3 border rounded p-3 pb-0">
    <p><strong>The California Story</strong> &#40;<i>coming soon! See <a href="https://www.canva.com/design/DAGkEZyUToQ/7FScuYSLHvSP-LcsI2CvKw/edit?utm_content=DAGkEZyUToQ&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" target="_blank">plan here</a>  </i>&#41;</p>
    
    <p>Beta Release: <a href="{base}/story">The California Story: Golden State of Fire</a></p>
</div>

<div class="container mt-3 border rounded p-3 pb-0">
    <p>If you want to check out all Visualizations we worked on, check out <a href="{base}/allvisuals">all visuals</a>.</p>
</div>