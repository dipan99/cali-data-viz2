<script>
    const { scaleFactor } = $props();
    const fireSource = "./open-fire-11190_256.gif";
  </script>
  
  <div class="fire-wrapper" style="transform: scaleY({scaleFactor});">
    <div class="fire-container">
      <img src={fireSource} alt="Fire" class="fire fire-1" />
      <img src={fireSource} alt="Fire" class="fire fire-2" />
      <img src={fireSource} alt="Fire" class="fire fire-2-1" />
      <img src={fireSource} alt="Fire" class="fire fire-3" />
      <img src={fireSource} alt="Fire" class="fire fire-3-1" />
      <img src={fireSource} alt="Fire" class="fire fire-4" />
    </div>
  </div>
  
  <style>
    .fire-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  
    .fire-container {
      display: flex;
      padding-top: 2.5em;
      overflow: hidden;
      width: 200px;
      height: 225px;
    }
  
    .fire {
      width: 120px;
      height: 150px;
    }
  
    .fire-2 {
      margin-left: -100px;
      height: 250px;
      transform: translate(-10px, -60px);
    }
  
    .fire-2-1 {
      margin-left: -120px;
      height: 350px;
      transform: translate(10px, -140px);
      z-index: 1;
    }
  
    .fire-3 {
      margin-left: -100px;
      height: 200px;
      width: 130px;
    }
  
    .fire-3-1 {
      margin-left: -100px;
      height: 280px;
      width: 130px;
      transform: translate(-10px, -80px);
      z-index: -3;
    }
  
    .fire-4 {
      left: 90%;
      top: 100%;
      transform: translate(-110px, 20px);
      z-index: -1;
    }
  </style>
  