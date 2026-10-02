(function () {
  const FRAME_COUNT = 302;
  const images = new Array(FRAME_COUNT);
  const stage = document.createElement("canvas");
  stage.id = "stage";
  stage.className = "scroll-stage";
  document.body.prepend(stage);

  const ctx = stage.getContext("2d", { alpha: false });
  let current = 0;
  let shown = -1;

  function frameSrc(index) {
    return "frames/frame_" + String(index + 1).padStart(4, "0") + ".jpg";
  }

  function layout() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = Math.round(width * dpr);
    const nextHeight = Math.round(height * dpr);
    if (stage.width !== nextWidth || stage.height !== nextHeight) {
      stage.width = nextWidth;
      stage.height = nextHeight;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      shown = -1;
    }
  }

  function scrollTarget() {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / max));
    return progress * (FRAME_COUNT - 1);
  }

  function nearest(index) {
    if (images[index]) return index;
    for (let distance = 1; distance < FRAME_COUNT; distance += 1) {
      const before = index - distance;
      const after = index + distance;
      if (before >= 0 && images[before]) return before;
      if (after < FRAME_COUNT && images[after]) return after;
    }
    return -1;
  }

  function draw(img) {
    const canvasWidth = stage.width;
    const canvasHeight = stage.height;
    const imageRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvasWidth / canvasHeight;
    let drawWidth;
    let drawHeight;
    if (imageRatio > canvasRatio) {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imageRatio;
    } else {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imageRatio;
    }
    ctx.drawImage(
      img,
      (canvasWidth - drawWidth) / 2,
      (canvasHeight - drawHeight) / 2,
      drawWidth,
      drawHeight
    );
  }

  function render() {
    const index = nearest(Math.round(current));
    if (index < 0 || index === shown) return;
    shown = index;
    draw(images[index]);
  }

  function sync() {
    current = scrollTarget();
    render();
  }

  function loadImage(index) {
    if (images[index]) return Promise.resolve();
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        images[index] = img;
        const wanted = Math.round(current);
        if (!images[wanted] || shown !== wanted) {
          shown = -1;
          sync();
        }
        img.decode().catch(() => {});
        resolve();
      };
      img.onerror = () => resolve();
      img.src = frameSrc(index);
    });
  }

  async function runQueue(indices, concurrency) {
    let cursor = 0;
    async function worker() {
      while (cursor < indices.length) {
        const index = indices[cursor];
        cursor += 1;
        await loadImage(index);
      }
    }
    const workers = [];
    const count = Math.min(concurrency, indices.length);
    for (let i = 0; i < count; i += 1) workers.push(worker());
    await Promise.all(workers);
  }

  async function loadAll() {
    await loadImage(0);
    shown = -1;
    render();
    const stride = [];
    for (let index = 0; index < FRAME_COUNT; index += 6) stride.push(index);
    await runQueue(stride, 6);
    const rest = [];
    for (let index = 0; index < FRAME_COUNT; index += 1) {
      if (!images[index]) rest.push(index);
    }
    await runQueue(rest, 8);
  }

  layout();
  window.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("resize", () => {
    layout();
    sync();
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
      layout();
      sync();
    });
  }
  setInterval(sync, 32);
  loadAll();
})();
