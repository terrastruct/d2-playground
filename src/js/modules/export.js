import Alert from "./alert.js";
import Editor from "./editor.js";

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
function exportSVG() {
  hideMenu();

  const svg = Editor.getDiagramSVG();
  if (svg == "") {
    Alert.show(`Compile a diagram to export`, 4000);
    return;
  }

  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
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

  const svg = Editor.getDiagramSVG();
  if (svg == "") {
    Alert.show(`Compile a diagram to export`, 4000);
    return;
  }
  const svgEl = document.getElementById("d2-svg");

  const viewBox = svgEl.getAttribute("viewBox").split(" ");
  const width = parseFloat(viewBox[2]) * window.devicePixelRatio;
  const height = parseFloat(viewBox[3]) * window.devicePixelRatio;

  const encoded =
    "data:image/svg+xml;base64," +
    btoa(unescape(encodeURIComponent(new XMLSerializer().serializeToString(svgEl))));

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
  let img;
  try {
    img = await loadImage();
  } catch (e) {
    Alert.show(
      `Converting to PNG failed: ${e}. Please help improve D2 by sharing this link on&nbsp;<a href="https://github.com/terrastruct/d2/issues/new">Github</a>.`,
      4000
    );
    return;
  }
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
