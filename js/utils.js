// utils.js

/**
 * Retrieves the authentication token from local storage.
 * @returns {string|null} The authentication token or null if not found.
 */
function getAuthToken() {
  return localStorage.getItem("authToken");
}
