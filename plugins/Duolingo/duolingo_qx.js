// ==Quantumult X==
// @name         多邻国 Duolingo 完整解锁 v11
// @description  Super会员 + Max视频通话入口修正 + 钻石999999 + 时间宝/连胜激冻无限 + 连胜1000天🔥 + 安全盾2099 + 成就全满 + 日历1000天
// @version      11.0
// @author       Minis
// @icon         https://simg-ssl.duolingo.com/ssr-logos/duolingo_logo.svg
// ==/Quantumult X==

const G = 999999, TB = 999, FZ = 999;

const MAX_FEATURES = ['NO_NETWORK_ADS','UNLIMITED_HEARTS','LEGENDARY_LEVEL','MISTAKES_INBOX',
  'MASTERY_QUIZ','EXPLAIN_MY_ANSWER','LICENSED_SONGS','CAN_ADD_SECONDARY_MEMBERS',
  'DUOLINGO_MAX','ROLE_PLAY','VIDEO_CALL','ADVANCED_MATH'];

function pushFeatures(arr) { MAX_FEATURES.forEach(f => { if (!arr.includes(f)) arr.push(f); }); }

function modReq(b) {
  try {
    let o = JSON.parse(b);
    if (!o.requests) return b;
    o.requests.forEach(r => {
      if (r.method === 'POST' && r.url && r.url.includes('shop-items')) {
        let b2 = JSON.parse(r.body);
        b2.isFree = true; b2.gems = 0;
        r.body = JSON.stringify(b2);
      }
    });
    return JSON.stringify(o);
  } catch(e) { return b; }
}

// ===== 业务字段修改（用户模型：钻石/能量/时间宝/连胜装饰等）=====
// 返回 true 表示改动了
function modUser(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return false;
  // experiments 上报响应：绝对不动，避免污染 A/B 上报链路
  if (Array.isArray(d.experiments) && d.experiments.length && d.experiments[0] && typeof d.experiments[0].name === 'string') return false;

  let m = false;
  if (typeof d.gems === 'number') { d.gems = G; m = true; }
  if (d.gemsConfig && typeof d.gemsConfig.gems === 'number') { d.gemsConfig.gems = G; m = true; }
  if (d.trackingProperties && typeof d.trackingProperties.gems === 'number') { d.trackingProperties.gems = G; m = true; }

  if (d.subscriberLevel && d.subscriberLevel !== 'PREMIUM') { d.subscriberLevel = 'PREMIUM'; m = true; }

  if (d.health) { d.health.unlimitedHeartsAvailable = true; m = true; }
  if (d.energyConfig) { d.energyConfig.maxEnergy = 9999; d.energyConfig.energy = 9999; m = true; }

  if (d.timerBoostConfig) {
    d.timerBoostConfig.timerBoosts = TB;
    d.timerBoostConfig.hasFreeTimerBoost = true;
    d.timerBoostConfig.hasPurchasedTimerBoost = true;
    d.timerBoostConfig.timePerBoost = 7200; m = true;
  }

  if (d.trackingProperties) {
    d.trackingProperties.num_item_streak_freeze = FZ;
    d.trackingProperties.num_item_streak_freeze_total = FZ;
    d.trackingProperties.has_item_streak_freeze = true;
    d.trackingProperties.streak = 1000;
    d.trackingProperties.has_item_weekend_amulet = true;
    d.trackingProperties.has_item_streak_wager = true; m = true;
  }

  if (d.streakData && typeof d.streakData === 'object') {
    d.streakData.length = 1000;
    if (typeof d.streakData.currentStreak === 'number') d.streakData.currentStreak = 1000;
    d.streakData.updatedTimestamp = Math.floor(Date.now() / 1000); m = true;
  }

  if (d.xpBoostMultiplier !== undefined && d.xpBoostMultiplier !== 5) { d.xpBoostMultiplier = 5; m = true; }

  // 会员功能数组：只要有 subscriptionFeatures 字段就补全（Super/Max 判定依据）
  if (Array.isArray(d.subscriptionFeatures)) { pushFeatures(d.subscriptionFeatures); m = true; }
  return m;
}

// ===== config 响应：打开 Max 视频通话相关 flag =====
function modConfig(d) {
  if (!d.featureFlags || typeof d.featureFlags !== 'object') return false;
  const ff = d.featureFlags;
  ff.ios_video_call_tab_should_force_unavailable_state = false;   // 关键：视频通话 Tab 强制不可用
  ff.ios_video_call_public_testing_indicator_china = true;        // 中国区公开测试指示
  ff.ios_role_play_on_path = true;
  ff.ios_duolingo_max_video_probability = 1.0;
  ff.ios_fetch_subscription_features = true;
  if (!Array.isArray(d.subscriptionFeatures)) d.subscriptionFeatures = [];
  pushFeatures(d.subscriptionFeatures);
  if (d.xpBoostMultiplier === undefined) d.xpBoostMultiplier = 5; else d.xpBoostMultiplier = 5;
  return true;
}

// ===== 单一已解析对象处理入口（顶层或 batch 嵌套体）=====
// 返回新字符串或 null(未改)
function handleParsed(d, url) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return null;
  if (Array.isArray(d.experiments) && d.experiments.length && d.experiments[0] && typeof d.experiments[0].name === 'string') return null;

  // —— 专项响应 ——
  if (d.streakData && typeof d.streakData === 'object' && ('currentStreak' in d.streakData) && d.streakData.currentStreak && typeof d.streakData.currentStreak === 'object') {
    d.streakData.currentStreak = {length:1000, lastExtendedDate:'2099-12-31', endDate:'2099-12-31', startDate:'2026-01-01'};
    d.streakData.previousStreak = {length:1000, lastExtendedDate:'2099-12-31', endDate:'2099-12-31', startDate:'2026-01-01'};
    d.streakData.longestStreak = {length:1000, endDate:'2099-12-31', achieveDate:'2099-01-01', startDate:'2026-01-01'};
    modUser(d);
    return JSON.stringify(d);
  }

  if (d.summaries && Array.isArray(d.summaries)) {
    const summaries = [];
    const now = Math.floor(Date.now() / 1000);
    for (let day = 0; day < 1000; day++) {
      const date = now - day * 86400;
      const dateStart = date - (date % 86400);
      summaries.push({
        gainedXp: 500 + Math.floor(Math.random() * 200),
        frozen: false, streakExtended: true, date: dateStart,
        userId: '716692732', repaired: true, dailyGoalXp: 10,
        numSessions: 5, totalSessionTime: 600, shielded: false
      });
    }
    d.summaries = summaries;
    return JSON.stringify(d);
  }

  if (d.streakShields || (url && url.includes('streak-shield'))) {
    d.streakShields = d.streakShields || [];
    if (d.streakShields.length === 0) {
      d.streakShields.push({userId:'716692732', startDate:{year:2026, month:1, day:1}, endDate:{year:2099, month:12, day:31}});
    } else {
      d.streakShields.forEach(s => { s.endDate = {year:2099, month:12, day:31}; s.startDate = {year:2026, month:1, day:1}; });
    }
    return JSON.stringify(d);
  }

  if (d.countTotalPerfectStreakWeeks !== undefined) {
    d.countTotalPerfectStreakWeeks = 999;
    d.countCurrentPerfectStreakWeeks = 999;
    d.perfectStreakDates = [{startDate:'2026-01-01', endDate:'2099-12-31'}];
    return JSON.stringify(d);
  }

  if (d.achievements && Array.isArray(d.achievements)) {
    d.achievements.forEach(a => {
      a.tier = 9; a.count = 99999; a.shouldShowUnlock = false; a.noProgressBar = true;
      let ts = []; let now = Date.now();
      for (let t = 0; t < (a.tierCounts ? a.tierCounts.length : 10); t++) ts.push(now - (10-t) * 86400000);
      a.unlockTimestamps = ts;
    });
    return JSON.stringify(d);
  }

  // —— config ——
  if (d.featureFlags && typeof d.featureFlags === 'object') {
    if (modConfig(d)) return JSON.stringify(d);
  }

  // —— 通用用户模型 ——
  if (modUser(d)) return JSON.stringify(d);
  return null;
}

function modBatch(b) {
  try {
    let o = JSON.parse(b);
    if (!o.responses) return b;
    let changed = false;
    for (let r of o.responses) {
      if (r.status === 400 && r.body === '') { r.status = 200; r.body = '{}'; changed = true; continue; }
      if (r.status !== 200 || typeof r.body !== 'string') continue;
      let d;
      try { d = JSON.parse(r.body); } catch(e) { continue; }
      const out = handleParsed(d, r.url || '');
      if (out) { r.body = out; changed = true; }
    }
    return changed ? JSON.stringify(o) : b;
  } catch(e) { return b; }
}

function standalone(url, b) {
  try {
    let d = JSON.parse(b);
    if (typeof d !== 'object' || d === null) return b;
    const out = handleParsed(d, url);
    return out ? out : b;
  } catch(e) { return b; }
}



// ====== 响应入口（Quantumult X）======
const url = typeof $request !== 'undefined' ? $request.url : '';
const method = typeof $request !== 'undefined' ? $request.method : '';
const body = typeof $response !== 'undefined' ? $response.body : '';

if (typeof $response === 'undefined') {
  if (body && url.includes('/batch')) {
    const mb = modReq(body);
    if (mb !== body) { $done({ body: mb }); } else { $done({}); }
  } else { $done({}); }
  return;
}

if (!body) { $done({}); return; }

try {
  if (url.includes('/batch')) {
    $done({ body: modBatch(body) });
  } else {
    $done({ body: standalone(url, body) });
  }
} catch(e) { $done({}); }
