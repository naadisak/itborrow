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

  // Inject Fonts, Styles & Tailwind Configuration
  if (!document.getElementById('premium-font')) {
    var link1 = document.createElement('link');
    link1.id = 'premium-font-pre';
    link1.rel = 'preconnect';
    link1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(link1);

    var link2 = document.createElement('link');
    link2.id = 'premium-font';
    link2.rel = 'stylesheet';
    link2.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link2);

    var twConfig = document.createElement('script');
    twConfig.innerHTML = "tailwind.config = { theme: { extend: { fontFamily: { sans: ['Inter', 'Sarabun', 'sans-serif'] }, colors: { brand: { 50: '#f5f7ff', 100: '#ebf0ff', 200: '#dbe4ff', 300: '#c2d0ff', 400: '#9db2ff', 500: '#6d84ff', 600: '#465fff', 700: '#3446eb', 800: '#2835c4', 900: '#232ea1', 950: '#15195e' } } } } };";
    document.head.appendChild(twConfig);

    var style = document.createElement('style');
    style.innerHTML = "body { font-family: 'Inter', 'Sarabun', sans-serif; background-color: #f8fafc; color: #1e293b; -webkit-font-smoothing: antialiased; } "
      + ".glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.3); } "
      + ".dark-glass { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); } "
      + ".premium-shadow { box-shadow: 0 4px 20px -2px rgba(70, 95, 255, 0.06), 0 2px 8px -1px rgba(0, 0, 0, 0.02); } "
      + ".premium-shadow-lg { box-shadow: 0 12px 30px -4px rgba(70, 95, 255, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03); } "
      + "a, button { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); } "
      + "input, textarea, select { transition: border-color 0.25s, box-shadow 0.25s; } "
      + "::-webkit-scrollbar { width: 6px; height: 6px; } "
      + "::-webkit-scrollbar-track { background: transparent; } "
      + "::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; } "
      + "::-webkit-scrollbar-thumb:hover { background: #94a3b8; }";
    document.head.appendChild(style);
  }

  var nav = u.role === 'admin' ? NAV_ADMIN : NAV_USER;

  // ── Sidebar Items ──
  var sideItems = nav.map(function(n) {
    var active = n.id === pageId;
    return '<a href="' + n.href + '" class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 '
      + (active ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white') + '">'
      + iconSvg(n.icon, 18) + '<span>' + n.label + '</span></a>';
  }).join('');

  var avatarHtml = u.avatarUrl
    ? '<img src="' + u.avatarUrl + '" class="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800">'
    : '<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-base font-bold shadow-md shadow-brand-600/10">'
      + (u.firstName ? u.firstName.charAt(0) : '?') + '</div>';

  var sidebar = '<aside id="sidebar" class="fixed top-0 left-0 h-screen w-64 bg-slate-950 flex flex-col z-40 transition-transform duration-300 border-r border-slate-900 -translate-x-full lg:translate-x-0">'
    + '<div class="flex items-center gap-3 px-6 h-16 border-b border-slate-900">'
    + '<div class="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center font-extrabold text-white text-base shadow-md shadow-brand-600/20">IT</div>'
    + '<span class="font-bold text-white text-base tracking-wide">IT Borrow System</span>'
    + '</div>'
    + '<nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">'
    + '<p class="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">MAIN NAVIGATION</p>'
    + sideItems
    + '</nav>'
    + '<div class="px-4 py-4 border-t border-slate-900 bg-slate-950/80">'
    + '<a href="profile.html" class="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900 transition duration-200 group">'
    + avatarHtml
    + '<div class="min-w-0 flex-1"><p class="text-sm font-semibold text-slate-200 truncate group-hover:text-white">' + u.fullName + '</p>'
    + '<p class="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">' + (u.role === 'admin' ? '🔑 Admin' : '👤 User') + '</p></div>'
    + '</a>'
    + '</div>'
    + '</aside>';

  // ── Topbar ──
  var topbar = '<header class="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 z-30">'
    + '<button id="sidebar-toggle" class="lg:hidden text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-50 transition" onclick="toggleSidebar()">'
    + iconSvg('menu', 20)
    + '</button>'
    + '<div class="flex items-center gap-4 ml-auto">'
    + '<span class="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full hidden sm:inline-block">' + new Date().toLocaleDateString('th-TH', {weekday:'long',year:'numeric',month:'long',day:'numeric'}) + '</span>'
    + '<button onclick="logout()" class="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-semibold px-3.5 py-2 rounded-xl hover:bg-red-50/70 border border-transparent hover:border-red-100 transition">'
    + iconSvg('log-out', 16) + 'ออกจากระบบ</button>'
    + '</div>'
    + '</header>';

  // ── Main wrapper adjustments ──
  var wrapper = document.getElementById('layout-wrapper');
  if (wrapper) {
    // Add classes for styling layout-wrapper
    wrapper.className = "lg:ml-64 pt-16 min-h-screen bg-[#f8fafc] flex flex-col";
    wrapper.insertAdjacentHTML('beforebegin', sidebar + topbar);
  }

  // Mobile overlay
  var overlay = document.createElement('div');
  overlay.id = 'sidebar-overlay';
  overlay.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 hidden';
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
