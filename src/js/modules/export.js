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
    toggleASCIIMenu();
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
    exportBtn.innerHTML = 'Copy<img src="assets/icons/down.svg" class="btn-icon" />';
    setupASCIIMenu();
  } else {
    exportBtn.innerHTML = 'Export<img src="assets/icons/down.svg" class="btn-icon" />';
    setupExportMenu();
  }
}

function setupASCIIMenu() {
  const exportMenu = document.getElementById("export-menu");
  exportMenu.innerHTML = `
    <div id="export-menu-ascii-extended" class="btn-menu-item">Extended ASCII</div>
    <div id="export-menu-ascii-standard" class="btn-menu-item">Standard ASCII</div>
  `;

  document
    .getElementById("export-menu-ascii-extended")
    .addEventListener("click", copyASCIIExtended);
  document
    .getElementById("export-menu-ascii-standard")
    .addEventListener("click", copyASCIIStandard);
}

function setupExportMenu() {
  const exportMenu = document.getElementById("export-menu");
  exportMenu.innerHTML = `
    <div id="export-menu-png" class="btn-menu-item">PNG</div>
    <div id="export-menu-svg" class="btn-menu-item">SVG</div>
    <div id="export-menu-png-clipboard" class="btn-menu-item">PNG (copy)</div>
    <div id="export-menu-svg-clipboard" class="btn-menu-item">SVG (copy)</div>
  `;

  document.getElementById("export-menu-png").addEventListener("click", exportPNG);
  document.getElementById("export-menu-svg").addEventListener("click", exportSVG);

  if (!Mobile.is()) {
    document
      .getElementById("export-menu-png-clipboard")
      .addEventListener("click", exportPNGClipboard);
    document
      .getElementById("export-menu-svg-clipboard")
      .addEventListener("click", exportSVGClipboard);
  } else {
    document.getElementById("export-menu-png-clipboard").style.display = "none";
    document.getElementById("export-menu-svg-clipboard").style.display = "none";
  }
}

function toggleASCIIMenu() {
  const menu = document.getElementById("export-menu");
  if (menu.style.display == "none") {
    menu.style.display = "block";
  } else {
    menu.style.display = "none";
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

async function copyASCIIExtended() {
  hideMenu();
  const ascii = await renderASCII("extended");
  if (!ascii) return;

  try {
    await navigator.clipboard.writeText(ascii);
    Alert.show(`Extended ASCII copied to clipboard`, 2000, "success");
  } catch (e) {
    Alert.show(`Failed to copy to clipboard: ${e}`, 4000);
  }
}

async function copyASCIIStandard() {
  hideMenu();
  const ascii = await renderASCII("standard");
  if (!ascii) return;

  try {
    await navigator.clipboard.writeText(ascii);
    Alert.show(`Standard ASCII copied to clipboard`, 2000, "success");
  } catch (e) {
    Alert.show(`Failed to copy to clipboard: ${e}`, 4000);
  }
}

async function renderASCII(mode) {
  const script = Editor.getScript();
  if (!script) {
    Alert.show(`Compile a diagram to copy`, 4000);
    return null;
  }

  try {
    const compileRequest = {
      fs: { index: script },
      options: {
        layout: "elk",
        sketch: false,
        ascii: true,
        asciiMode: mode,
        forceAppendix: false,
        target: "",
        animateInterval: 0,
        salt: "",
        noXMLTag: false,
      },
    };

    const compiled = await window.d2.compile(compileRequest);
    const renderOptions = {
      ascii: true,
      asciiMode: mode,
      center: true,
    };

    return await window.d2.render(compiled.diagram, renderOptions);
  } catch (err) {
    Alert.show(`Failed to render ASCII: ${err.message}`, 4000);
    return null;
  }
}

export default {
  init,
  updateExportButton,
};
