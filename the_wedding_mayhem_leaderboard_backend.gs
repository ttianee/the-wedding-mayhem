const SHEET_NAME = 'Leaderboard';
const MAX_SCORE = 10000;
const MIN_SUBMISSION_GAP_SECONDS = 20;

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'top';
  if (action !== 'top') return json_({ok:false,error:'Unknown action'});
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const entries = values.slice(1).filter(r => r[0]).map(r => ({
    nickname: String(r[0]), score: Number(r[1]), yukiScore: Number(r[2]),
    kaiScore: Number(r[3]), title: String(r[4]), updatedAt: String(r[5])
  })).sort((a,b) => b.score-a.score || a.nickname.localeCompare(b.nickname)).slice(0,10);
  return json_({ok:true,entries:entries});
}

function doPost(e) {
  try {
    const p = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const nickname = String(p.nickname || '').trim().replace(/[<>]/g,'').slice(0,16);
    const score = Number(p.score), yuki = Number(p.yukiScore), kai = Number(p.kaiScore);
    const pets = Number(p.pets), catches = Number(p.catches);
    if (!nickname) throw new Error('Nickname is required');
    if (![score,yuki,kai,pets,catches].every(Number.isFinite)) throw new Error('Invalid score data');
    if (score !== yuki+kai || score < 0 || score > MAX_SCORE || yuki < 0 || kai < 0 || pets < 0 || catches < 0) throw new Error('Score validation failed');
    if (!Number.isInteger(pets) || !Number.isInteger(catches)) throw new Error('Invalid action counts');

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const cache = CacheService.getScriptCache();
      const key = 'last_'+nickname.toLowerCase();
      if (cache.get(key)) throw new Error('Please wait before submitting another score for this nickname');
      cache.put(key,'1',MIN_SUBMISSION_GAP_SECONDS);

      const sheet = getSheet_();
      const values = sheet.getDataRange().getValues();
      const title = titleFor_(score);
      let row = -1;
      for (let i=1;i<values.length;i++) {
        if (String(values[i][0]).toLowerCase() === nickname.toLowerCase()) { row=i+1; break; }
      }
      if (row > 0) {
        const old = Number(values[row-1][1]) || 0;
        if (score > old) sheet.getRange(row,1,1,6).setValues([[nickname,score,yuki,kai,title,new Date()]]);
      } else {
        sheet.appendRow([nickname,score,yuki,kai,title,new Date()]);
      }
      return json_({ok:true,title:title});
    } finally { lock.releaseLock(); }
  } catch(err) {
    return json_({ok:false,error:String(err.message || err)});
  }
}

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SPREADSHEET_ID');
  let ss;
  if (id) ss = SpreadsheetApp.openById(id);
  else {
    ss = SpreadsheetApp.create('The Wedding Mayhem — Leaderboard');
    props.setProperty('SPREADSHEET_ID',ss.getId());
  }
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Nickname','Best Score','Yuki Score','Kai Score','Title','Updated At']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function titleFor_(score) {
  if (score >= 1400) return 'Wedding Legend';
  if (score >= 900) return 'Master of Mayhem';
  if (score >= 500) return 'Certified Cat Wrangler';
  if (score >= 200) return 'Wedding Helper';
  return 'Cat Assistant';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
