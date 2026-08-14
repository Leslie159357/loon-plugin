// LinguoLand 会员解锁 — http-response 脚本（v2 全面版）
// 覆盖接口:
//   GET /api/v1/auth/quota-status  → tier=MEMBER + 无限配额 + 永久会员 + used 清零
//   GET /api/v1/credits            → balance 点数放大 + freeQuota 放大 + membership 永久
//   GET /api/v1/auth/profile       → tier=MEMBER 兜底
// 判定链: 服务器 quota-status.tier 字段 (MEMBER=会员)

function future(ms) { return ms ? '2099-12-31T16:00:00.000Z' : 4102444800000; }

function unlockQuotaStatus(data) {
  var futureStr = '2099-12-31T16:00:00.000Z';
  data.tier = 'MEMBER';
  ['ENRICH', 'TRANSLATE', 'CHAT'].forEach(function(k) {
    if (data.quotas && data.quotas[k]) {
      data.quotas[k].limit = 999999999;
      data.quotas[k].used = 0;
      data.quotas[k].remaining = 999999999;
      data.quotas[k].resetAt = futureStr;
    }
  });
  data.cost = { ceilingCents: 99999999, usedCents: 0, remainingCents: 99999999, resetAt: futureStr };
  data.membership = { paidUntil: futureStr, daysLeft: 99999, isLifetime: true };
  return data;
}

function unlockCredits(data) {
  var futureStr = '2099-12-31T16:00:00.000Z';
  data.balance = 999999999;              // AI 点数无限
  data.illustrationCost = 0;             // 插画免费
  data.listenCharsPerCoin = 999999999;   // 听书几乎不耗点
  data.bilingualWordsPerCredit = 999999999;
  data.freeQuota = { ENRICH: 999999, TRANSLATE: 999999, CHAT: 999999 };
  if (data.membership) {
    if (data.membership.current) {
      data.membership.current.paidUntil = futureStr;
      data.membership.current.daysLeft = 99999;
      data.membership.current.isLifetime = true;
    }
    data.membership.lifetimeSlots = 9999;
    data.membership.lifetimeSoldOut = false;
  }
  return data;
}

// 深度替换兜底（profile / me-snapshot / 其他）
function deepUnlock(obj) {
  if (!obj || typeof obj !== 'object') return;
  var futureStr = '2099-12-31T16:00:00.000Z';
  Object.keys(obj).forEach(function(k) {
    var v = obj[k];
    if (k === 'tier' || k === 'planType' || k === 'currentTier' || k === 'type') {
      if (v === 'FREE' || v === 'free' || v === 'GUEST' || v === 'guest' || v === 'NONE') {
        obj[k] = 'MEMBER';
      }
    }
    if (k === 'isActive' || k === 'isEnabled' || k === 'isPremium' || k === 'hasMembership' || k === 'isLifetime' || k === 'isSubscriber') {
      if (v === false || v === 0 || v === null) obj[k] = true;
    }
    if (k === 'paidUntil' || k === 'expiresAt' || k === 'expireAt' || k === 'endTime' || k === 'renewAt' || k === 'validUntil') {
      if (typeof v === 'string') obj[k] = futureStr;
      if (typeof v === 'number') obj[k] = 4102444800000;
    }
    if (k === 'daysLeft' || k === 'balance' || k === 'remaining') obj[k] = 999999999;
    if (k === 'used') obj[k] = 0;
    if (v && typeof v === 'object') deepUnlock(v);
  });
}

var url = $request.url;
var body = $response.body;
if (!body) { $done({}); return; }

try {
  var data = JSON.parse(body);
  if (url.indexOf('/api/v1/auth/quota-status') >= 0) {
    data = unlockQuotaStatus(data);
  } else if (url.indexOf('/api/v1/credits') >= 0) {
    data = unlockCredits(data);
  } else {
    deepUnlock(data);
  }
  body = JSON.stringify(data);
} catch (e) {
  // 非 JSON (SSE 流式等) 原样放行
}

$done({ body: body });
