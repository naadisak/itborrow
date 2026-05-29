// ── IT Borrow System — Auth & Session ───────────────────────────
var SESSION_KEY = 'itb_user';

function getSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch(e) { return null; }
}
function setSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

// Redirect to login if no session. Returns user object or null.
function requireAuth() {
  var u = getSession();
  if (!u) { window.location.href = 'login.html'; return null; }
  return u;
}

// Redirect to index if not admin
function requireAdmin() {
  var u = requireAuth();
  if (!u) return null;
  if (u.role !== 'admin') { window.location.href = 'index.html'; return null; }
  return u;
}

function logout() {
  clearSession();
  window.location.href = 'login.html';
}
