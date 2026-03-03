// In-memory storage (safe for Basic Auth apps)
let authHeader = null;

export function setBasicAuth(username, password) {
  authHeader = "Basic " + btoa(`${username}:${password}`);
}

export function getBasicAuth() {
  return authHeader;
}

export function clearBasicAuth() {
  authHeader = null;
}

export function isLoggedIn() {
  return !!authHeader;
}