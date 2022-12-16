// TODO consider implementing terrastruct's zoom UX (limited scroll box)
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 15;

let panzoomInstance;

function init() {
  document.getElementById("zoom").addEventListener("click", toggleZoom);
  document.getElementById("zoom-slider").addEventListener("input", onZoomSlider);
  document.getElementById("zoom-fit-btn").addEventListener("click", onZoomFit);
  document.getElementById("zoom-menu").addEventListener("mouseleave", hideMenu);
  setZoomSlider(1);
}

function hideMenu() {
  document.getElementById("zoom-menu").style.display = "none";
}

function attach() {
  const el = document.getElementById("diagram");
  if (panzoomInstance) {
    panzoomInstance.dispose();
  }

  panzoomInstance = panzoom(el, {
    maxZoom: MAX_ZOOM,
    minZoom: MIN_ZOOM,
    // Prevent zooming on scroll
    // Doesn't affect pinching btw, which has ctrlKey set for some reason
    beforeWheel: function(e) {
      return !e.ctrlKey;
    }
  });
  panzoomInstance.on('zoom', function(e) {
    if (isShowingZoom() && document.activeElement !== document.getElementById("zoom-slider")) {
      // TODO maybe throttle
      setZoomSlider(e.getTransform().scale)
    }
  });
}

function onZoomFit() {
  const el = document.getElementById("diagram");
  if (!el) {
    return;
  }
  panzoomInstance.zoomAbs(0, 0, 1);
  panzoomInstance.moveTo(0, 0);
}

function toggleZoom() {
  if (isShowingZoom()) {
    document.getElementById("zoom-menu").style.display = "none";
  } else {
    // only show zoom is there is a diagram
    const el = document.getElementById("diagram");
    if (!el) {
      return;
    }

    document.getElementById("zoom-menu").style.display = "flex";
    setZoomSlider(panzoomInstance.getTransform().scale)
  }
}

function isShowingZoom() {
  return document.getElementById("zoom-menu").style.display !== "none";
}

function setZoomSlider(val) {
  const percentage = ((val - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100;
  document.getElementById("zoom-slider").style.background = `linear-gradient(to right, #6b8afb ${percentage}%, #d8dce9 ${percentage}%)`;
  document.getElementById("zoom-slider").value = val;
}

function onZoomSlider(e) {
  const el = document.getElementById("diagram");
  if (!el) {
    return;
  }

  const width = parseInt(el.getAttribute("width"));
  const height = parseInt(el.getAttribute("height"));

  const desiredZoom = parseFloat(e.target.value);

  // TODO this zooms to center, of diagram, but it'd be nice to zoom to center of viewport
  const origin = panzoomInstance.getTransform();

  const cx = origin.x + (width*origin.scale)/2;
  const cy = origin.y + (height*origin.scale)/2;

  panzoomInstance.zoomAbs(cx, cy, desiredZoom);

  const percentage = ((desiredZoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100;
  document.getElementById("zoom-slider").style.background = `linear-gradient(to right, #6b8afb ${percentage}%, #d8dce9 ${percentage}%)`;
}

export default {
  init,
  attach,
  MIN_ZOOM,
  MAX_ZOOM,
}
