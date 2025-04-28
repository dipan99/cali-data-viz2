<script lang="ts">
  import Scroll from "$lib/Scroll.svelte";
  import { slide, fly } from "svelte/transition";
  import { fade } from "svelte/transition";
  import Seasons from "$lib/Seasons.svelte";
  import SeasonsOld from "$lib/SeasonsOld.svelte";
  import CountyHeatmap from "$lib/CountyHeatmap.svelte";
  import ParallelCoordsWithDualCharts from "$lib/ParallelCoordsWithDualCharts.svelte";
  import FireDurationAndPrecip from "$lib/FireDurationAndPrecip.svelte";
  import HexbinMap from "$lib/HexbinMap.svelte";
  import { onMount } from "svelte";
    import { base } from "$app/paths";

  let progress = $state(0);

  // ACTIVE SECTION STATE
  let activeSection = $state("GEOGRAPHICAL");

  let showTeam = $state(false);
  let screenWidth = $state(0);

  function getQuestionText() {
    if (activeSection === "ENVIRONMENTAL") {
      return "How do climate factors like temperature, and wind influence wildfire frequency and severity?";
    } else if (activeSection === "GEOGRAPHICAL") {
      return "How have California wildfires evolved over time in terms of frequency, size, and severity?";
    } else if (activeSection === "SEASONAL") {
      return "How do seasonal changes influence wildfire frequency and severity?";
    }
    return "";
  }

  // Process text into array of characters
  let questionText = $derived(getQuestionText());
  let showQuestion = $derived(progress > 1 && progress < 10);
  let showFacts = $derived(progress >= 12 && progress <= 100);
  let showVisualizations = $derived(progress >= 10);

  // Calculate question container width based on progress
  let questionContainerClass = $derived(() => {
    if (progress < 10) {
      return "col-md-10 question-expanded";
    } else {
      return "col-md-6";
    }
  });
  const seasonalFacts = [
    {
      year: "Early 1990s (Baseline: 1992–1995)",
      text: `• Moderate Fire Activity:
– Winter fire counts: typically between 100–400 (e.g., 1992: January 92, February 54, December 101; total for winter=247).
– Summer peak: consistently high (e.g., 1992: June 2185, July 2062, August 2284).
– Overall totals (e.g., 1995: ~7,381 fires) set the baseline with lower fuel accumulation.`,
      startProgress: 15,
      endProgress: 35,
    },
    {
      year: "Mid-2000s (Emerging Extremes – 2006)",
      text: `• Record Summer Outlier:
– 2006 July fires reached a record 2933, highlighting intense fuel-drying conditions.
• Initial Winter Shift:
– Winter counts begin to rise (e.g., 2006: January 240, December 400), hinting at altered precipitation and warming trends.
• Fuel Build-Up Notice:
– Decades of fire suppression mean denser, more abundant fuels(shrubs and vegetation) are now present.`,
      startProgress: 36,
      endProgress: 55,
    },
    {
      year: "Late 2000s (Extreme Activity – 2007)",
      text: `• Sharp Increase in Overall Fires:
– Estimated total in 2007 ≈ 13,428 fires, a dramatic jump from baseline.
• Atypical Winter Behavior:
– Winter anomalies with January 2007 hitting 1400+ fires, far exceeding previous winter levels.
• Sustained High Summer Activity:
– Continued high counts in July (≈2283) and August (≈1819) reinforce extreme summer conditions.`,
      startProgress: 56,
      endProgress: 75,
    },
    {
      year: "Underlying Drivers (Supported by Research)",
      text: `• Fuel Accumulation & Historical Fire Suppression:
– Decades of reduced wildfire occurrence have allowed fine fuels and vegetation to build up.
• Climate Change – Extreme Fire Weather:
– Rising temperatures, lower humidity, and extended dry seasons (California was affected by droughts from 2007-09) have increased the frequency of extreme fire weather days.
• Altered Seasonal Precipitation Patterns:
– Delayed or reduced winter rains extend the period during which fuels remain dry, leading to uncharacteristic winter fire activity (observed in 2007 and parts of the 2010s).
• Enhanced Lightning Activity:
– Warmer, drier conditions can boost convective thunderstorms, increasing lightning ignitions—especially under “hot-wet” conditions.`,
      startProgress: 76,
      endProgress: 90,
    },
    {
      year: "Conclusion",
      text: `• The evolution of California wildfires—from the moderate baseline of the early 1990s to the extreme events of 2006 and 2007—reflects a combination of accumulated fuels due to prolonged fire suppression, a shifting climate that lengthens dry seasons, and more frequent extreme weather events.
• These data points align closely with scientific research, demonstrating that both natural and human-influenced factors are reshaping the state's fire regime.`,
      startProgress: 91,
      endProgress: 100,
    },
  ];

  let seasonalVisibleFacts = $derived(
    seasonalFacts.filter(
      (f) => progress >= f.startProgress && progress <= f.endProgress,
    ),
  );
  const wildfireFacts = [
    {
      year: "Early 1990s (Baseline Distribution)",
      text: `• Wildfire Counts:
– Fires were moderately distributed across California’s counties, setting a baseline frequency.
• Burned Acres:
– Total acreage burned was relatively low, reflecting less extreme weather and limited fuel accumulation across regions.`,
      startProgress: 15,
      endProgress: 30,
    },
    {
      year: "Mid-2000s (Emergence of Hotspots)",
      text: `• Wildfire Counts:
– Certain counties—particularly in Southern California (e.g., Riverside)—began to show significantly higher fire frequencies.
• Burned Acres:
– In parallel, burned acreage started increasing in these regions, as hotter, drier conditions and worsening fuel loads led to fires covering larger areas.`,
      startProgress: 31,
      endProgress: 50,
    },
    {
      year: "Pivotal Year – Late 2000s (2007)",
      text: `• Wildfire Counts:
– The record-setting 2007 marked a turning point with 13,377 fires, reflecting a dramatic upsurge in ignition events.
• Burned Acres:
– Simultaneously, there was a substantial jump in acres burned, underscoring a shift toward more severe fire events with expansive spatial impact.`,
      startProgress: 51,
      endProgress: 65,
    },
    {
      year: "Underlying Geographic Drivers",
      text: `• Wildfire Counts:
– Regional factors such as urban growth, terrain, and local management practices lead to disparities (e.g., high counts in urban-adjacent Riverside).
• Burned Acres:
– Geographic differences in vegetation and wildland continuity mean that counties with vast wildlands (like parts of San Diego and Los Angeles) experience fewer but much larger fires, resulting in notably higher burned acreage.`,
      startProgress: 66,
      endProgress: 80,
    },
    {
      year: "Conclusion",
      text: `• Summary of Findings:
– Over nearly 30 years, the spatial distribution of wildfire activity has evolved considerably.
– Fire counts increased dramatically in hotspot regions, most notably in 2007, while burned acres surged over time—especially in counties with extensive wildlands.
– This evolution reflects the combined impacts of climate extremes, historical fire suppression leading to fuel build-up, and inherent geographic differences in vegetation and topography.
– These insights highlight the need for adaptive fire management strategies that address both ignition reduction and mitigation of large-scale fire spread.`,
      startProgress: 81,
      endProgress: 90,
    },
    {
      year: "Extreme Burned Acreage Swings (Trivia)",
      text: `Trivia: Did you know that in some years the total burned acreage surged dramatically—exceeding a 210% increase in one year and reaching an astounding 1343% in another? 
Imagine the extreme conditions and geographic influences that could drive such shifts!`,
      startProgress: 91,
      endProgress: 100,
    },
  ];

  let wildfireVisibleFacts = $derived(
    wildfireFacts.filter(
      (f) => progress >= f.startProgress && progress <= f.endProgress,
    ),
  );

  const precipFacts = [
    {
      year: "2013–2018",
      text: "2013, 2014, 2015, 2016, 2017 & 2018 were years of low to medium precipitation in California.",
      startProgress: 15,
      endProgress: 85,
    },
    {
      year: "2019",
      text: "2019 was a year of high precipitation across California.",
      startProgress: 86,
      endProgress: 1000,
    },
    {
      year: "Precipitation & Wildfires",
      text: "Lower precipitation years tend to have increased wildfire activity due to drier vegetation.",
      startProgress: 91,
      endProgress: 1000,
    },
    {
      year: "Climate Patterns",
      text: "Year-to-year precipitation variation shows California's vulnerability to drought cycles.",
      startProgress: 91,
      endProgress: 1000,
    },
  ];

  // Function to get scale for each fact based on its progress
  function getFactScale(fact) {
    if (!fact) return { fontSize: "1rem", opacity: 0 };

    // Calculate where we are in the fact's display range
    const range = fact.endProgress - fact.startProgress;
    const position = progress - fact.startProgress;
    const ratio = position / range;

    // Start large, then shrink as we approach endProgress
    const fontSize = Math.max(36 - 22 * ratio, 14) + "px";
    const opacity = Math.max(1 - 0.8 * ratio, 0.2);

    return { fontSize, opacity };
  }

  let visibleFacts = $derived(
    precipFacts.filter(
      (f) => progress >= f.startProgress && progress <= f.endProgress,
    ),
  );

  // Adjust visualization position based on screen size
  onMount(() => {
    // Get initial screen width
    screenWidth = window.innerWidth;

    // Update on resize
    const handleResize = () => {
      screenWidth = window.innerWidth;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });
</script>

<!-- Fixed Header (outside of Scroll) -->
<header class="fixed-top">
  <div class="container-fluid">
    <div class="menu-bar">
      <h1>GOLDEN STATE OF FIRE</h1>
      <!-- <p>{progress}</p> -->
      <div class="team-icon" onclick={() => (showTeam = !showTeam)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="#3e2c28"
        >
          <path
            d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 
               2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 
               10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 2.02 1.97 
               3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
          />
        </svg>
      </div>
    </div>

    <div class="horizontal-buttons">
      <div class="row">
        <div class="col-4">
          <button
            class="btn w-100 {activeSection === 'ENVIRONMENTAL'
              ? 'active-btn'
              : ''}"
            onclick={() => (activeSection = "ENVIRONMENTAL")}
          >
            ENVIRONMENTAL
          </button>
        </div>
        <div class="col-4">
          <button
            class="btn w-100 {activeSection === 'GEOGRAPHICAL'
              ? 'active-btn'
              : ''}"
            onclick={() => (activeSection = "GEOGRAPHICAL")}
          >
            GEOGRAPHICAL
          </button>
        </div>
        <div class="col-4">
          <button
            class="btn w-100 {activeSection === 'SEASONAL' ? 'active-btn' : ''}"
            onclick={() => (activeSection = "SEASONAL")}
          >
            SEASONAL
          </button>
        </div>
      </div>
    </div>

    {#if showTeam}
      <div class="team-members">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>GitHub</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Dipan Bag</td>
              <td>bag00003@umn.edu</td>
              <td>dipan99</td>
            </tr>
            <tr>
              <td>Aarav Kalkar</td>
              <td>kalka046@umn.edu</td>
              <td>aarav2703</td>
            </tr>
            <tr>
              <td>Brandt Kringlie</td>
              <td>kring089@umn.edu</td>
              <td>bkringlie</td>
            </tr>
            <tr>
              <td>Shane Lentsch</td>
              <td>lents084@umn.edu</td>
              <td>Shane-Lentsch</td>
            </tr>
            <tr>
              <td>Marc Scanlan</td>
              <td>scanl187@umn.edu</td>
              <td>scanl187</td>
            </tr>
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</header>

<main class="pt-5 mt-5">
  <div class="container-fluid">
    <div class="row">
      <!-- Left column for facts -->
      <div class="col-md-6">
        {#if activeSection == "GEOGRAPHICAL"}
          <div class="fixed-left-facts mt-custom">
            {#each wildfireVisibleFacts as fact (fact.year)}
              {@const scale = getFactScale(fact)}
              <div
                class="fact-box"
                in:fly={{ y: 50, duration: 600 }}
                out:fade={{ duration: 300 }}
                style="opacity: {scale.opacity}; transition: all 2s ease-in-out;"
              >
                <h3 style="font-size: {scale.fontSize};">{fact.year}</h3>
                <p
                  style="font-size: calc({scale.fontSize} * 0.7); white-space: pre-line;"
                >
                  {fact.text}
                </p>
              </div>
            {/each}
          </div>
        {/if}

        {#if activeSection == "SEASONAL"}
          <div class="fixed-left-facts mt-custom">
            {#each seasonalVisibleFacts as fact (fact.year)}
              {@const scale = getFactScale(fact)}
              <div
                class="fact-box"
                in:fly={{ y: 50, duration: 600 }}
                out:fade={{ duration: 300 }}
                style="opacity: {scale.opacity}; transition: all 2s ease-in-out;"
              >
                <h3 style="font-size: {scale.fontSize};">{fact.year}</h3>
                <p
                  style="font-size: calc({scale.fontSize} * 0.7); white-space: pre-line;"
                >
                  {fact.text}
                </p>
              </div>
            {/each}
          </div>
        {/if}

        {#if activeSection == "ENVIRONMENTAL"}
          <div class="fixed-left-facts mt-custom">
            {#each visibleFacts as fact (fact.year)}
              {@const scale = getFactScale(fact)}
              <div
                class="fact-box"
                in:fly={{ y: 50, duration: 600 }}
                out:fade={{ duration: 300 }}
                style="opacity: {scale.opacity}; transition: all 2s ease-in-out;"
              >
                <h3 style="font-size: {scale.fontSize};">{fact.year}</h3>
                <p style="font-size: calc({scale.fontSize} * 0.7);">
                  {fact.text}
                </p>
              </div>
            {/each}
          </div>
        {/if}

        {#if activeSection == "GEOGRAPHICAL"}
          {#if progress>=95}
          <div class="fixed-left-facts mt-custom">
            <div class="d-flex justify-content-start align-items-center">
              <a href="{base}/immersive">
                <img src="./earth.gif" alt="earthpic" style="height: 5rem; width: 5rem; margin-top:10rem; transition: all 2s ease-in-out;" />
              </a>
              <p style="margin-top:11rem; margin-left:2rem; transition: all 2s ease-in-out;">Try our immersive mode!</p>
            </div>
          </div>
          {/if}
        {/if}
      </div>

      <!-- Right column for question and visualizations -->
      <div class={questionContainerClass} style="transition: all 0.8s ease;">
        <Scroll bind:progress>
          <div id="virtual"></div>
          <div></div>
          <div slot="viz" class="viz-content mt-custom">
            <div class="content mt-5">
              {#if showQuestion}
                <p
                  class="question-text mt-5"
                  style="font-size: {Math.max(48 - progress * 5, 12)}px; 
                          padding: {Math.max(40 - progress * 4, 5)}px;
                          min-height: {Math.max(200 - progress * 20, 50)}px;
                          opacity: {Math.max(1 - progress * 0.1, 0.1)};"
                >
                  {questionText}
                </p>
              {/if}
            </div>
          </div>
        </Scroll>
      </div>

      <!-- Visualization section that appears at progress >= 10 -->
      <div class="col-md-6">
        {#if showVisualizations}
          <div
            class="fixed-right-visualizations"
            in:fly={{ x: 200, duration: 800, delay: 300 }}
          >
            <div class="viz-container mb-4 mt-4">
              {#if activeSection === "ENVIRONMENTAL"}
                <FireDurationAndPrecip {progress} />
              {:else if activeSection === "GEOGRAPHICAL"}
                <HexbinMap
                  csvPath="./fire_points_updated.csv"
                  geojsonPath="./california-counties.geojson"
                  {progress}
                />
              {:else if activeSection === "SEASONAL"}
                <Seasons
                  csvPath="./fire_climate_data.csv"
                  currentProgress={progress}
                />
              {/if}
              <p class="small text-muted">Progress: {progress}</p>
            </div>

            <div class="viz-container">
              {#if activeSection === "ENVIRONMENTAL"}
                <ParallelCoordsWithDualCharts {progress} />
              {:else if activeSection === "GEOGRAPHICAL"}
                <CountyHeatmap
                  csvPath="./fire_points_updated.csv"
                  initialStartYear={1992}
                  initialEndYear={2020}
                  initialTopN={5}
                  {progress}
                />
              {:else if activeSection === "SEASONAL"}
                <SeasonsOld
                  csvPath="./fire_climate_data.csv"
                  currentProgress={progress}
                />
              {/if}
              <p class="small text-muted">Progress: {progress}</p>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>

<style>
  :global(body),
  :global(html) {
    margin: 0;
    padding: 0;
    width: 100%;
    overflow-x: hidden;
  }

  /* Fixed header styling compatible with Bootstrap */
  header {
    width: 100%;
    background-color: #fef9f6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Bootstrap overrides for consistent design */
  .menu-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #dcd2c5;
    padding: 1rem 2rem;
    color: #3e2c28;
    font-weight: bold;
    letter-spacing: 1px;
  }

  .menu-bar h1 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    margin: 0 auto;
    text-align: center;
    flex: 1;
  }

  .team-icon {
    width: 32px;
    height: 32px;
    cursor: pointer;
    fill: #3e2c28;
    transition: transform 0.2s ease;
  }

  .team-icon:hover {
    transform: scale(1.2);
  }

  .horizontal-buttons {
    background-color: #fef9f6;
    padding: 10px 0;
  }

  .horizontal-buttons .btn {
    background-color: #cc5c3c;
    color: white;
    border: none;
    font-weight: 500;
    transition: background-color 0.3s ease;
  }

  .horizontal-buttons .btn:hover {
    background-color: #a9442e;
  }

  .horizontal-buttons .active-btn {
    background-color: #a9442e;
    font-weight: 700;
    transform: scale(1.02);
  }

  /* Virtual height for scrolling */
  #virtual {
    height: 300vh;
    background-color: #fef9f6;
  }

  /* Question expanded state */
  .question-expanded {
    margin: 0 auto;
  }

  /* Facts styling */
  .fixed-left-facts {
    position: fixed;
    top: 140px; /* Adjust based on header height */
    left: 20px;
    width: calc(50% - 30px); /* Half of screen minus some padding */
    display: flex;
    flex-direction: column;
    gap: 20px;
    z-index: 100;
    max-height: calc(100vh - 160px); /* Calculate height to fit screen */
    overflow-y: auto; /* Allow scrolling if facts are tall */
  }

  .fact-box {
    background-color: rgba(204, 92, 60, 0.1);
    border-left: 4px solid #cc5c3c;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .fact-box h3 {
    color: #a9442e;
    margin-bottom: 10px;
    transition: all 0.5s ease-in-out;
  }

  .fact-box p {
    color: #3e2c28;
    margin-bottom: 0;
    transition: all 0.5s ease-in-out;
  }

  /* Fixed visualizations on the right */
  .fixed-right-visualizations {
    position: fixed;
    top: 140px; /* Adjust based on header height */
    right: 20px;
    width: calc(50% - 30px); /* Half of screen minus some padding */
    display: flex;
    flex-direction: column;
    gap: 20px;
    z-index: 100;
    max-height: calc(100vh - 160px); /* Calculate height to fit screen */
    overflow-y: auto; /* Allow scrolling if visualizations are tall */
  }

  /* Handle responsive layout */
  @media (max-width: 768px) {
    .fixed-right-visualizations,
    .fixed-left-facts {
      position: static;
      width: 100%;
      margin-top: 20px;
    }
  }

  .viz-container {
    background-color: #ebe5df;
    border: 1px solid #d4c2b1;
    border-radius: 8px;
    color: #3e2c28;
    padding: 1rem;
    width: 100%;
  }

  /* Content area */
  .content {
    padding: 10px 20px;
    text-align: center;
    color: #5c3b2e;
  }

  /* Team members popup styling */
  .team-members {
    background-color: #fef9f6;
    color: #3e2c28;
    border: 1px solid #dcd2c5;
    border-radius: 10px;
    padding: 1rem;
    margin: 1rem auto;
    max-width: 90%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1001;
    animation: fadeIn 0.3s ease-in-out;
  }

  .mt-custom {
    margin-top: 4rem;
  }

  .question-text {
    transition: all 0.5s ease-in-out;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2rem;
    font-weight: 500;
    line-height: 1.4;
    max-width: 90%;
    margin-left: auto;
    margin-right: auto;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px) translateX(-50%);
    }
    to {
      opacity: 1;
      transform: translateY(0) translateX(-50%);
    }
  }
</style>
