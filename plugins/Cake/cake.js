// Cake (me.mycake) 6.8.1 会员解锁插件 v2
// 抓包确认：真实 API = api.mycake.me（旧）+ api.cakeapp.me（/gw/ 网关）
// 会员状态权威 = /app/start 响应 extra.membership（NONE/BASIC/PLUS/FREE_TRIAL）
// 内容锁定 = 各接口响应的 membershipOnly/restrictedNow/restrictedAfterFreeTrial/isMembershipOnly
// 通用处理：所有 JSON 响应过一遍，只改已存在的字段值，不新增字段

const TRUE_VALUES = { membership: 'PLUS' }; // membership:"NONE"|"BASIC" → "PLUS"

// 锁定类字段：true → false（解锁内容；含抓包新发现的 membershipOnlyPlaylist/membershipOnlySentence）
const UNLOCK_FALSE = [
  'membershipOnly', 'isMembershipOnly', 'restrictedNow', 'restrictedAfterFreeTrial',
  'membershipOnlyPlaylist', 'membershipOnlySentence',
];

// 票数类字段：改大
const BIG_NUMBERS = ['membershipTickets', 'familyMembershipTickets', 'freeTrialTickets', 'familyFreeTrialTickets'];

// 爱心字段（/heart 响应）
const HEART_NUMBERS = ['count', 'maximumCount', 'adHeartCount'];

function log(msg) {
  console.log('[Cake] ' + msg);
}

function fakeBody(body, url) {
  if (!body) return body;
  const trimmed = body.trimStart();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return body; // 非 JSON 跳过
  try {
    const obj = JSON.parse(trimmed);
    let changed = false;
    const isHeart = /\/heart\b/.test(url);

    function walk(o, path) {
      if (!o || typeof o !== 'object') return;
      if (Array.isArray(o)) { o.forEach((v, i) => walk(v, path + '[' + i + ']')); return; }
      for (const k of Object.keys(o)) {
        const v = o[k];
        const p = path + '.' + k;
        if (v && typeof v === 'object') { walk(v, p); continue; }

        // membership 状态：NONE/BASIC → PLUS
        if (k === 'membership' && typeof v === 'string' && v !== 'PLUS' && /^(NONE|BASIC|FREE_TRIAL)$/.test(v)) {
          o[k] = 'PLUS'; changed = true; log('MEMBERSHIP ' + p + ' ' + v + ' -> PLUS');
        }
        // 锁定字段 true → false
        if (typeof v === 'boolean' && v === true && UNLOCK_FALSE.includes(k)) {
          o[k] = false; changed = true; log('UNLOCK ' + p + ' -> false');
        }
        // 票数改大
        if (typeof v === 'number' && BIG_NUMBERS.includes(k) && v < 999) {
          o[k] = 999; changed = true; log('TICKETS ' + p + ' ' + v + ' -> 999');
        }
        // 爱心（仅 /heart 接口）
        if (isHeart && typeof v === 'number' && HEART_NUMBERS.includes(k) && v < 999) {
          o[k] = 999; changed = true; log('HEART ' + p + ' ' + v + ' -> 999');
        }
      }
    }
    walk(obj, '$');
    if (changed) {
      const nb = JSON.stringify(obj);
      log('FAKED ' + url.slice(0, 100) + ' :: ' + nb.slice(0, 800));
      return nb;
    }
    return body;
  } catch (e) {
    log('parse fail ' + url.slice(0, 80) + ': ' + e.message);
    return body;
  }
}

// ---- Loon http-response ----
if (typeof $response !== 'undefined' && $response) {
  const url = ($request && $request.url) || '';
  const body = $response.body || '';
  if (body && /(subscription|membership|today|heart|ticket|app\/start|dashboard|path\/main|lecture|sentence|curriculum)/i.test(url)) {
    log('RESP ' + url);
    if (body) log('RAW ' + body.slice(0, 2000));
    const nb = fakeBody(body, url);
    if (nb !== body) {
      $done({ body: nb, headers: $response.headers });
    } else {
      $done({});
    }
  } else {
    $done({});
  }
} else {
  $done({});
}
