// ==ClawHub/YouMind Max Unlock v3.0==
// @version 3.0
// @description productTier=pro->max, 积分全免, 所有技能免费直接使用
// @mitm hello-lucy.com
// ==/ClawHub/YouMind Max Unlock v3.0==

const url = $request.url;
const method = $request.method;

// 拦截所有 hello-lucy.com 的 API
const targetPaths = [
  "getCurrentUser",      // 用户状态
  "findSubscription",    // 订阅
  "getCreditAccount",    // 积分
  "getTotalBonusRedeem",
  "listCreditsConsumeTransactionsInCurrentPeriod",
  "listPermanentCreditGrants",
  "listSkillEarnings",
  "getSkill",            // 技能详情（含购买状态）
  "listInstalledSkills", // 已安装技能
  "listSkillsV2",        // 技能列表
  "listFeaturedSkills",
  "listMonthlyTopSkills",
  "installSkill",        // 安装技能
  "publishSkill",
  "listBoards",          // 看板
  "getBoardDetail",
  "getDefaultBoard",
  "ensureDefault",       // sprite
  "sessionLoad",
  "sessionPrompt",
  "connector",
  "listConnectorTemplates",
  "listConnectors",
  "packGallery",
  "listPacks",
  "skillGallery"
];

const shouldIntercept = targetPaths.some(path => url.includes(path));

if (!shouldIntercept) {
  $done({});
  return;
}

if (method === "GET" || method === "POST") {
  let body = $response.body;
  if (!body || body.length < 5) {
    $done({});
    return;
  }
  
  try {
    let obj = JSON.parse(body);
    
    function modifyVIP(obj) {
      if (!obj || typeof obj !== 'object') return;
      
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        
        // ========== Tier: change "pro" or "free" to "max" ==========
        if ((key === "product_tier" || key === "productTier") && typeof val === "string") {
          if (["free", "trial", "none", "pro"].includes(val.toLowerCase())) {
            obj[key] = "max";
          }
        }
        
        // sub_tier / subTier
        if ((key === "sub_tier" || key === "subTier") && typeof val === "number") {
          obj[key] = 9999;
        }
        
        // ========== Status ==========
        if (key === "status" && typeof val === "string" && 
            ["trialing", "trial", "expired", "none", "inactive", "canceled", "cancelled", "free"].includes(val.toLowerCase())) {
          obj[key] = "active";
        }
        
        // ========== Subscription flags ==========
        if (["has_ever_had_subscription", "hasEverHadSubscription", 
             "hasPurchased", "has_purchased", 
             "isInstalled", "is_installed"].includes(key) && val === false) {
          obj[key] = true;
        }
        
        // ========== Skill purchase ==========
        if (key === "canViewerPurchase") {
          obj[key] = true;
        }
        if (key === "viewerPurchaseBlockedReason" && typeof val === "string") {
          delete obj[key];
        }
        if (key === "price" && typeof val === "number" && val > 0) {
          obj[key] = 0;  // Free!
        }
        
        // ========== Balance (all to huge) ==========
        if (["monthly_balance", "monthlyBalance", "permanent_balance", "permanentBalance", 
             "bonus_balance", "bonusBalance", "spendable_balance", "spendableBalance",
             "daily_balance", "dailyBalance", "monthly_quota", "monthlyQuota",
             "daily_limit", "dailyLimit"].includes(key)) {
          if (typeof val === "number") {
            obj[key] = 9999999;
          }
        }
        
        // ========== Dates -> 2099 ==========
        if (["trialExpiresAt", "trial_expires_at", "expiresAt", "expires_at",
             "expirationDate", "expiration_date",
             "current_period_end", "currentPeriodEnd",
             "current_period_start", "currentPeriodStart"].includes(key) && typeof val === "string") {
          if (val.includes("2026") || val.includes("2025") || val.includes("2024") || val.includes("2027") || val.includes("2028")) {
            obj[key] = val.replace(/202[4-8]/g, "2099");
          }
        }
        
        // ========== Generic ==========
        if ((key === "credit" || key === "credits" || key === "balance") && typeof val === "number") {
          obj[key] = 9999999;
        }
        
        // Recursion
        if (typeof val === 'object') {
          modifyVIP(val);
        }
      }
    }
    
    modifyVIP(obj);
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    // Not JSON, pass through
    $done({});
  }
} else {
  $done({});
}
