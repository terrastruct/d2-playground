// Alert is the top bar that shows up to indicate a recoverable error occurred
// TODO add a dismiss button
let timeout;

function show(msg, duration) {
  if (timeout) {
    clearTimeout(timeout);
  }

  document.getElementById("notification").classList.remove("notification-inactive");
  document.getElementById("notification-message").innerHTML = msg;

  timeout = setTimeout(() => {
    document.getElementById("notification").classList.add("notification-inactive");
    timeout = null;
  }, duration);
}

export default {
  show,
};
