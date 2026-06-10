// ==ClawHub/YouMind Pro Unlock v2.0==
// @version 2.0
// @description YouMind (com.mindbicycle.YouMind) - Unlock Pro via MITM
// @mitm hello-lucy.com
// ==/ClawHub/YouMind Pro Unlock==

const url = $request.url;
const method = $request.method;

// 实际抓包确认的域名: hello-lucy.com（不是 clawhub.ai）
// 关键 API 路径
const targetPaths = [
  "/api/v1/getCurrentUser",
  "/api/v1/subscription/findSubscription",
  "/api/v1/credit/getCreditAccount",
  "/api/v1/credit/getTotalBonusRedeem",
  "/api/v1/credit/listCreditsConsumeTransactionsInCurrentPeriod",
  "/api/v1/credit/listPermanentCreditGrants",
  "/api/v1/credit/listSkillEarnings",
  "/api/v1/user/patchUserName",
  "/api/v1/user/patchUserAvatar"
];

const shouldIntercept = targetPaths.some(path => url.includes(path));

if (!shouldIntercept) {
  $done({});
  return;
}

if (method === "GET" || method === "POST") {
  let body = $response.body;

  try {
    let obj = JSON.parse(body);

    function unlockPro(obj) {
      if (!obj || typeof obj !== 'object') return;

      for (const key of Object.keys(obj)) {
        const lower = key.toLowerCase();

        // ===== 空间/账户状态 =====
        if (lower === "status") {
          if (typeof obj[key] === 'string' && ["trialing", "trial", "expired", "none", "inactive", "canceled", "cancelled", "free"].includes(obj[key].toLowerCase())) {
            obj[key] = "active";
          }
        }

        // ===== 产品层级 =====
        if ((lower === "producttier" || lower === "product_tier" || lower === "tier") && typeof obj[key] === 'string') {
          if (["free", "trial", "none"].includes(obj[key].toLowerCase())) {
            obj[key] = "pro";
          }
        }

        // ===== subtier =====
        if (lower === "subtier" || lower === "sub_tier") {
          if (typeof obj[key] === 'number' && obj[key] < 10) {
            obj[key] = 999;
          }
        }

        // ===== 会员状态 =====
        if (["pro", "ispro", "is_pro", "premium", "ispremium", "is_premium"].includes(lower)) {
          obj[key] = true;
        }
        if (["issubscribed", "is_subscribed", "subscribed", "hassubscription", "has_subscription"].includes(lower)) {
          obj[key] = true;
        }
        if (["haseverhadsubscription", "has_ever_had_subscription"].includes(lower)) {
          obj[key] = true;
        }
        if (["subscription", "is_subscription", "issubscription"].includes(lower)) {
          obj[key] = true;
        }

        // ===== 到期时间 =====
        if (["expiresat", "expires_at", "expiration", "expirationdate", "expiration_date", "trialtimestamp", "trialexpiresat"].includes(lower)) {
          if (typeof obj[key] === 'number' && obj[key] < 9999999999999) {
            obj[key] = 4102444800000; // 2099
          }
          if (typeof obj[key] === 'string' && obj[key].includes("2026")) {
            obj[key] = obj[key].replace("2026", "2099");
          }
        }

        // ===== 积分 =====
        if (["monthlybalance", "monthly_balance", "permanentbalance", "permanent_balance", "bonusbalance", "bonus_balance", "spendablebalance", "spendable_balance", "dailybalance", "daily_balance"].includes(lower)) {
          if (typeof obj[key] === 'number' && obj[key] < 999999) {
            obj[key] = 999999;
          }
        }
        if (["monthlyquota", "monthly_quota"].includes(lower)) {
          if (typeof obj[key] === 'number' && obj[key] < 999999) {
            obj[key] = 999999;
          }
        }
        if (lower === "credit" || lower === "credits" || lower === "balance") {
          if (typeof obj[key] === 'number') {
            obj[key] = 999999;
          }
        }

        // ===== currentPeriod 和 quota 周期 =====
        if (lower === "currentperiodstart" || lower === "currentperiodend") {
          if (typeof obj[key] === 'string' && obj[key].includes("2026")) {
            obj[key] = obj[key].replace("2026", "2099");
          }
        }

        // ===== 递归 =====
        if (typeof obj[key] === 'object') {
          unlockPro(obj[key]);
        }
      }
    }

    unlockPro(obj);
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
} else {
  $done({});
}
