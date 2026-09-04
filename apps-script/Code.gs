// Ionic Storm backend. Paste this whole file into the Apps Script editor
// attached to your Google Sheet (Extensions -> Apps Script), then deploy it
// as a Web App. See README.md for exact steps.

var STUDENTS_SHEET = 'Students';
var PROGRESS_SHEET = 'Progress';

function doPost(e) {
  var result;
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    if (action === 'identify') {
      result = handleIdentify(body);
    } else if (action === 'saveProgress') {
      result = handleSaveProgress(body);
    } else if (action === 'getProgress') {
      result = handleGetProgress(body);
    } else {
      result = { ok: false, error: 'unknown action: ' + action };
    }
  } catch (err) {
    result = { ok: false, error: String(err) };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var body = {
    ok: true,
    message: 'Ionic Storm backend is running. This endpoint accepts POST requests only.'
  };
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function normalizeKey(name, period) {
  return (String(name).trim().toLowerCase() + '|' + String(period).trim().toLowerCase())
    .replace(/\s+/g, ' ');
}

function handleIdentify(body) {
  var name = String(body.name || '').trim();
  var period = String(body.period || '').trim();
  if (!name || !period) {
    return { ok: false, error: 'name and period are required' };
  }
  var studentKey = normalizeKey(name, period);
  var sheet = getSheet(STUDENTS_SHEET, ['StudentKey', 'Name', 'Period', 'FirstSeen', 'LastSeen']);
  var data = sheet.getDataRange().getValues();
  var now = new Date();
  var found = false;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === studentKey) {
      sheet.getRange(i + 1, 5).setValue(now); // LastSeen
      found = true;
      break;
    }
  }
  if (!found) {
    sheet.appendRow([studentKey, name, period, now, now]);
  }
  return { ok: true, studentKey: studentKey, progress: getProgressForStudent(studentKey) };
}

function handleSaveProgress(body) {
  var studentKey = String(body.studentKey || '');
  var activityId = String(body.activityId || '');
  if (!studentKey || !activityId) {
    return { ok: false, error: 'studentKey and activityId are required' };
  }
  var sheet = getSheet(PROGRESS_SHEET, [
    'StudentKey', 'Name', 'Period', 'UnitId', 'ActivityId', 'ActivityTitle',
    'Status', 'Score', 'TotalQuestions', 'AnswersJSON', 'LastUpdated'
  ]);
  var data = sheet.getDataRange().getValues();
  var now = new Date();
  var row = [
    studentKey,
    body.name || '',
    body.period || '',
    body.unitId || '',
    activityId,
    body.activityTitle || '',
    body.status || '',
    (body.score === undefined || body.score === null) ? '' : body.score,
    (body.totalQuestions === undefined || body.totalQuestions === null) ? '' : body.totalQuestions,
    JSON.stringify(body.answers || []),
    now
  ];
  var updated = false;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === studentKey && data[i][4] === activityId) {
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      updated = true;
      break;
    }
  }
  if (!updated) {
    sheet.appendRow(row);
  }
  return { ok: true };
}

function handleGetProgress(body) {
  var studentKey = String(body.studentKey || '');
  if (!studentKey) {
    return { ok: false, error: 'studentKey is required' };
  }
  return { ok: true, progress: getProgressForStudent(studentKey) };
}

function getProgressForStudent(studentKey) {
  var sheet = getSheet(PROGRESS_SHEET, [
    'StudentKey', 'Name', 'Period', 'UnitId', 'ActivityId', 'ActivityTitle',
    'Status', 'Score', 'TotalQuestions', 'AnswersJSON', 'LastUpdated'
  ]);
  var data = sheet.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === studentKey) {
      out.push({
        unitId: data[i][3],
        activityId: data[i][4],
        activityTitle: data[i][5],
        status: data[i][6],
        score: data[i][7],
        totalQuestions: data[i][8],
        answers: safeParse(data[i][9]),
        lastUpdated: data[i][10]
      });
    }
  }
  return out;
}

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return [];
  }
}
