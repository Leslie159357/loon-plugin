// LinguoLand 会员解锁 — http-response 脚本 v3
// 覆盖:
//   /api/v1/auth/quota-status → tier=MEMBER + 配额无限 + used 清零 + 会员永久
//   /api/v1/credits          → balance 点数无限 + freeQuota 放大 + lifetime
//   /api/v1/auth/profile     → tier=MEMBER 兜底
// 判定链: 服务器 quota-status.tier (MEMBER=会员)

function futureStr() { return '2099-12-31T16:00:00.000Z'; }

function unlockQuotaStatus(data) {
  data.tier = 'MEMBER';
  ['ENRICH', 'TRANSLATE', 'CHAT'].forEach(function(k) {
    if (data.quotas && data.quotas[k]) {
      data.quotas[k].limit = 999999999;
      data.quotas[k].used = 0;
      data.quotas[k].remaining = 999999999;
      data.quotas[k].resetAt = futureStr();
    }
  });
  data.cost = { ceilingCents: 99999999, usedCents: 0, remainingCents: 99999999, resetAt: futureStr() };
  data.membership = { paidUntil: futureStr(), daysLeft: 99999, isLifetime: true };
  return data;
}

function unlockCredits(data) {
  data.balance = 999999999;
  data.illustrationCost = 0;
  data.listenCharsPerCoin = 999999999;
  data.bilingualWordsPerCredit = 999999999;
  data.freeQuota = { ENRICH: 999999, TRANSLATE: 999999, CHAT: 999999 };
  if (data.membership) {
    if (data.membership.current) {
      data.membership.current.paidUntil = futureStr();
      data.membership.current.daysLeft = 99999;
      data.membership.current.isLifetime = true;
    }
    data.membership.lifetimeSlots = 9999;
    data.membership.lifetimeSoldOut = false;
  }
  return data;
}

function deepUnlock(obj) {
  if (!obj || typeof obj !== 'object') return;
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
      if (typeof v === 'string') obj[k] = futureStr();
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
} catch (e) {}

$done({ body: body });
