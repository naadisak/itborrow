// ── IT Borrow System — Layout (Sidebar + Topbar) ────────────────

var NAV_ADMIN = [
  { id:'index',     icon:'grid',        label:'Dashboard',    href:'index.html' },
  { id:'approve',   icon:'check-circle',label:'อนุมัติคำขอ',  href:'approve.html' },
  { id:'tracking',  icon:'map-pin',     label:'ติดตาม',       href:'tracking.html' },
  { id:'equipment', icon:'package',     label:'จัดการอุปกรณ์',href:'equipment.html' }
];
var NAV_USER = [
  { id:'index',      icon:'grid',      label:'Dashboard',      href:'index.html' },
  { id:'borrow',     icon:'search',    label:'ยืมอุปกรณ์',    href:'borrow.html' },
  { id:'myrequests', icon:'clipboard', label:'คำขอของฉัน',    href:'myrequests.html' }
];

function renderLayout(pageId) {
  var u = getSession();
  if (!u) return;

  var nav = u.role === 'admin' ? NAV_ADMIN : NAV_USER;

  // ── Sidebar ──
  var sideItems = nav.map(function(n) {
    var active = n.id === pageId;
    return '<a href="' + n.href + '" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors '
      + (active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white') + '">'
      + iconSvg(n.icon, 18) + n.label + '</a>';
  }).join('');

  var avatarHtml = u.avatarUrl
    ? '<img src="' + u.avatarUrl + '" class="w-9 h-9 rounded-full object-cover">'
    : '<div class="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">'
      + (u.firstName ? u.firstName.charAt(0) : '?') + '</div>';

  var sidebar = '<aside id="sidebar" class="fixed top-0 left-0 h-screen w-64 bg-gray-900 flex flex-col z-40 transition-transform duration-300">'
    + '<div class="flex items-center gap-3 px-6 h-16 border-b border-white/10">'
    + '<div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-content-center font-bold text-white text-sm flex-shrink-0 flex items-center justify-center">IT</div>'
    + '<span class="font-semibold text-white text-sm">IT Borrow System</span>'
    + '</div>'
    + '<nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">'
    + '<p class="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">MENU</p>'
    + sideItems
    + '</nav>'
    + '<div class="px-4 py-4 border-t border-white/10">'
    + '<a href="profile.html" class="flex items-center gap-3 hover:opacity-80 transition-opacity">'
    + avatarHtml
    + '<div class="min-w-0"><p class="text-sm font-medium text-white truncate">' + u.fullName + '</p>'
    + '<p class="text-xs text-gray-400">' + (u.role === 'admin' ? 'Admin' : 'User') + '</p></div>'
    + '</a>'
    + '</div>'
    + '</aside>';

  // ── Topbar ──
  var topbar = '<header class="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30">'
    + '<button id="sidebar-toggle" class="lg:hidden text-gray-500 hover:text-gray-700" onclick="toggleSidebar()">'
    + iconSvg('menu', 20)
    + '</button>'
    + '<div class="flex items-center gap-3 ml-auto">'
    + '<span class="text-sm text-gray-500">' + new Date().toLocaleDateString('th-TH', {weekday:'long',year:'numeric',month:'long',day:'numeric'}) + '</span>'
    + '<button onclick="logout()" class="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">'
    + iconSvg('log-out', 16) + 'ออกจากระบบ</button>'
    + '</div>'
    + '</header>';

  // ── Main wrapper ──
  var wrapper = document.getElementById('layout-wrapper');
  if (wrapper) {
    wrapper.insertAdjacentHTML('beforebegin', sidebar + topbar);
  }

  // Mobile overlay
  var overlay = document.createElement('div');
  overlay.id = 'sidebar-overlay';
  overlay.className = 'fixed inset-0 bg-black/50 z-30 hidden lg:hidden';
  overlay.onclick = function() { closeSidebar(); };
  document.body.appendChild(overlay);
}

function toggleSidebar() {
  var s = document.getElementById('sidebar');
  var o = document.getElementById('sidebar-overlay');
  s.classList.toggle('-translate-x-full');
  o.classList.toggle('hidden');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.add('-translate-x-full');
  document.getElementById('sidebar-overlay').classList.add('hidden');
}

// ── Feather-style inline SVG icons ──────────────────────────────
var ICONS = {
  'grid'        : '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
  'map-pin'     : '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
  'package'     : '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>',
  'search'      : '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
  'clipboard'   : '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>',
  'log-out'     : '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>',
  'menu'        : '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>'
};
function iconSvg(name, size) {
  size = size || 18;
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">'
    + (ICONS[name] || '') + '</svg>';
}

// Toast
function showToast(msg, type) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium shadow-lg z-50 transition-all '
    + (type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-900 text-white');
  t.style.opacity = '1';
  setTimeout(function() { t.style.opacity = '0'; }, 3000);
}

function loadingHtml() {
  return '<div class="flex items-center justify-center py-16 text-gray-400">'
    + '<svg class="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>'
    + 'กำลังโหลด...</div>';
}
