// LinguoLand 会员解锁 — Loon 脚本
// 判定链: GET api.linguoland.com/api/v1/auth/quota-status → tier 字段
// 原理: 伪造 quota-status 响应为 MEMBER + 永久会员 + 超大配额
// 注意: 服务器可能返回 304 (ETag 缓存) → 需先用 http-request 强制 no-cache

// ============ 脚本 1: linguoland_nocache.js (http-request) ============
// 强制服务器返回 200 完整响应，绕过 304 缓存
/*
$done({
  headers: Object.assign({}, $request.headers, {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  })
});
*/

// ============ 脚本 2: linguoland_unlock.js (http-response) ============
// 伪造 quota-status 响应: tier=MEMBER + 永久会员 + 超大配额

function unlockQuotaStatus(body) {
  try {
    var data = JSON.parse(body);
    var future = '2099-12-31T16:00:00.000Z';
    data.tier = 'MEMBER';
    var quotas = data.quotas || {};
    // 枚举/翻译/AI 配额全部放大
    ['ENRICH', 'TRANSLATE', 'CHAT'].forEach(function(k) {
      if (quotas[k]) {
        quotas[k].limit = 999999999;
        quotas[k].used = 0;
        quotas[k].remaining = 999999999;
        quotas[k].resetAt = future;
      }
    });
    data.quotas = quotas;
    data.cost = {
      ceilingCents: 99999999,
      usedCents: 0,
      remainingCents: 99999999,
      resetAt: future
    };
    data.membership = {
      paidUntil: '2099-12-31T16:00:00.000Z',
      daysLeft: 99999,
      isLifetime: true
    };
    return JSON.stringify(data);
  } catch (e) {
    return body; // 解析失败原样返回，不破坏
  }
}

// 通用: 深度替换所有 membership/tier 相关响应中的会员字段
function deepUnlock(obj) {
  if (!obj || typeof obj !== 'object') return;
  var future = '2099-12-31T16:00:00.000Z';
  Object.keys(obj).forEach(function(k) {
    var v = obj[k];
    if (k === 'tier' || k === 'planType' || k === 'currentTier' || k === 'type') {
      if (v === 'FREE' || v === 'free' || v === 'GUEST' || v === 'guest') {
        obj[k] = 'MEMBER';
      }
    }
    if (k === 'isActive' || k === 'isEnabled' || k === 'isPremium' || k === 'hasMembership' || k === 'isLifetime') {
      if (v === false || v === 0) obj[k] = true;
    }
    if (k === 'paidUntil' || k === 'expiresAt' || k === 'expireAt' || k === 'endTime' || k === 'renewAt') {
      if (typeof v === 'string') obj[k] = future;
      if (typeof v === 'number') obj[k] = 4102444800000; // 2099-12-31
    }
    if (k === 'daysLeft') obj[k] = 99999;
    if (v && typeof v === 'object') deepUnlock(v);
  });
}

var url = $request.url;
var body = $response.body;

if (body && (url.indexOf('/api/v1/auth/quota-status') >= 0)) {
  body = unlockQuotaStatus(body);
} else if (body) {
  // 其他接口: 深度替换会员字段 (me-snapshot / profile / credits 等)
  try {
    var data = JSON.parse(body);
    deepUnlock(data);
    body = JSON.stringify(data);
  } catch (e) {}
}

$done({ body: body });
