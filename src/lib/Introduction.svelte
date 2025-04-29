<script>
    import { onMount } from "svelte";
  
    // Track intro section height for parent component
    let introHeight;
  
    // Initialize counter animations when component is mounted
    onMount(() => {
      const counters = document.querySelectorAll('.counter');
      
      counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        
        let current = 0;
        
        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.innerText = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
          } else {
            counter.innerText = target.toLocaleString();
          }
        };
        
        // Start counter animation when visible in viewport
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            updateCounter();
            observer.disconnect();
          }
        });
        
        observer.observe(counter);
      });
  
      // Dispatch event to parent when intro section is measured
      if (introHeight) {
        dispatchEvent(new CustomEvent('introHeightUpdated', { 
          detail: { height: introHeight }
        }));
      }
    });
    
    // Update height when element resizes and dispatch event
    function updateHeight(node) {
      introHeight = node.offsetHeight;
      dispatchEvent(new CustomEvent('introHeightUpdated', { 
        detail: { height: introHeight }
      }));
    }
  
    // Allow parent component to bind to this value
    export { introHeight };
  </script>
  
  <!-- Introduction Section -->
  <div class="introduction-section" bind:offsetHeight={introHeight} use:updateHeight>
    <!-- Animated fire background -->
    <div class="fire-background">
      <div class="ember-particle"></div>
      <div class="ember-particle"></div>
      <div class="ember-particle"></div>
      <div class="ember-particle"></div>
      <div class="ember-particle"></div>
      <div class="ember-particle"></div>
      <div class="ember-particle"></div>
      <div class="ember-particle"></div>
      <div class="ember-particle"></div>
      <div class="ember-particle"></div>
      <div class="ember-particle"></div>
      <div class="ember-particle"></div>
      <div class="ember-particle"></div>
      <div class="ember-particle"></div>
      <div class="ember-particle"></div>
      <div class="ember-particle"></div>
      <div class="ember-particle"></div>
      <div class="ember-particle"></div>
      <div class="ember-particle"></div>
    </div>
  
    <div class="fire-animation">
      <div class="flames">
        <div class="flame"></div>
        <div class="flame"></div>
        <div class="flame"></div>
        <div class="flame"></div>
      </div>
      <div class="logs"></div>
    </div>
    
    <div class="intro-content">
      <h3><span class="fire-text">California Ablaze:</span> A State in Crisis</h3>
      
      <div class="stats-dashboard">
        <div class="stat-card">
          <span class="counter" data-target="4200000">0</span>
          <span class="stat-label">acres burned in 2020</span>
        </div>
        <div class="stat-card">
          <span class="counter" data-target="9639">0</span>
          <span class="stat-label">structures destroyed</span>
        </div>
        <div class="stat-card">
          <span class="counter" data-target="31">0</span>
          <span class="stat-label">lives lost in 2020</span>
        </div>
      </div>
      
      <p>
        Wildfires in California have transformed from seasonal events to year-round threats, 
        devastating communities and ecosystems at an unprecedented scale. This visualization 
        uncovers the perfect storm of factors fueling this crisis.
      </p>
      <p>
        <strong>Explore the data</strong> to understand how geographical patterns, 
        seasonal shifts, and environmental conditions are converging to create 
        California's new normal.
      </p>
      
      <div class="scroll-indicator">
        <span>Discover the story</span>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z" fill="#cc5c3c"/>
        </svg>
      </div>
    </div>
  </div>
  
  <style>
    /* Introduction section styling */
    .introduction-section {
      height: 100vh;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 2rem;
      background-color: #fef9f6;
      position: relative;
      z-index: 5;
      overflow: hidden;
    }
  
    /* Fire background */
    .fire-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      background: linear-gradient(0deg, rgba(254,249,246,1) 0%, rgba(254,249,246,0.9) 85%, rgba(204,92,60,0.1) 100%);
    }
  
    /* Ember particles */
    .ember-particle {
      position: absolute;
      width: 12px;
      height: 12px;
      background-color: #cc5c3c;
      border-radius: 50%;
      filter: blur(1px);
      opacity: 0;
      animation: float 15s infinite ease-in-out;
    }
  
    .ember-particle:nth-child(1) { left: 10%; top: 70%; animation-delay: 0s; }
    .ember-particle:nth-child(2) { left: 20%; top: 80%; animation-delay: 2s; }
    .ember-particle:nth-child(3) { left: 35%; top: 75%; animation-delay: 4s; }
    .ember-particle:nth-child(4) { left: 50%; top: 85%; animation-delay: 1s; }
    .ember-particle:nth-child(5) { left: 65%; top: 70%; animation-delay: 7s; }
    .ember-particle:nth-child(6) { left: 80%; top: 75%; animation-delay: 6s; }
    .ember-particle:nth-child(7) { left: 30%; top: 90%; animation-delay: 3s; }
    .ember-particle:nth-child(8) { left: 70%; top: 85%; animation-delay: 5s; }
    .ember-particle:nth-child(9) { left: 90%; top: 80%; animation-delay: 8s; }
    .ember-particle:nth-child(10) { left: 15%; top: 65%; animation-delay: 1.5s; }
    .ember-particle:nth-child(11) { left: 25%; top: 60%; animation-delay: 3.5s; }
    .ember-particle:nth-child(12) { left: 40%; top: 80%; animation-delay: 5.5s; }
    .ember-particle:nth-child(13) { left: 55%; top: 65%; animation-delay: 2.5s; }
    .ember-particle:nth-child(14) { left: 60%; top: 75%; animation-delay: 4.5s; }
    .ember-particle:nth-child(15) { left: 75%; top: 60%; animation-delay: 6.5s; }
    .ember-particle:nth-child(16) { left: 85%; top: 70%; animation-delay: 1.5s; }
    .ember-particle:nth-child(17) { left: 20%; top: 85%; animation-delay: 7.5s; }
    .ember-particle:nth-child(18) { left: 45%; top: 55%; animation-delay: 3.5s; }
    .ember-particle:nth-child(19) { left: 65%; top: 85%; animation-delay: 5.5s; }
    
    @keyframes float {
      0% { transform: translateY(0); opacity: 0; }
      10% { opacity: 0.8; }
      100% { transform: translateY(-100vh); opacity: 0; }
    }
  
    /* Fire animation */
    .fire-animation {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      z-index: 0;
      height: 240px;
      width: 240px;
      opacity: 0.6;
    }
  
    .flames {
      position: absolute;
      bottom: 40%;
      left: 50%;
      width: 60%;
      height: 60%;
      transform: translateX(-50%) rotate(-45deg);
    }
  
    .flame {
      position: absolute;
      right: 0%;
      bottom: 0%;
      width: 80%;
      height: 80%;
      border-radius: 50% 0% 50% 50%;
      background: linear-gradient(to right, #ff8c3b, #ff5e3a);
      transform: rotate(45deg) scale(1.5, 1.5);
      animation: flicker 3s infinite;
    }
  
    .flame:nth-child(2) {
      width: 60%;
      height: 60%;
      right: 5%;
      bottom: 20%;
      background: linear-gradient(to right, #ffca62, #ff8c3b);
      animation-delay: 0.5s;
      animation-duration: 2.8s;
    }
  
    .flame:nth-child(3) {
      width: 40%;
      height: 40%;
      right: 20%;
      bottom: 30%;
      background: linear-gradient(to right, #fff, #ffca62);
      animation-delay: 1s;
      animation-duration: 2.5s;
    }
  
    .flame:nth-child(4) {
      width: 70%;
      height: 70%;
      right: 10%;
      bottom: 10%;
      background: linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,94,58,0.5));
      animation-delay: 1.5s;
      animation-duration: 3.2s;
    }
  
    @keyframes flicker {
      0%, 100% { transform: rotate(45deg) scale(1.5, 1.5); opacity: 0.8; }
      25% { transform: rotate(42deg) scale(1.4, 1.6); opacity: 0.9; }
      50% { transform: rotate(48deg) scale(1.6, 1.4); opacity: 1; }
      75% { transform: rotate(45deg) scale(1.5, 1.5); opacity: 0.8; }
    }
  
    .logs {
      position: absolute;
      bottom: 20%;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      height: 20%;
      background: linear-gradient(#3a241d, #5d4037);
      border-radius: 5px;
    }
  
    .intro-content {
      max-width: 800px;
      margin: 0 auto;
      position: relative;
      z-index: 10;
    }
  
    .intro-content h3 {
      color: #cc5c3c;
      font-size: 3.2rem;
      margin-bottom: 1.5rem;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
  
    .fire-text {
      background: linear-gradient(45deg, #cc5c3c, #ffc107);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      position: relative;
    }
  
    .intro-content p {
      color: #3e2c28;
      font-size: 1.2rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
  
    /* Statistics counter */
    .stats-dashboard {
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: 1rem;
      margin: 2rem 0;
    }
  
    .stat-card {
      background-color: rgba(255,255,255,0.2);
      backdrop-filter: blur(5px);
      border-radius: 10px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 200px;
      box-shadow: 0 4px 15px rgba(204,92,60,0.15);
      border-left: 3px solid #cc5c3c;
      transition: transform 0.3s ease;
    }
  
    .stat-card:hover {
      transform: translateY(-5px);
    }
  
    .counter {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(45deg, #cc5c3c, #ffc107);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      margin-bottom: 0.5rem;
    }
  
    .stat-label {
      font-size: 1rem;
      color: #3e2c28;
      text-align: center;
    }
  
    /* Scroll indicator */
    .scroll-indicator {
      position: absolute;
      bottom: -14rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: bounce 2s infinite;
      color: #cc5c3c;
      font-weight: 500;
    }
  
    .scroll-indicator span {
      margin-bottom: 0.5rem;
    }
  
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0) translateX(-50%);
      }
      40% {
        transform: translateY(-20px) translateX(-50%);
      }
      60% {
        transform: translateY(-10px) translateX(-50%);
      }
    }
  
    /* Responsive styles */
    @media (max-width: 768px) {
      .introduction-section {
        height: auto;
        min-height: 100vh;
      }
      
      .intro-content h3 {
        font-size: 2rem;
      }
  
      .counter {
        font-size: 2.5rem;
      }
      
      .intro-content p {
        font-size: 1rem;
      }
    }
  </style>
