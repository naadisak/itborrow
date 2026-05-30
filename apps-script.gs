// ============================================================
//  IT Borrow System — Google Apps Script Backend v3
//  Deploy: Execute as Me | Who has access: Anyone
// ============================================================

var SHEET_ID = '1LCWmP2kRJAvYiWZvEU26YP943-NNxZ_sx7DiisuCw18';

var S = {
  EMPLOYEES     : 'employees',
  EQUIPMENT     : 'equipment',
  REQUESTS      : 'requests',
  REQUEST_ITEMS : 'request_items'
};

// Column indices (1-based)
// employees: empId | firstName | lastName | dept | phone | email | role | pin | avatarUrl
var E = { ID:1, FIRST:2, LAST:3, DEPT:4, PHONE:5, EMAIL:6, ROLE:7, PIN:8, AVATAR:9 };
// equipment: itemId | name | assetCode | category | totalStock | specs | img1..img5
var Q = { ID:1, NAME:2, CODE:3, CAT:4, STOCK:5, SPECS:6, I1:7, I2:8, I3:9, I4:10, I5:11 };
// requests: requestId | empId | empName | dept | purpose | requestedAt | returnDateProposed | returnDateFinal | status | adminNote | adminId
var R = { ID:1, EMP:2, NAME:3, DEPT:4, PURPOSE:5, AT:6, RETPROP:7, RETFIN:8, STATUS:9, NOTE:10, ADMIN:11 };
// request_items: requestId | itemId | itemName | qty
var RI = { REQ:1, ITEM:2, INAME:3, QTY:4 };

// ── Helpers ──────────────────────────────────────────────────
function ss()          { return SpreadsheetApp.openById(SHEET_ID); }
function sheet(name)   { var s = ss().getSheetByName(name); if (!s) throw new Error('ไม่พบ sheet: ' + name); return s; }
function rows(name)    { var s = sheet(name); var last = s.getLastRow(); if (last < 2) return []; return s.getRange(2, 1, last-1, s.getLastColumn()).getValues(); }
function fmt(d)        { if (!d) return ''; if (d instanceof Date) return Utilities.formatDate(d, 'Asia/Bangkok', 'dd/MM/yyyy HH:mm'); return String(d); }
function genId(prefix) { return prefix + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMddHHmmss') + Math.floor(Math.random()*100); }

// ── doGet ────────────────────────────────────────────────────
function doGet(e) {
  var p = e.parameter, result;
  try {
    switch (p.action) {
      case 'getEmployee':           result = getEmployee(p.empId); break;
      case 'verifyPin':             result = verifyPin(p.empId, p.pin); break;
      case 'setPin':                result = setPin(p.empId, p.pin); break;
      case 'updateAvatar':          result = updateAvatar(p.empId, p.avatarUrl); break;
      case 'getEquipment':          result = getEquipment(); break;
      case 'addEquipment':          result = addEquipment(p); break;
      case 'updateEquipmentImages': result = updateEquipmentImages(p); break;
      case 'getAllRequests':         result = getAllRequests(); break;
      case 'getMyRequests':         result = getMyRequests(p.empId); break;
      case 'createRequest':         result = createRequest(p); break;
      case 'approveRequest':        result = approveRequest(p); break;
      case 'rejectRequest':         result = rejectRequest(p); break;
      case 'requestReturn':         result = requestReturn(p); break;
      case 'confirmReturn':         result = confirmReturn(p); break;
      case 'getTracking':           result = getTracking(); break;
      case 'getLoginStats':         result = getLoginStats(); break;
      default: result = { error: 'Unknown action: ' + p.action };
    }
  } catch(err) {
    result = { error: err.toString() };
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

// ── getEmployee ──────────────────────────────────────────────
function getEmployee(empId) {
  if (!empId) return { found: false, reason: 'กรุณากรอกรหัสพนักงาน' };
  var data = rows(S.EMPLOYEES), id = String(empId).trim();
  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    if (String(r[E.ID-1]).trim() === id) {
      return {
        found     : true,
        empId     : String(r[E.ID-1]).trim(),
        firstName : r[E.FIRST-1],
        hasPin    : !!r[E.PIN-1],
        avatarUrl : r[E.AVATAR-1] || ''
      };
    }
  }
  return { found: false, reason: 'ไม่พบรหัสพนักงาน ' + id };
}

// ── verifyPin ────────────────────────────────────────────────
function verifyPin(empId, pin) {
  if (!empId || !pin) return { ok: false, error: 'ข้อมูลไม่ครบ' };
  var data = rows(S.EMPLOYEES), id = String(empId).trim();
  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    if (String(r[E.ID-1]).trim() === id) {
      var storedPin = String(r[E.PIN-1]).trim();
      // If PIN is stored as a number, it might lose leading zeros. Auto-pad to 6 digits.
      if (/^\d+$/.test(storedPin) && storedPin.length < 6) {
        storedPin = storedPin.padStart(6, '0');
      }
      if (storedPin !== String(pin).trim()) return { ok: false, error: 'PIN ไม่ถูกต้อง' };
      var role = String(r[E.ROLE-1]).trim().toLowerCase() === 'admin' ? 'admin' : 'user';
      return {
        ok        : true,
        empId     : String(r[E.ID-1]).trim(),
        firstName : r[E.FIRST-1],
        fullName  : (r[E.FIRST-1] + ' ' + r[E.LAST-1]).trim(),
        dept      : r[E.DEPT-1]   || '',
        phone     : r[E.PHONE-1]  || '',
        email     : r[E.EMAIL-1]  || '',
        role      : role,
        avatarUrl : r[E.AVATAR-1] || ''
      };
    }
  }
  return { ok: false, error: 'ไม่พบรหัสพนักงาน' };
}

// ── setPin ───────────────────────────────────────────────────
function setPin(empId, pin) {
  var s = sheet(S.EMPLOYEES), last = s.getLastRow();
  if (last < 2) return { ok: false, error: 'ไม่พบพนักงาน' };
  var ids = s.getRange(2, E.ID, last-1, 1).getValues(), id = String(empId).trim();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === id) {
      s.getRange(i+2, E.PIN).setValue("'" + String(pin)); // Prefix with ' to store as text and preserve leading zeros
      SpreadsheetApp.flush(); // Force changes to write immediately
      return { ok: true };
    }
  }
  return { ok: false, error: 'ไม่พบรหัสพนักงาน' };
}

// ── updateAvatar ─────────────────────────────────────────────
function updateAvatar(empId, avatarUrl) {
  var s = sheet(S.EMPLOYEES), last = s.getLastRow();
  if (last < 2) return { ok: false };
  var ids = s.getRange(2, E.ID, last-1, 1).getValues(), id = String(empId).trim();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === id) {
      s.getRange(i+2, E.AVATAR).setValue(avatarUrl || '');
      return { ok: true };
    }
  }
  return { ok: false };
}

// ── getEquipment ─────────────────────────────────────────────
function getEquipment() {
  var eqData  = rows(S.EQUIPMENT);
  var riData  = rows(S.REQUEST_ITEMS);
  var reqData = rows(S.REQUESTS);

  var activeReqs = {};
  reqData.forEach(function(r) {
    var st = String(r[R.STATUS-1]).trim();
    if (st === 'active' || st === 'pending' || st === 'pending_return') {
      activeReqs[String(r[R.ID-1]).trim()] = true;
    }
  });

  var borrowed = {};
  riData.forEach(function(r) {
    if (activeReqs[String(r[RI.REQ-1]).trim()]) {
      var iid = String(r[RI.ITEM-1]).trim();
      borrowed[iid] = (borrowed[iid] || 0) + (Number(r[RI.QTY-1]) || 0);
    }
  });

  var items = eqData.map(function(r) {
    var id    = String(r[Q.ID-1]).trim();
    var total = Number(r[Q.STOCK-1]) || 0;
    var imgs  = [r[Q.I1-1], r[Q.I2-1], r[Q.I3-1], r[Q.I4-1], r[Q.I5-1]].map(String).filter(function(x) { return x && x !== 'undefined' && x !== ''; });
    return {
      itemId     : id,
      name       : r[Q.NAME-1],
      assetCode  : r[Q.CODE-1]  || '',
      category   : r[Q.CAT-1]   || '',
      totalStock : total,
      availStock : Math.max(0, total - (borrowed[id] || 0)),
      specs      : r[Q.SPECS-1] || '',
      images     : imgs
    };
  });
  return { items: items };
}

// ── addEquipment ─────────────────────────────────────────────
function addEquipment(p) {
  if (!p.name) return { error: 'กรุณากรอกชื่อรายการ' };
  var id = genId('EQ');
  sheet(S.EQUIPMENT).appendRow([id, p.name, p.assetCode||'', p.category||'', Number(p.totalStock)||1, p.specs||'', '', '', '', '', '']);
  return { ok: true, itemId: id };
}

// ── updateEquipmentImages ────────────────────────────────────
function updateEquipmentImages(p) {
  var s = sheet(S.EQUIPMENT), last = s.getLastRow();
  if (last < 2) return { ok: false };
  var ids = s.getRange(2, Q.ID, last-1, 1).getValues(), id = String(p.itemId).trim();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === id) {
      s.getRange(i+2, Q.I1, 1, 5).setValues([[p.img1||'', p.img2||'', p.img3||'', p.img4||'', p.img5||'']]);
      return { ok: true };
    }
  }
  return { ok: false, error: 'ไม่พบ item' };
}

// ── getAllRequests ───────────────────────────────────────────
function getAllRequests() {
  var reqItems = rows(S.REQUEST_ITEMS);
  var itemsMap = {};
  reqItems.forEach(function(row) {
    var reqId = String(row[RI.REQ-1]).trim();
    if (!itemsMap[reqId]) itemsMap[reqId] = [];
    itemsMap[reqId].push({
      itemId   : String(row[RI.ITEM-1]).trim(),
      itemName : row[RI.INAME-1],
      qty      : Number(row[RI.QTY-1]) || 1
    });
  });

  var requests = rows(S.REQUESTS).map(function(r) {
    var reqId = String(r[R.ID-1]).trim();
    return {
      requestId          : reqId,
      empId              : r[R.EMP-1],
      empName            : r[R.NAME-1],
      dept               : r[R.DEPT-1],
      purpose            : r[R.PURPOSE-1],
      requestedAt        : fmt(r[R.AT-1]),
      returnDateProposed : r[R.RETPROP-1],
      returnDateFinal    : r[R.RETFIN-1],
      status             : r[R.STATUS-1],
      adminNote          : r[R.NOTE-1] || '',
      items              : itemsMap[reqId] || []
    };
  });
  return { requests: requests };
}

// ── getMyRequests ────────────────────────────────────────────
function getMyRequests(empId) {
  var id = String(empId || '').trim();
  var reqItems = rows(S.REQUEST_ITEMS);
  var itemsMap = {};
  reqItems.forEach(function(row) {
    var reqId = String(row[RI.REQ-1]).trim();
    if (!itemsMap[reqId]) itemsMap[reqId] = [];
    itemsMap[reqId].push({
      itemId   : String(row[RI.ITEM-1]).trim(),
      itemName : row[RI.INAME-1],
      qty      : Number(row[RI.QTY-1]) || 1
    });
  });

  var requests = rows(S.REQUESTS).filter(function(r) {
    return String(r[R.EMP-1]).trim() === id;
  }).map(function(r) {
    var reqId = String(r[R.ID-1]).trim();
    return {
      requestId          : reqId,
      empId              : r[R.EMP-1],
      empName            : r[R.NAME-1],
      dept               : r[R.DEPT-1],
      purpose            : r[R.PURPOSE-1],
      requestedAt        : fmt(r[R.AT-1]),
      returnDateProposed : r[R.RETPROP-1],
      returnDateFinal    : r[R.RETFIN-1],
      status             : r[R.STATUS-1],
      adminNote          : r[R.NOTE-1] || '',
      items              : itemsMap[reqId] || []
    };
  });
  return { requests: requests };
}

// ── createRequest ────────────────────────────────────────────
function createRequest(p) {
  var empId = String(p.empId || '').trim();
  var empData = rows(S.EMPLOYEES), emp = null;
  for (var i = 0; i < empData.length; i++) {
    if (String(empData[i][E.ID-1]).trim() === empId) { emp = empData[i]; break; }
  }
  if (!emp) return { error: 'ไม่พบพนักงาน' };

  var items;
  try { items = JSON.parse(p.items || '[]'); } catch(e) { return { error: 'items format ผิด' }; }
  if (!items.length) return { error: 'กรุณาเลือกอุปกรณ์' };

  var reqId    = genId('REQ');
  var fullName = (emp[E.FIRST-1] + ' ' + emp[E.LAST-1]).trim();

  sheet(S.REQUESTS).appendRow([
    reqId, empId, fullName, emp[E.DEPT-1], p.purpose || '',
    new Date(), p.returnDateProposed || '', '', 'pending', '', ''
  ]);

  var riSheet = sheet(S.REQUEST_ITEMS);
  items.forEach(function(it) {
    riSheet.appendRow([reqId, it.itemId, it.itemName, it.qty || 1]);
  });

  return { ok: true, requestId: reqId };
}

// ── approve / reject / return ────────────────────────────────
function approveRequest(p) {
  return _updateStatus(p.requestId, 'active', p.adminNote, p.empId || p.adminId, p.returnDateFinal);
}
function rejectRequest(p) {
  return _updateStatus(p.requestId, 'rejected', p.adminNote, p.empId || p.adminId, '');
}
function requestReturn(p) {
  return _updateStatus(p.requestId, 'pending_return', '', p.empId, '');
}
function confirmReturn(p) {
  return _updateStatus(p.requestId, 'returned', p.adminNote, p.empId || p.adminId, '');
}

function _updateStatus(requestId, newStatus, note, adminId, retDate) {
  var s = sheet(S.REQUESTS), last = s.getLastRow();
  if (last < 2) return { error: 'ไม่พบรายการ' };
  var ids = s.getRange(2, R.ID, last-1, 1).getValues(), id = String(requestId).trim();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === id) {
      var row = i + 2;
      s.getRange(row, R.STATUS).setValue(newStatus);
      if (note)    s.getRange(row, R.NOTE).setValue(note);
      if (retDate) s.getRange(row, R.RETFIN).setValue(retDate);
      if (adminId) s.getRange(row, R.ADMIN).setValue(adminId);
      return { ok: true };
    }
  }
  return { error: 'ไม่พบคำขอ ' + requestId };
}

// ── getTracking ──────────────────────────────────────────────
function getTracking() {
  var today_ms = new Date().setHours(0, 0, 0, 0);
  var items = rows(S.REQUESTS).filter(function(r) {
    var st = String(r[R.STATUS-1]).trim();
    return st === 'active' || st === 'pending_return';
  }).map(function(r) {
    var retDateStr = r[R.RETFIN-1] || r[R.RETPROP-1];
    var daysLeft = null, urgency = 'unknown';
    if (retDateStr) {
      var d = new Date(retDateStr);
      if (!isNaN(d)) {
        daysLeft = Math.floor((d.setHours(0,0,0,0) - today_ms) / 86400000);
        urgency  = daysLeft < 0 ? 'overdue' : daysLeft <= 3 ? 'warning' : 'ok';
      }
    }
    return {
      requestId  : r[R.ID-1],
      empId      : r[R.EMP-1],
      empName    : r[R.NAME-1],
      dept       : r[R.DEPT-1],
      status     : String(r[R.STATUS-1]).trim(),
      returnDate : retDateStr,
      daysLeft   : daysLeft,
      urgency    : urgency
    };
  });
  return { items: items };
}

// ── getLoginStats ────────────────────────────────────────────
function getLoginStats() {
  var eq     = getEquipment().items;
  var active = rows(S.REQUESTS).filter(function(r) {
    var st = String(r[R.STATUS-1]).trim();
    return st === 'active' || st === 'pending_return';
  }).length;
  return {
    totalEq    : eq.length,
    availEq    : eq.filter(function(e) { return e.availStock > 0; }).length,
    activeLoans: active
  };
}

// ── initSheets (รันครั้งเดียวเพื่อสร้าง tabs) ───────────────
function initSheets() {
  var spreadsheet = ss();
  var defs = [
    { name: S.EMPLOYEES,     headers: ['empId','firstName','lastName','dept','phone','email','role','pin','avatarUrl'] },
    { name: S.EQUIPMENT,     headers: ['itemId','name','assetCode','category','totalStock','specs','img1','img2','img3','img4','img5'] },
    { name: S.REQUESTS,      headers: ['requestId','empId','empName','dept','purpose','requestedAt','returnDateProposed','returnDateFinal','status','adminNote','adminId'] },
    { name: S.REQUEST_ITEMS, headers: ['requestId','itemId','itemName','qty'] }
  ];
  defs.forEach(function(def) {
    var s = spreadsheet.getSheetByName(def.name);
    if (!s) {
      s = spreadsheet.insertSheet(def.name);
      s.getRange(1, 1, 1, def.headers.length).setValues([def.headers]).setFontWeight('bold').setBackground('#e8f0fe');
      s.setFrozenRows(1);
    }
  });
  Logger.log('initSheets เสร็จแล้ว ✓');
}
