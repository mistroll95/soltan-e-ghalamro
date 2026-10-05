(function(){
'use strict';

/* =========================================================
   ثابت‌ها
   ========================================================= */
var SIZE = 500;
var PIX  = 5;
var CELL = 25;
var N    = SIZE / CELL;

var EMPTY = 0, OWNED = 1, TRAIL = 2;

var STEP_MS = 75;
var TARGET  = 0.70;

var FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
function FA(n){
  if(n === undefined || n === null) return '۰';
  return String(n).replace(/\d/g, function(d){
    var i = d.charCodeAt(0) - 48;
    return (i >= 0 && i < 10) ? FA_DIGITS.charAt(i) : d;
  });
}

/* =========================================================
   زبان برنامه (فارسی/انگلیسی) — تنظیمات > زبان
   ========================================================= */
var LANG_KEY = 'terrLang_v1';
var I18N = {
  fa: {
    hud_score: 'امتیاز',
    hud_lives: 'جان',
    hud_level: 'مرحله',
    hud_pct: 'قلمرو',
    btn_gallery: 'گالری',
    btn_settings: 'تنظیمات',
    intro_title: 'فتح قلمرو',
    intro_p1: 'با مربع <b>آبی</b> حرکت کن. از قلمرو بیرون بزن و مسیر بکش؛ وقتی به قلمرو برگردی، هر ناحیه‌ای که محاصره شده باشد مال تو می‌شود.',
    intro_p2: 'از گوی‌های <b>نارنجی</b> دوری کن — اگر به خطت بخورند یک جان از دست می‌دهی.',
    intro_p3: 'هر مرحله یک عکس از گالری‌ات را کامل می‌کند و هر مرحله سخت‌تر از قبلی است.',
    intro_p4: 'هر عکسی که باز شود را می‌توانی تمام‌صفحه ببینی و مستقیم به‌عنوان پس‌زمینه‌ی گوشی تنظیم کنی.',
    intro_p5: 'موبایل: دی‌پد پایین یا کشیدن انگشت روی صفحه &nbsp;|&nbsp; دسکتاپ: کلیدهای جهت‌دار / WASD',
    start_btn: 'شروع بازی',
    gallery_title: 'گالری',
    gallery_hint: 'با فتح کامل هر مرحله، یکی از عکس‌ها باز می‌شود.',
    gallery_empty: 'عکسی در پوشه‌ی img پیدا نشد. چند فایل jpg با نام‌های 1.jpg تا 6.jpg داخل پوشه‌ی img (کنار index.html) بگذار.',
    wallpaper_btn: 'تنظیم به‌عنوان پس‌زمینه گوشی',
    wallpaper_busy: 'در حال تنظیم...',
    settings_title: 'تنظیمات',
    settings_lang_label: 'زبان برنامه',
    settings_rate: 'امتیاز دادن در مایکت',
    settings_comment: 'ثبت نظر در مایکت',
    settings_about_title: 'درباره‌ی برنامه',
    settings_about_dev: 'طراح و عرضه‌کننده:',
    settings_about_github: 'مشاهده گیت‌هاب سازنده',
    settings_version: 'نسخه',
    android_only: 'این قابلیت فقط داخل اپ اندروید کار می‌کند',
    bridge_error: 'خطا در ارتباط با اپلیکیشن',
    level_complete: 'مرحله {n} فتح شد!',
    unlocked_photo: 'یک عکس تازه در گالری باز شد 🎉',
    need_photos: 'چند عکس داخل پوشه‌ی img بگذار تا هر مرحله یکی از آن‌ها را کامل کنی.',
    score_label: 'امتیاز: {n}',
    continue_btn: 'ادامه',
    game_over: 'بازی تمام شد',
    reached_level: 'به مرحله‌ی {n} رسیدی',
    restart_btn: 'دوباره بازی کن'
  },
  en: {
    hud_score: 'Score',
    hud_lives: 'Lives',
    hud_level: 'Level',
    hud_pct: 'Territory',
    btn_gallery: 'Gallery',
    btn_settings: 'Settings',
    intro_title: 'Conquer Territory',
    intro_p1: 'Move the <b>blue</b> square. Step out of your territory to draw a trail; when you get back, every area your trail closes off becomes yours.',
    intro_p2: 'Stay away from the <b>orange</b> orbs — touching your trail costs you a life.',
    intro_p3: 'Each level unlocks one photo from your gallery, and every level is a bit harder than the last.',
    intro_p4: 'Open any unlocked photo full-screen and set it as your phone wallpaper right away.',
    intro_p5: 'Mobile: use the D-pad below or swipe on the board &nbsp;|&nbsp; Desktop: arrow keys / WASD',
    start_btn: 'Start Game',
    gallery_title: 'Gallery',
    gallery_hint: 'Fully conquering a level unlocks one of the photos.',
    gallery_empty: 'No photos found in the img folder. Add a few .jpg files named 1.jpg to 6.jpg next to index.html.',
    wallpaper_btn: 'Set as phone wallpaper',
    wallpaper_busy: 'Setting...',
    settings_title: 'Settings',
    settings_lang_label: 'App language',
    settings_rate: 'Rate on Myket',
    settings_comment: 'Leave a comment on Myket',
    settings_about_title: 'About this app',
    settings_about_dev: 'Developer & publisher:',
    settings_about_github: 'View developer on GitHub',
    settings_version: 'Version',
    android_only: 'This only works inside the Android app',
    bridge_error: 'Error talking to the app',
    level_complete: 'Level {n} conquered!',
    unlocked_photo: 'A new photo just unlocked in the gallery 🎉',
    need_photos: 'Add a few photos to the img folder so each level unlocks one of them.',
    score_label: 'Score: {n}',
    continue_btn: 'Continue',
    game_over: 'Game Over',
    reached_level: 'You reached level {n}',
    restart_btn: 'Play again'
  }
};

function loadLang(){
  var v = safeGet(LANG_KEY);
  return (v === 'en' || v === 'fa') ? v : 'fa';
}
var LANG = loadLang();

function t(key){
  var dict = I18N[LANG] || I18N.fa;
  var v = dict[key];
  if(v === undefined) v = I18N.fa[key];
  return v === undefined ? '' : v;
}
function tf(key, n){
  return t(key).replace('{n}', n);
}
/* اعداد را طبق زبان فعال (رقم فارسی یا لاتین) برمی‌گرداند */
function LN(n){ return LANG === 'fa' ? FA(n) : String(n); }

function applyI18N(){
  document.documentElement.setAttribute('lang', LANG);
  document.documentElement.setAttribute('dir', LANG === 'fa' ? 'rtl' : 'ltr');

  var nodes = document.querySelectorAll('[data-i18n]');
  for(var i = 0; i < nodes.length; i++){
    var key = nodes[i].getAttribute('data-i18n');
    nodes[i].innerHTML = t(key);
  }

  var faBtn = document.getElementById('langBtnFa');
  var enBtn = document.getElementById('langBtnEn');
  if(faBtn && enBtn){
    faBtn.classList.toggle('active', LANG === 'fa');
    enBtn.classList.toggle('active', LANG === 'en');
  }

  updateHUD();
}

function setLang(lang){
  if(lang !== 'fa' && lang !== 'en') return;
  LANG = lang;
  safeSet(LANG_KEY, lang);
  applyI18N();
}

/* =========================================================
   عکس‌های مراحل — از پوشه‌ی img کنار همین فایل‌ها خوانده می‌شوند
   ========================================================= */
var PHOTO_FILES = [
  'img/1.jpg',
  'img/2.jpg',
  'img/3.jpg',
  'img/4.jpg',
  'img/5.jpg',
  'img/6.jpg',
  'img/6.jpg',
  'img/7.jpg',
  'img/8.jpg',
  'img/9.jpg',
  'img/10.jpg'
];

/* شناسه‌ی پکیج برای مایکت — اگر تغییر کرد اینجا هم آپدیت کن */
var MYKET_PACKAGE = 'ir.msi.fa';

var UNLOCK_KEY = 'terrUnlocked_v1';

function safeGet(key){
  try{
    var v = window.localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  }catch(e){ return null; }
}
function safeSet(key, val){
  try{ window.localStorage.setItem(key, JSON.stringify(val)); }catch(e){ /* بی‌اهمیت */ }
}
function loadUnlocked(){ var v = safeGet(UNLOCK_KEY); return Array.isArray(v) ? v : []; }
function saveUnlocked(){ safeSet(UNLOCK_KEY, Array.prototype.slice.call(unlockedSet)); }

/* =========================================================
   بوم
   ========================================================= */
var canvas = document.getElementById('game');
var ctx    = canvas.getContext('2d');
var DPR    = Math.min(window.devicePixelRatio || 1, 2);

canvas.width  = SIZE * DPR;
canvas.height = SIZE * DPR;
ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

var bgLayer = document.createElement('canvas');
bgLayer.width  = SIZE * DPR;
bgLayer.height = SIZE * DPR;
(function buildBackground(){
  var g = bgLayer.getContext('2d');
  g.setTransform(DPR, 0, 0, DPR, 0, 0);

  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, SIZE, SIZE);

  g.strokeStyle = 'rgba(20,45,80,.075)';
  g.lineWidth = 1;
  g.beginPath();
  for(var i = 0; i <= SIZE; i += PIX){
    var p = i + 0.5;
    g.moveTo(p, 0); g.lineTo(p, SIZE);
    g.moveTo(0, p); g.lineTo(SIZE, p);
  }
  g.stroke();

  g.strokeStyle = 'rgba(20,45,80,.16)';
  g.beginPath();
  for(var j = 0; j <= SIZE; j += CELL){
    var q = j + 0.5;
    g.moveTo(q, 0); g.lineTo(q, SIZE);
    g.moveTo(0, q); g.lineTo(SIZE, q);
  }
  g.stroke();
})();

/* =========================================================
   وضعیت
   ========================================================= */
function idx(r, c){ return r * N + c; }

var grid = new Uint8Array(N * N);
var player = { r: 10, c: 10 };
var dir = null;
var mode = 'safe';
var trail = [];
var trailStart = { r: 10, c: 10 };
var enemies = [];
var shake = 0;
var score = 0, lives = 3, level = 1, ownedCount = 36;
var running = false;
var deadTimer = 0;
var stepAcc = 0, lastT = 0;

var DIRS = {
  up:    { r: -1, c: 0 },
  down:  { r:  1, c: 0 },
  left:  { r:  0, c: 1 },
  right: { r:  0, c: -1 }
};
var heldDirs = [];

var images      = PHOTO_FILES.slice();
var unlockedSet = objFromArr(loadUnlocked());
var imgLayer    = null;
var imgReady    = false;

function objFromArr(arr){
  var s = {};
  for(var i = 0; i < arr.length; i++) s[arr[i]] = true;
  return s;
}
function setHas(i){ return !!unlockedSet[i]; }
function setAdd(i){ unlockedSet[i] = true; }

/* =========================================================
   لایه‌ی عکس مرحله (cover-fit روی اندازه‌ی بورد)
   ========================================================= */
function buildImageLayer(lv, cb){
  imgReady = false;
  imgLayer = null;

  if(!images.length){ if(cb) cb(); return; }

  var src = images[(lv - 1) % images.length];
  var im = new Image();
  im.onload = function(){
    var c = document.createElement('canvas');
    c.width  = SIZE * DPR;
    c.height = SIZE * DPR;
    var g = c.getContext('2d');
    g.setTransform(DPR, 0, 0, DPR, 0, 0);

    var iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
    if(iw && ih){
      var scale = Math.max(SIZE / iw, SIZE / ih);
      var dw = iw * scale, dh = ih * scale;
      var dx = (SIZE - dw) / 2, dy = (SIZE - dh) / 2;
      g.drawImage(im, dx, dy, dw, dh);
    }

    imgLayer = c;
    imgReady = true;
    if(cb) cb();
  };
  im.onerror = function(){ imgReady = false; imgLayer = null; if(cb) cb(); };
  im.src = src;
}

/* =========================================================
   ساخت صفحه
   ========================================================= */
function newBoard(){
  grid = new Uint8Array(N * N);
  var a = Math.floor(N / 2) - 3;
  for(var r = a; r < a + 6; r++)
    for(var c = a; c < a + 6; c++)
      grid[idx(r, c)] = OWNED;

  ownedCount = 36;
  player = { r: Math.floor(N / 2), c: Math.floor(N / 2) };
  mode = 'safe';
  trail = [];
  trailStart = { r: player.r, c: player.c };
  stepAcc = 0;
  deadTimer = 0;
  dir = null;
  heldDirs = [];
}

function enemySpeed(lv){ return Math.min(158, 72 + (lv - 1) * 13); }
function enemyCount(lv){ return Math.min(5, 2 + Math.floor((lv - 1) / 2)); }

function findFreeSpot(){
  for(var k = 0; k < 700; k++){
    var r = 1 + Math.floor(Math.random() * (N - 2));
    var c = 1 + Math.floor(Math.random() * (N - 2));
    if(grid[idx(r, c)] !== EMPTY) continue;
    var dr = r - player.r, dc = c - player.c;
    if(dr * dr + dc * dc < 40) continue;
    return { r: r, c: c };
  }
  var free = [];
  for(var i = 0; i < grid.length; i++) if(grid[i] === EMPTY) free.push(i);
  if(!free.length) return null;
  var ii = free[Math.floor(Math.random() * free.length)];
  return { r: Math.floor(ii / N), c: ii % N };
}

function spawnEnemies(){
  enemies = [];
  var sp  = enemySpeed(level);
  var cnt = enemyCount(level);

  for(var i = 0; i < cnt; i++){
    var spot = findFreeSpot();
    if(!spot) break;
    var horiz = Math.random() < 0.5;
    var sgn   = Math.random() < 0.5 ? -1 : 1;
    enemies.push({
      x: (spot.c + 0.5) * CELL,
      y: (spot.r + 0.5) * CELL,
      vx: horiz ? sgn * sp : 0,
      vy: horiz ? 0 : sgn * sp,
      speed: sp
    });
  }
}

/* =========================================================
   حرکت بازیکن
   ========================================================= */
function stepPlayer(){
  if(!dir) return;
  if(typeof dir.r !== 'number' || typeof dir.c !== 'number') return;

  var nr = player.r + dir.r;
  var nc = player.c + dir.c;
  if(nr < 0 || nr >= N || nc < 0 || nc >= N) return;

  var i = idx(nr, nc);
  var v = grid[i];

  if(v === TRAIL) return;

  if(mode === 'safe'){
    if(v === OWNED){
      player.r = nr; player.c = nc;
    } else {
      trailStart = { r: player.r, c: player.c };
      grid[i] = TRAIL;
      trail.push(i);
      player.r = nr; player.c = nc;
      mode = 'draw';
    }
  } else {
    if(v === OWNED){
      player.r = nr; player.c = nc;
      mode = 'safe';
      capture();
    } else {
      grid[i] = TRAIL;
      trail.push(i);
      player.r = nr; player.c = nc;
    }
  }
}

/* =========================================================
   فتح قلمرو
   ========================================================= */
function capture(){
  var trailCount = trail.length;

  for(var k = 0; k < trail.length; k++) grid[trail[k]] = OWNED;
  trail.length = 0;

  for(var e = 0; e < enemies.length; e++){
    var en = enemies[e];
    var cc = Math.floor(en.x / CELL), rr = Math.floor(en.y / CELL);
    if(rr < 0 || rr >= N || cc < 0 || cc >= N) continue;
    if(grid[idx(rr, cc)] === OWNED){
      var s = findFreeSpot();
      if(s){ en.x = (s.c + 0.5) * CELL; en.y = (s.r + 0.5) * CELL; }
    }
  }

  var reach = new Uint8Array(N * N);
  var stack = [];

  for(var ei = 0; ei < enemies.length; ei++){
    var e2 = enemies[ei];
    var c2 = Math.min(N - 1, Math.max(0, Math.floor(e2.x / CELL)));
    var r2 = Math.min(N - 1, Math.max(0, Math.floor(e2.y / CELL)));
    var i2 = idx(r2, c2);
    if(grid[i2] === EMPTY && !reach[i2]){ reach[i2] = 1; stack.push(i2); }
  }

  var captured = 0;

  if(stack.length){
    while(stack.length){
      var cur = stack.pop();
      var r3 = Math.floor(cur / N), c3 = cur % N;

      if(r3 > 0){     var j1 = cur - N; if(grid[j1] === EMPTY && !reach[j1]){ reach[j1] = 1; stack.push(j1); } }
      if(r3 < N - 1){ var j2 = cur + N; if(grid[j2] === EMPTY && !reach[j2]){ reach[j2] = 1; stack.push(j2); } }
      if(c3 > 0){     var j3 = cur - 1; if(grid[j3] === EMPTY && !reach[j3]){ reach[j3] = 1; stack.push(j3); } }
      if(c3 < N - 1){ var j4 = cur + 1; if(grid[j4] === EMPTY && !reach[j4]){ reach[j4] = 1; stack.push(j4); } }
    }

    for(var m = 0; m < N * N; m++){
      if(grid[m] === EMPTY && !reach[m]){ grid[m] = OWNED; captured++; }
    }
  }

  ownedCount += trailCount + captured;
  score += (trailCount + captured) * 10;
  shake = 1;
  updateHUD();

  if(ownedCount / (N * N) >= TARGET) levelUp();
}

/* =========================================================
   دشمن‌ها
   ========================================================= */
function moveEnemies(ms){
  var s = ms / 1000;

  for(var ei = 0; ei < enemies.length; ei++){
    var e = enemies[ei];
    var nx = e.x, ny = e.y;
    var bounced = false;

    if(e.vx !== 0){
      nx = e.x + e.vx * s;
      var probe = nx + Math.sign(e.vx) * CELL * 0.42;
      var cc = Math.floor(probe / CELL);
      var rr = Math.floor(e.y / CELL);
      if(cc < 0 || cc >= N || rr < 0 || rr >= N || grid[idx(rr, cc)] === OWNED){
        e.vx = -e.vx;
        nx = e.x;
        bounced = true;
      }
    } else {
      ny = e.y + e.vy * s;
      var probe2 = ny + Math.sign(e.vy) * CELL * 0.42;
      var rr2 = Math.floor(probe2 / CELL);
      var cc2 = Math.floor(e.x / CELL);
      if(rr2 < 0 || rr2 >= N || cc2 < 0 || cc2 >= N || grid[idx(rr2, cc2)] === OWNED){
        e.vy = -e.vy;
        ny = e.y;
        bounced = true;
      }
    }

    e.x = Math.min(SIZE - 0.5, Math.max(0.5, nx));
    e.y = Math.min(SIZE - 0.5, Math.max(0.5, ny));

    if(bounced && Math.random() < 0.28){
      var sgn = Math.random() < 0.5 ? -1 : 1;
      if(e.vx !== 0){
        var rr3 = Math.floor((e.y + sgn * CELL * 0.42) / CELL);
        var cc3 = Math.floor(e.x / CELL);
        if(rr3 >= 0 && rr3 < N && cc3 >= 0 && cc3 < N && grid[idx(rr3, cc3)] !== OWNED){
          e.vy = sgn * e.speed; e.vx = 0;
        }
      } else {
        var cc4 = Math.floor((e.x + sgn * CELL * 0.42) / CELL);
        var rr4 = Math.floor(e.y / CELL);
        if(rr4 >= 0 && rr4 < N && cc4 >= 0 && cc4 < N && grid[idx(rr4, cc4)] !== OWNED){
          e.vx = sgn * e.speed; e.vy = 0;
        }
      }
    }
  }
}

function checkEnemyHit(){
  for(var ei = 0; ei < enemies.length; ei++){
    var e = enemies[ei];
    var c = Math.floor(e.x / CELL);
    var r = Math.floor(e.y / CELL);
    if(r < 0 || r >= N || c < 0 || c >= N) continue;

    if(grid[idx(r, c)] === TRAIL){ die(); return; }
    if(mode === 'draw' && r === player.r && c === player.c){ die(); return; }
  }
}

/* =========================================================
   مرگ / برد
   ========================================================= */
function die(){
  for(var k = 0; k < trail.length; k++) grid[trail[k]] = EMPTY;
  trail.length = 0;
  mode = 'safe';
  player.r = trailStart.r;
  player.c = trailStart.c;

  lives--;
  deadTimer = 850;
  shake = 1.4;
  updateHUD();

  if(lives <= 0) endGame();
}

function levelUp(){
  for(var i = 0; i < grid.length; i++) grid[i] = OWNED;
  ownedCount = N * N;
  updateHUD();
  draw();

  var photoIdx = images.length ? (level - 1) % images.length : -1;
  if(photoIdx >= 0 && !setHas(photoIdx)){
    setAdd(photoIdx);
    saveUnlocked();
  }

  running = false;
  showLevelComplete(photoIdx);
}

function showLevelComplete(photoIdx){
  var pic = '';
  var note;
  if(photoIdx >= 0){
    pic  = '<div class="revealFrame"><img src="' + images[photoIdx] + '" alt="' + t('gallery_title') + '"></div>';
    note = '<p>' + t('unlocked_photo') + '</p>';
  } else {
    note = '<p style="font-size:11px;color:#6f7c90">' + t('need_photos') + '</p>';
  }
  showOverlay(
    '<h1>' + tf('level_complete', LN(level)) + '</h1>' +
    pic +
    '<p class="big">' + tf('score_label', LN(score)) + '</p>' +
    note +
    '<button data-act="nextLevel">' + t('continue_btn') + '</button>'
  );
}

function goNextLevel(){
  level++;
  hideOverlay();
  buildImageLayer(level, function(){
    newBoard();
    spawnEnemies();
    updateHUD();
    running = true;
  });
}

function endGame(){
  running = false;
  showOverlay(
    '<h1>' + t('game_over') + '</h1>' +
    '<p class="big">' + tf('score_label', LN(score)) + '</p>' +
    '<p>' + tf('reached_level', LN(level)) + '</p>' +
    '<button data-act="restart">' + t('restart_btn') + '</button>'
  );
}

/* =========================================================
   رسم
   ========================================================= */
function pathRoundRect(g, x, y, w, h, r){
  if(r > w / 2) r = w / 2;
  if(r > h / 2) r = h / 2;
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y,     x + w, y + h, r);
  g.arcTo(x + w, y + h, x,     y + h, r);
  g.arcTo(x,     y + h, x,     y,     r);
  g.arcTo(x,     y,     x + w, y,     r);
  g.closePath();
}

function forEachOwnedRun(cb){
  for(var r = 0; r < N; r++){
    var c = 0;
    while(c < N){
      if(grid[idx(r, c)] === OWNED){
        var start = c;
        while(c < N && grid[idx(r, c)] === OWNED) c++;
        cb(start * CELL, r * CELL, (c - start) * CELL, CELL);
      } else c++;
    }
  }
}

function draw(){
  ctx.save();

  if(shake > 0){
    var s = shake * 6;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-24, -24, SIZE + 48, SIZE + 48);
  ctx.drawImage(bgLayer, 0, 0, SIZE, SIZE);

  if(imgReady && imgLayer){
    ctx.save();
    ctx.beginPath();
    forEachOwnedRun(function(x, y, w, h){ ctx.rect(x, y, w, h); });
    ctx.clip();
    ctx.drawImage(imgLayer, 0, 0, SIZE, SIZE);
    ctx.restore();
  } else {
    ctx.fillStyle = '#12161d';
    forEachOwnedRun(function(x, y, w, h){ ctx.fillRect(x, y, w, h); });
  }

  if(trail.length){
    ctx.shadowColor = '#ff2d55';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ff2d55';
    for(var ti = 0; ti < trail.length; ti++){
      var idxT = trail[ti];
      var rr = Math.floor(idxT / N), cc = idxT % N;
      ctx.fillRect(cc * CELL + 1, rr * CELL + 1, CELL - 2, CELL - 2);
    }
    ctx.shadowBlur = 0;
  }

  for(var ei = 0; ei < enemies.length; ei++){
    var e = enemies[ei];
    ctx.beginPath();
    ctx.arc(e.x, e.y, CELL * 0.33, 0, Math.PI * 2);
    ctx.shadowColor = '#ff6b2c';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ff6b2c';
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(e.x - 2.2, e.y - 2.2, CELL * 0.11, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.fill();
  }

  var px = player.c * CELL, py = player.r * CELL;
  ctx.shadowColor = '#00c2ff';
  ctx.shadowBlur = 17;
  ctx.fillStyle = '#00c2ff';
  pathRoundRect(ctx, px + 2.5, py + 2.5, CELL - 5, CELL - 5, 6);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(255,255,255,.9)';
  pathRoundRect(ctx, px + 7, py + 7, CELL - 14, CELL - 14, 3);
  ctx.fill();

  ctx.restore();
}

/* =========================================================
   حلقه اصلی
   ========================================================= */
function loop(t){
  if(!lastT) lastT = t;
  var dt = t - lastT;
  lastT = t;
  if(dt > 120) dt = 120;

  if(shake > 0) shake = Math.max(0, shake - dt / 220);

  if(running){
    if(deadTimer > 0){
      deadTimer -= dt;
    } else {
      stepAcc += dt;
      var guard = 0;
      while(stepAcc >= STEP_MS && guard++ < 6 && deadTimer <= 0){
        stepAcc -= STEP_MS;
        stepPlayer();
      }
      var rem = dt;
      while(rem > 0 && deadTimer <= 0){
        var s = Math.min(rem, 16);
        moveEnemies(s);
        checkEnemyHit();
        rem -= s;
      }
    }
  }

  draw();
  requestAnimationFrame(loop);
}

/* =========================================================
   رابط کاربری
   ========================================================= */
var elScore = document.getElementById('uiScore');
var elLives = document.getElementById('uiLives');
var elLevel = document.getElementById('uiLevel');
var elPct   = document.getElementById('uiPct');
var elFlash = document.getElementById('flash');
var overlay = document.getElementById('overlay');

var flashTimer = 0;
function flash(msg){
  elFlash.textContent = msg;
  elFlash.classList.add('show');
  clearTimeout(flashTimer);
  flashTimer = setTimeout(function(){ elFlash.classList.remove('show'); }, 1500);
}

function updateHUD(){
  if(!elScore) return;
  elScore.textContent = LN(score);
  elLives.textContent = lives > 0 ? new Array(lives + 1).join('♥') : '—';
  elLevel.textContent = LN(level);
  elPct.textContent   = LN(Math.round(ownedCount / (N * N) * 100)) + (LANG === 'fa' ? '٪' : '%');
}

function showOverlay(html){
  overlay.innerHTML = '<div class="card">' + html + '</div>';
  overlay.classList.add('show');
}
function hideOverlay(){
  overlay.classList.remove('show');
}

/* =========================================================
   کنترل‌ها
   ========================================================= */
function pressDir(name){
  if(!DIRS[name]) return;
  if(heldDirs.length && heldDirs[heldDirs.length - 1] === name) return;
  var filtered = [];
  for(var i = 0; i < heldDirs.length; i++) if(heldDirs[i] !== name) filtered.push(heldDirs[i]);
  filtered.push(name);
  heldDirs = filtered;
  dir = DIRS[name];
}

function releaseDir(name){
  var filtered = [];
  for(var i = 0; i < heldDirs.length; i++) if(heldDirs[i] !== name) filtered.push(heldDirs[i]);
  heldDirs = filtered;
  if(heldDirs.length){
    var last = heldDirs[heldDirs.length - 1];
    dir = DIRS[last] || null;
  } else {
    dir = null;
  }
}

// دی‌پد
var padButtons = document.querySelectorAll('#pad .btn');
for(var pb = 0; pb < padButtons.length; pb++){
  (function(btn){
    var name = btn.getAttribute('data-dir');
    function down(e){
      if(e){ e.preventDefault(); }
      btn.classList.add('on');
      pressDir(name);
    }
    function up(e){
      if(e){ e.preventDefault(); }
      btn.classList.remove('on');
      releaseDir(name);
    }
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', up);
    btn.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  })(padButtons[pb]);
}

// کیبورد
var KEYMAP = {
  ArrowUp: 'up',    KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right'
};

window.addEventListener('keydown', function(e){
  var d = KEYMAP[e.code];
  if(d){ e.preventDefault(); pressDir(d); }
});
window.addEventListener('keyup', function(e){
  var d = KEYMAP[e.code];
  if(d){ e.preventDefault(); releaseDir(d); }
});

// جوی‌استیک لمسی
var touchId = null, originX = 0, originY = 0, joyDir = null;

canvas.addEventListener('pointerdown', function(e){
  if(!running) return;
  e.preventDefault();
  touchId = e.pointerId;
  originX = e.clientX;
  originY = e.clientY;
  joyDir = null;
  try { canvas.setPointerCapture(e.pointerId); } catch(err){}
});

canvas.addEventListener('pointermove', function(e){
  if(e.pointerId !== touchId) return;

  var dx = e.clientX - originX;
  var dy = e.clientY - originY;
  var mag = Math.sqrt(dx * dx + dy * dy);

  var d = null;
  if(mag > 22){
    d = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? 'right' : 'left')
      : (dy > 0 ? 'down'  : 'up');
  }

  if(d !== joyDir){
    if(joyDir) releaseDir(joyDir);
    joyDir = d;
    if(d) pressDir(d);
  }
});

function endJoy(e){
  if(e && e.pointerId !== touchId) return;
  if(joyDir) releaseDir(joyDir);
  joyDir = null;
  touchId = null;
}
canvas.addEventListener('pointerup', endJoy);
canvas.addEventListener('pointercancel', endJoy);

// دکمه‌های داخل کارت‌ها
overlay.addEventListener('click', function(e){
  var img = e.target.closest('.revealFrame img');
  if(img){ openLightbox(img.getAttribute('src')); return; }

  var btn = e.target.closest('button');
  if(!btn) return;
  var act = btn.getAttribute('data-act');
  if(act === 'restart' || btn.id === 'startBtn') startGame();
  else if(act === 'nextLevel') goNextLevel();
});

/* =========================================================
   پنل «گالری»
   ========================================================= */
var galleryPanel = document.getElementById('galleryPanel');
var galleryGrid  = document.getElementById('galleryGrid');

function openGalleryPanel(){
  renderGalleryGrid();
  galleryPanel.classList.add('show');
}
function closeGalleryPanel(){
  galleryPanel.classList.remove('show');
}

function renderGalleryGrid(){
  galleryGrid.innerHTML = '';
  if(!images.length){
    var p = document.createElement('p');
    p.className = 'empty';
    p.textContent = t('gallery_empty');
    galleryGrid.appendChild(p);
    return;
  }
  for(var i = 0; i < images.length; i++){
    (function(i){
      var unlocked = setHas(i);
      var cell = document.createElement('div');
      cell.className = 'photoCell' + (unlocked ? ' gCell' : ' locked');
      if(unlocked){
        cell.innerHTML = '<img src="' + images[i] + '" alt="">';
        cell.addEventListener('click', function(){ openLightbox(images[i]); });
      } else {
        cell.innerHTML = '<span>🔒</span>';
      }
      galleryGrid.appendChild(cell);
    })(i);
  }
}

document.getElementById('galleryCloseBtn').addEventListener('click', closeGalleryPanel);
document.getElementById('btnGallery').addEventListener('click', openGalleryPanel);

/* =========================================================
   پنل «تنظیمات» — زبان، امتیازدهی/نظر در مایکت، درباره‌ی برنامه
   ========================================================= */
var settingsPanel = document.getElementById('settingsPanel');

function openSettingsPanel(){ settingsPanel.classList.add('show'); }
function closeSettingsPanel(){ settingsPanel.classList.remove('show'); }

document.getElementById('btnSettings').addEventListener('click', openSettingsPanel);
document.getElementById('settingsCloseBtn').addEventListener('click', closeSettingsPanel);
settingsPanel.addEventListener('click', function(e){
  if(e.target === settingsPanel) closeSettingsPanel();
});

document.getElementById('langBtnFa').addEventListener('click', function(){ setLang('fa'); });
document.getElementById('langBtnEn').addEventListener('click', function(){ setLang('en'); });

function callBridge(fnName){
  if(typeof Android === 'undefined' || typeof Android[fnName] !== 'function'){
    flash(t('android_only'));
    return;
  }
  try{
    Android[fnName]();
  }catch(err){
    flash(t('bridge_error'));
  }
}

document.getElementById('btnMyketRate').addEventListener('click', function(){
  callBridge('openMyket');
});
document.getElementById('btnMyketComment').addEventListener('click', function(){
  callBridge('openMyketComment');
});
document.getElementById('btnAboutGithub').addEventListener('click', function(){
  if(typeof Android === 'undefined' || typeof Android.openUrl !== 'function'){
    flash(t('android_only'));
    return;
  }
  try{
    Android.openUrl('https://github.com/mistroll95');
  }catch(err){
    flash(t('bridge_error'));
  }
});

/* =========================================================
   نمایش تمام‌صفحه‌ی عکس + تنظیم به‌عنوان پس‌زمینه‌ی گوشی
   ========================================================= */
var lightbox        = document.getElementById('lightbox');
var lightboxImg     = document.getElementById('lightboxImg');
var lightboxCloseBtn= document.getElementById('lightboxCloseBtn');
var btnWallpaper     = document.getElementById('btnSetWallpaper');
var wallpaperLabel   = btnWallpaper.querySelector('.wLabel');

var currentWallpaperSrc = null;
var wallpaperBusy = false;

function resetWallpaperBtn(){
  wallpaperBusy = false;
  btnWallpaper.classList.remove('busy');
  wallpaperLabel.textContent = t('wallpaper_btn');
}

function openLightbox(src){
  lightboxImg.src = src;
  currentWallpaperSrc = src;
  resetWallpaperBtn();
  lightbox.classList.add('show');
}

function closeLightbox(){
  lightbox.classList.remove('show');
  lightboxImg.src = '';
  currentWallpaperSrc = null;
}

lightbox.addEventListener('click', function(e){
  if(e.target.closest('.wallpaperBtn') || e.target.closest('.lightboxClose')) return;
  closeLightbox();
});
lightboxCloseBtn.addEventListener('click', function(e){
  e.stopPropagation();
  closeLightbox();
});

btnWallpaper.addEventListener('click', function(e){
  e.stopPropagation();
  if(wallpaperBusy || !currentWallpaperSrc) return;

  if(typeof Android === 'undefined' || typeof Android.setWallpaper !== 'function'){
    flash(t('android_only'));
    return;
  }

  wallpaperBusy = true;
  btnWallpaper.classList.add('busy');
  wallpaperLabel.textContent = t('wallpaper_busy');

  try{
    Android.setWallpaper(currentWallpaperSrc);
  }catch(err){
    resetWallpaperBtn();
    flash(t('bridge_error'));
  }
});

window.onWallpaperResult = function(success, message){
  resetWallpaperBtn();
  flash(message || (success ? 'پس‌زمینه تنظیم شد' : 'تنظیم پس‌زمینه ناموفق بود'));
};

/* =========================================================
   شروع
   ========================================================= */
function startGame(){
  score = 0;
  lives = 3;
  level = 1;
  shake = 0;
  deadTimer = 0;
  stepAcc = 0;
  lastT = 0;

  buildImageLayer(level);
  newBoard();
  spawnEnemies();
  updateHUD();
  hideOverlay();

  running = true;
}

document.addEventListener('gesturestart', function(e){ e.preventDefault(); });
document.addEventListener('touchmove', function(e){
  if(e.target === canvas) e.preventDefault();
}, { passive: false });

applyI18N();

requestAnimationFrame(loop);

})();