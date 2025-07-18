// Alert is the top bar that shows up to indicate a recoverable error occurred
// TODO add a dismiss button
let timeout;

function show(msg, duration, type = "error") {
  if (timeout) {
    clearTimeout(timeout);
  }

  const notification = document.getElementById("notification");
  notification.classList.remove("notification-inactive", "notification-success");

  if (type === "success") {
    notification.classList.add("notification-success");
  }

  document.getElementById("notification-message").innerHTML = msg;

  timeout = setTimeout(() => {
    notification.classList.add("notification-inactive");
    notification.classList.remove("notification-success");
    timeout = null;
  }, duration);
}

export default {
  show,
};
