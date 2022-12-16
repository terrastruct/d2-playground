function init() {
  document.getElementById("modal-close").addEventListener("click", close);
  document.getElementById("modal-secondary-option").addEventListener("click", close);
}

let primaryCallback;

function show(headerString, contentHTML, primaryActionText, primaryActionCallback) {
  document.getElementById("modal-header").textContent = headerString;
  document.getElementById("modal-content").innerHTML = contentHTML;
  document.getElementById("modal").style.display = "block";
  document.getElementById("modal-primary-option").textContent = primaryActionText;
  document
    .getElementById("modal-primary-option")
    .addEventListener("click", primaryActionCallback);
  primaryCallback = primaryActionCallback;
}

function close() {
  if (primaryCallback) {
    document
      .getElementById("modal-primary-option")
      .removeEventListener("click", primaryCallback);
    primaryCallback = null;
  }
  document.getElementById("modal").style.display = "none";
}

export default {
  show,
  close,
  init,
};
