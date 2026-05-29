// ============================================================
//  IT Borrow System — Google Apps Script Backend v2
//  วาง code นี้ใน Google Apps Script แล้ว Deploy เป็น Web App
//  Execute as: Me | Who has access: Anyone
// ============================================================

var SHEET_ID        = '1LCWmP2kRJAvYiWZvEU26YP943-NNxZ_sx7DiisuCw18';
var BORROW_SHEET    = 'การตอบสนองของแบบฟอร์ม 1'; // ← ชื่อ tab บันทึกการยืม
var EMPLOYEE_SHEET  = 'พนักงาน';                   // ← ชื่อ tab พนักงาน

// คอลัมน์ใน BORROW_SHEET (1-based)
var B_TIMESTAMP  = 1;
var B_EMP_ID     = 2;
var B_NAME       = 3;
var B_EMAIL      = 4;
var B_PHONE      = 5;
var B_DEPT       = 6;
var B_DATE       = 7;
var B_EQUIPMENT  = 8;
var B_STATUS     = 9;   // "คืนแล้ว..." = คืน, ว่าง = ยังยืมอยู่
var B_EMAIL2     = 10;
var B_ASSET_ID   = 11;

// คอลัมน์ใน EMPLOYEE_SHEET (1-based)
var E_EMP_ID  = 1;  // รหัสพนักงาน
var E_NAME    = 2;  // ชื่อ-นามสกุล
var E_DEPT    = 3;  // แผนก/ส่วนงาน
var E_ROLE    = 4;  // ประเภท: "IT" หรือ "พนักงาน"
var E_EMAIL   = 5;  // อีเมล (optional)

// ============================================================
//  GET handler
// ============================================================
function doGet(e) {
  var action = e.parameter.action || 'getData';
  var result;

  try {
    if (action === 'getEmployee') {
      result = getEmployee(e.parameter.empId);
    } else if (action === 'getData') {
      result = getData(e.parameter.empId);
    } else if (action === 'setReturned') {
      result = setReturned(e.parameter.row, e.parameter.note);
    } else {
      result = { error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { error: err.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
//  ค้นหาพนักงานจากรหัส
// ============================================================
function getEmployee(empId) {
  if (!empId) return { found: false, reason: 'กรุณากรอกรหัสพนักงาน' };

  var ss    = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(EMPLOYEE_SHEET);
  if (!sheet) throw new Error('ไม่พบ sheet: ' + EMPLOYEE_SHEET);

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { found: false, reason: 'ไม่มีข้อมูลพนักงาน' };

  var data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  var id   = String(empId).trim();

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (String(row[E_EMP_ID - 1]).trim() === id) {
      var role = String(row[E_ROLE - 1]).trim().toUpperCase();
      return {
        found  : true,
        empId  : String(row[E_EMP_ID - 1]).trim(),
        name   : row[E_NAME - 1],
        dept   : row[E_DEPT - 1],
        role   : role === 'IT' ? 'IT' : 'employee',  // "IT" หรือ "employee"
        email  : row[E_EMAIL - 1] || ''
      };
    }
  }

  return { found: false, reason: 'ไม่พบรหัสพนักงาน ' + id + ' ในระบบ' };
}

// ============================================================
//  อ่านข้อมูลการยืม
//  - ถ้าส่ง empId มา → คืนแค่รายการของคนนั้น (employee view)
//  - ถ้าไม่ส่ง empId  → คืนทุกรายการ (IT view)
// ============================================================
function getData(empId) {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(BORROW_SHEET);
  if (!sheet) throw new Error('ไม่พบ sheet: ' + BORROW_SHEET);

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { rows: [] };

  var range  = sheet.getRange(2, 1, lastRow - 1, 11);
  var values = range.getValues();
  var filter = empId ? String(empId).trim() : null;

  var rows = [];
  values.forEach(function(row, i) {
    var rowEmpId = String(row[B_EMP_ID - 1]).trim();
    if (filter && rowEmpId !== filter) return;

    rows.push({
      rowIndex  : i + 2,
      timestamp : formatDate(row[B_TIMESTAMP - 1]),
      empId     : rowEmpId,
      name      : row[B_NAME - 1],
      email     : row[B_EMAIL - 1] || row[B_EMAIL2 - 1],
      phone     : row[B_PHONE - 1],
      dept      : row[B_DEPT - 1],
      date      : formatDate(row[B_DATE - 1]),
      equipment : row[B_EQUIPMENT - 1],
      status    : row[B_STATUS - 1],
      assetId   : row[B_ASSET_ID - 1]
    });
  });

  return { rows: rows };
}

// ============================================================
//  บันทึกการคืน (IT only)
// ============================================================
function setReturned(rowIndex, note) {
  if (!rowIndex) throw new Error('ต้องระบุ rowIndex');

  var sheet   = SpreadsheetApp.openById(SHEET_ID).getSheetByName(BORROW_SHEET);
  var today   = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy');
  var status  = note ? note : ('คืนแล้ว ' + today);

  sheet.getRange(Number(rowIndex), B_STATUS).setValue(status);
  return { success: true, row: rowIndex, status: status };
}

// ============================================================
//  Helper
// ============================================================
function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, 'Asia/Bangkok', 'dd/MM/yyyy HH:mm');
  }
  return String(val);
}
