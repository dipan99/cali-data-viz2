<script>
    import CountyHeatmap from '$lib/CountyHeatmap.svelte';
  </script>
  
  <CountyHeatmap
    csvPath="/corr_heatmap_county.csv"
    initialStartYear={1992}
    initialEndYear={2020}
    initialTopN={10}
  />
  