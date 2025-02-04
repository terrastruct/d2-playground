/* 
  JS file for managing light / dark themes
  The toggle_theme(); function toggles the saved theme and updates the screen accordingly
  The remove_theme(); function removes the theme from localstorage and only updates the screen if it doesn't match the system settings
  The window.matchMedia(); function call watches for updates to system settings to keep localstorage settings accurate

  Cre: some1and2 https://stackoverflow.com/a/76795904/9122512
*/

/**
 * Determines the system's preferred color scheme theme.
 * @returns {string} Returns 'dark' if system preference is dark mode, 'light' if system preference is light mode
 */
function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Toggles between light and dark theme in local storage.
 * If no theme is set in local storage, gets system theme as default.
 * If current theme is light, sets it to dark and vice versa.
 * @returns {void}
 */
function toggleSavedTheme() {
  const theme = localStorage.getItem("theme") || getSystemTheme();

  // Sets the stored value as the opposite
  localStorage.setItem("theme", theme === "dark" ? "light" : "dark");
}

/**
 * NOTE: this approach only worked with same origin CSS files.
 *
 * Switches the color scheme rules in index.html all stylesheets between light and dark themes.
 * Iterates through each stylesheet and its CSS rules, looking for media queries containing
 * "prefers-color-scheme". When found, it swaps "light" with "dark" or vice versa in the
 * media query text.
 * The idea is that it will feel as though the themes switched even if they haven't.
 *
 * @throws {Error} Logs a warning to console if unable to process a stylesheet
 * @returns {void}
 */
function switchThemeRules() {
  // index.html
  const mediaElements = document.querySelectorAll('[media^="(prefers-color-scheme"]');
  if (mediaElements.length > 0) {
    mediaElements.forEach((element) => {
      const ruleMedia = element.getAttribute("media");
      const newRuleMedia = ruleMedia.includes("light")
        ? ruleMedia.replace("light", "dark")
        : ruleMedia.replace("dark", "light");
      element.setAttribute("media", newRuleMedia);
    });
  }

  // CSS files
  for (let sheetFile = 0; sheetFile < document.styleSheets.length; sheetFile++) {
    try {
      for (
        let sheetRule = 0;
        sheetRule < document.styleSheets[sheetFile].cssRules.length;
        sheetRule++
      ) {
        const rule = document.styleSheets[sheetFile].cssRules[sheetRule];

        if (rule && rule.media && rule.media.mediaText.includes("prefers-color-scheme")) {
          const ruleMedia = rule.media.mediaText;
          const newRuleMedia = ruleMedia.includes("light")
            ? ruleMedia.replace("light", "dark")
            : ruleMedia.includes("dark")
            ? ruleMedia.replace("dark", "light")
            : (() => {
                throw new Error(`Invalid media query: ${ruleMedia}`);
              })();
          rule.media.deleteMedium(ruleMedia);
          rule.media.appendMedium(newRuleMedia);
        }
      }
    } catch (e) {
      const brokenSheet = document.styleSheets[sheetFile].href;
      console.warn(brokenSheet + " broke something with theme toggle : " + e);
    }
  }
}

function toggleTheme() {
  toggleSavedTheme();
  switchThemeRules();
}

/**
 * Toggles the theme of the application by switching between light and dark modes.
 * This function handles both the persistence of the theme preference and the visual update.
 * It combines the functionality of saving the theme state and applying the theme rules.
 *
 * @returns {void}
 */
function removeTheme() {
  if (localStorage.getItem("theme")) {
    if (getSystemTheme() != localStorage.getItem("theme")) {
      switchThemeRules();
    }
    localStorage.removeItem("theme");
  }
}

/**
 *
 * The function does two main things:
 * 1. Sets up event listener for system color scheme changes
 * 2. Performs initial theme check and switch if necessary
 *
 * @returns {void}
 */
function init() {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    // when "theme" is set, CSS modified rules must reflect system color scheme changes
    // it could be said that system color scheme has been overriden completely after "theme" is set
    if (localStorage.getItem("theme")) {
      switchThemeRules();
    }
  });

  if (
    localStorage.getItem("theme") &&
    getSystemTheme() != localStorage.getItem("theme")
  ) {
    switchThemeRules();
  }
}

export default {
  init,
  toggleTheme,
  removeTheme,
};
