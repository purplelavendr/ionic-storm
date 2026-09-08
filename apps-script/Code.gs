// Ionic Storm backend. Paste this whole file into the Apps Script editor
// attached to your Google Sheet (Extensions -> Apps Script), then deploy it
// as a Web App. See README.md for exact steps.
//
// This same Web App also serves the ENTIRE frontend (doGet, below) --
// Index.html and the other .html files in this folder are a generated
// bundle of the site (see build.py) -- so the whole app lives on
// script.google.com, not just the JSON API. That matters because some
// school network filters block/degrade github.io while already trusting
// google.com / googleusercontent.com domains.
//
// Sheet layout (per class period):
//   "Roster - <Period>"   columns: Name, StudentID, FirstSeen, LastSeen
//   "Progress - <Period>" columns: StudentKey, Name, UnitId, ActivityId,
//                                  ActivityTitle, Status, Score,
//                                  TotalQuestions, AnswersJSON, LastUpdated
//
// To add a class period: create a new sheet tab named exactly
// "Roster - <Period>" (e.g. "Roster - Period 3") and list one student name
// per row starting in row 2, with their student ID number in column B.
// That's it -- the matching "Progress - <Period>" tab is created
// automatically the first time a student in that period saves progress.
// To update a roster (add/drop/rename a student, fix an ID), just edit
// that tab directly.
//
// StudentID acts as a lightweight password: a student must type the
// matching ID to sign in as that roster name. Leaving a row's StudentID
// blank skips the check for that student (useful while first rolling
// this out, before every ID is entered) -- it does NOT skip the field
// on the sign-in form, students still have to type something.

var ROSTER_PREFIX = 'Roster - ';
var PROGRESS_PREFIX = 'Progress - ';

function doPost(e) {
  var result;
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    if (action === 'getPeriods') {
      result = handleGetPeriods();
    } else if (action === 'getRoster') {
      result = handleGetRoster(body);
    } else if (action === 'identify') {
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
  // ?ping=1 keeps the old plain JSON health check available for quick
  // debugging (e.g. pasting the URL straight into a browser with that
  // param); every other GET serves the app itself.
  if (e && e.parameter && e.parameter.ping) {
    var body = { ok: true, message: 'Ionic Storm backend is running.' };
    return ContentService
      .createTextOutput(JSON.stringify(body))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Ionic Storm');
}

// Used by Index.html's <?!= include('Name'); ?> scriptlets to pull in the
// other generated .html files (styles, and each JS file) as one page.
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function rosterSheetName(period) { return ROSTER_PREFIX + period; }
function progressSheetName(period) { return PROGRESS_PREFIX + period; }

function getSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function findSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function normalizeKey(name, period) {
  return (String(name).trim().toLowerCase() + '|' + String(period).trim().toLowerCase())
    .replace(/\s+/g, ' ');
}

// Every period that currently has a "Roster - <Period>" tab, sorted.
function handleGetPeriods() {
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var periods = [];
  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName();
    if (name.indexOf(ROSTER_PREFIX) === 0) {
      periods.push(name.substring(ROSTER_PREFIX.length));
    }
  }
  periods.sort();
  return { ok: true, periods: periods };
}

// The list of student names on one period's roster.
function handleGetRoster(body) {
  var period = String(body.period || '').trim();
  if (!period) return { ok: false, error: 'period is required' };
  var sheet = findSheet(rosterSheetName(period));
  if (!sheet) return { ok: true, names: [] };
  var data = sheet.getDataRange().getValues();
  var names = [];
  for (var i = 1; i < data.length; i++) {
    var n = String(data[i][0] || '').trim();
    if (n) names.push(n);
  }
  return { ok: true, names: names };
}

function handleIdentify(body) {
  var name = String(body.name || '').trim();
  var period = String(body.period || '').trim();
  var studentId = String(body.studentId || '').trim();
  if (!name || !period || !studentId) {
    return { ok: false, error: 'name, period, and studentId are required' };
  }
  var studentKey = normalizeKey(name, period);
  var sheet = getSheet(rosterSheetName(period), ['Name', 'StudentID', 'FirstSeen', 'LastSeen']);
  var data = sheet.getDataRange().getValues();
  var now = new Date();
  var matchedRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0] || '').trim().toLowerCase() === name.toLowerCase()) {
      matchedRow = i;
      break;
    }
  }
  if (matchedRow === -1) {
    // Not on the pre-loaded roster (e.g. used the "my name isn't listed"
    // fallback) -- add them so the gap is visible next time the roster is
    // checked. Nothing to check the entered ID against, so just record it.
    sheet.appendRow([name, studentId, now, now]);
  } else {
    var onFile = String(data[matchedRow][1] || '').trim();
    if (onFile !== '' && onFile !== studentId) {
      return { ok: false, error: 'incorrect_id' };
    }
    var firstSeen = data[matchedRow][2] || now;
    sheet.getRange(matchedRow + 1, 3, 1, 2).setValues([[firstSeen, now]]);
  }
  return { ok: true, studentKey: studentKey, progress: getProgressForStudent(studentKey, period) };
}

function handleSaveProgress(body) {
  var studentKey = String(body.studentKey || '');
  var activityId = String(body.activityId || '');
  var period = String(body.period || '').trim();
  if (!studentKey || !activityId || !period) {
    return { ok: false, error: 'studentKey, activityId, and period are required' };
  }
  var sheet = getSheet(progressSheetName(period), [
    'StudentKey', 'Name', 'UnitId', 'ActivityId', 'ActivityTitle',
    'Status', 'Score', 'TotalQuestions', 'AnswersJSON', 'LastUpdated'
  ]);
  var data = sheet.getDataRange().getValues();
  var now = new Date();
  var row = [
    studentKey,
    body.name || '',
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
    if (data[i][0] === studentKey && data[i][3] === activityId) {
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
  var period = String(body.period || '').trim();
  if (!studentKey || !period) {
    return { ok: false, error: 'studentKey and period are required' };
  }
  return { ok: true, progress: getProgressForStudent(studentKey, period) };
}

function getProgressForStudent(studentKey, period) {
  var sheet = findSheet(progressSheetName(period));
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === studentKey) {
      out.push({
        unitId: data[i][2],
        activityId: data[i][3],
        activityTitle: data[i][4],
        status: data[i][5],
        score: data[i][6],
        totalQuestions: data[i][7],
        answers: safeParse(data[i][8]),
        lastUpdated: data[i][9]
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
