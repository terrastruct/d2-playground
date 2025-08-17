import Alert from "./alert.js";
import Editor from "./editor.js";
import Sketch from "./sketch.js";
import Mobile from "../lib/mobile.js";

function init() {
  document.getElementById("export-btn").addEventListener("click", handleExportClick);
  document.getElementById("export-menu").addEventListener("mouseleave", hideMenu);
  document.getElementById("export-menu-png").addEventListener("click", exportPNG);
  document.getElementById("export-menu-svg").addEventListener("click", exportSVG);

  // Hide clipboard options on mobile devices
  if (Mobile.is()) {
    document.getElementById("export-menu-png-clipboard").style.display = "none";
    document.getElementById("export-menu-svg-clipboard").style.display = "none";
  } else {
    document
      .getElementById("export-menu-png-clipboard")
      .addEventListener("click", exportPNGClipboard);
    document
      .getElementById("export-menu-svg-clipboard")
      .addEventListener("click", exportSVGClipboard);
  }
}

function handleExportClick() {
  if (Sketch.getASCII()) {
    copyASCII();
  } else {
    toggleMenu();
  }
}

function updateExportButton() {
  const exportBtn = document.getElementById("export-btn");
  const exportMenu = document.getElementById("export-menu");

  if (!exportBtn || !exportMenu) {
    return;
  }

  if (Sketch.getASCII()) {
    exportBtn.textContent = "Copy";
    exportMenu.style.display = "none";
  } else {
    exportBtn.innerHTML = 'Export<img src="assets/icons/down.svg" class="btn-icon" />';
  }
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
  const svgEl = document.querySelector(".d2-svg");
  if (!svgEl) {
    Alert.show(`No diagram found to export`, 4000);
    return;
  }

  const viewBox = svgEl.getAttribute("viewBox").split(" ");
  const width = parseFloat(viewBox[2]) * window.devicePixelRatio;
  const height = parseFloat(viewBox[3]) * window.devicePixelRatio;

  const blob = new Blob([new XMLSerializer().serializeToString(svgEl)], {
    type: "image/svg+xml",
  });
  const encoded = URL.createObjectURL(blob);

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
      `Converting to PNG failed: ${e}. Please help improve D2 by sharing this link on&nbsp;<a href="https://github.com/terrastruct/d2/issues/new?body=${encodeURIComponent(
        window.location.href
      )}">Github</a>.`,
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

async function exportSVGClipboard() {
  hideMenu();

  const svg = Editor.getDiagramSVG();
  if (svg == "") {
    Alert.show(`Compile a diagram to export`, 4000);
    return;
  }

  try {
    await navigator.clipboard.writeText(svg);
    Alert.show(`SVG copied to clipboard`, 2000, "success");
  } catch (e) {
    Alert.show(`Failed to copy SVG to clipboard: ${e}`, 4000);
  }
}

async function exportPNGClipboard() {
  hideMenu();

  const svg = Editor.getDiagramSVG();
  if (svg == "") {
    Alert.show(`Compile a diagram to export`, 4000);
    return;
  }

  if (!navigator.clipboard || !navigator.clipboard.write) {
    Alert.show(`Clipboard API not supported in this browser`, 4000);
    return;
  }

  const svgEl = document.querySelector(".d2-svg");
  if (!svgEl) {
    Alert.show(`No diagram found to export`, 4000);
    return;
  }

  const viewBox = svgEl.getAttribute("viewBox").split(" ");
  const width = parseFloat(viewBox[2]) * window.devicePixelRatio;
  const height = parseFloat(viewBox[3]) * window.devicePixelRatio;

  const blob = new Blob([new XMLSerializer().serializeToString(svgEl)], {
    type: "image/svg+xml",
  });
  const encoded = URL.createObjectURL(blob);

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
      `Converting to PNG failed: ${e}. Please help improve D2 by sharing this link on&nbsp;<a href="https://github.com/terrastruct/d2/issues/new?body=${encodeURIComponent(
        window.location.href
      )}">Github</a>.`,
      4000
    );
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(async (blob) => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      Alert.show(`PNG copied to clipboard`, 2000, "success");
    } catch (e) {
      Alert.show(`Failed to copy PNG to clipboard: ${e}`, 4000);
    }
  }, "image/png");
}

async function copyASCII() {
  const ascii = Editor.getDiagramSVG();
  if (ascii == "") {
    Alert.show(`Compile a diagram to copy`, 4000);
    return;
  }

  try {
    await navigator.clipboard.writeText(ascii);
    Alert.show(`Copied to clipboard`, 2000, "success");
  } catch (e) {
    Alert.show(`Failed to copy to clipboard: ${e}`, 4000);
  }
}

export default {
  init,
  updateExportButton,
};
