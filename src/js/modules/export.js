import Alert from "./alert.js";

function init() {
  document.getElementById("export-btn").addEventListener("click", toggleMenu);
  document.getElementById("export-menu").addEventListener("mouseleave", hideMenu);
  document.getElementById("export-menu-png").addEventListener("click", exportPNG);
  document.getElementById("export-menu-svg").addEventListener("click", exportSVG);
}

function toggleMenu() {
  const menu = document.getElementById("export-menu");
  if (menu.style.display == "none") {
    menu.style.display = "block";
  } else {
    menu.style.display = "none";
  }
}

function hideMenu() {
  document.getElementById("export-menu").style.display = "none";
}

// TODO these don't download on mobile
//
function exportSVG() {
  hideMenu();

  const renderEl = document.getElementById("render-svg");
  const svg = renderEl.innerHTML;
  if (svg == "") {
    Alert.show(`Compile a diagram to export`, 4000);
    return;
  }

  const blob = new Blob([renderEl.innerHTML], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const dl = document.createElement("a");
  dl.href = url;
  dl.download = "d2.svg";
  document.body.appendChild(dl);
  dl.click();
  document.body.removeChild(dl);
}

async function exportPNG() {
  hideMenu();

  const renderEl = document.getElementById("render-svg");
  const svg = renderEl.innerHTML;
  if (svg == "") {
    Alert.show(`Compile a diagram to export`, 4000);
    return;
  }
  const svgEl = document.getElementById("diagram");
  const width = svgEl.getAttribute("width").slice(0, -2) * window.devicePixelRatio;
  const height = svgEl.getAttribute("height").slice(0, -2) * window.devicePixelRatio;

  // TODO online says I need XMLSerializer().serializeToString(svgEl)
  // but it works without that. Revisit in case bugs.
  const encoded = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));

  const tempImg = new Image();
  const loadImage = () => {
    return new Promise((resolve, reject) => {
      tempImg.onload = (event) => resolve(event.currentTarget);
      tempImg.onerror = () => {
        reject("error loading string as an image");
      };
      tempImg.src = encoded;
    });
  };
  const img = await loadImage();
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const pngData = canvas.toDataURL("image/png");

  const dl = document.createElement("a");
  dl.href = pngData;
  dl.download = "d2.png";
  document.body.appendChild(dl);
  dl.click();
  document.body.removeChild(dl);
}

export default {
  init,
};
