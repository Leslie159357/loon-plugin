// ==ClawHub/YouMind Unlock - Universal==
// @version 1.0
// @description YouMind (com.mindbicycle.YouMind) - Unlock Pro/Premium via MITM
// @mitm clawhub.ai
// ==/ClawHub/YouMind Unlock==

const url = $request.url;
const method = $request.method;
const body = $request.body;

// Define the API paths to intercept
const targetPaths = [
  "/api/v1/getCurrentUser",
  "/api/v1/subscription/verifyTransaction",
  "/api/v1/credit/getCreditAccount",
  "/api/v1/credit/getTotalBonusRedeem",
  "/api/v1/credit/listCreditsConsumeTransactionsInCurrentPeriod",
  "/api/v1/credit/listPermanentCreditGrants",
  "/api/v1/credit/listSkillEarnings",
  "/api/v1/user/",
  "/api/v1/sprite/"
];

// Check if this URL should be intercepted
const shouldIntercept = targetPaths.some(path => url.includes(path));

if (!shouldIntercept) {
  $done({});
  return;
}

// For response modification
if (method === "GET" || method === "POST") {
  // Read the response body
  let responseBody = $response.body;
  
  try {
    // Try to parse as JSON
    const obj = JSON.parse(responseBody);
    
    // Recursively modify VIP/subscription fields
    function unlockPro(obj) {
      if (!obj || typeof obj !== 'object') return;
      
      for (const key of Object.keys(obj)) {
        const lower = key.toLowerCase();
        
        // VIP/Pro status fields
        if (lower === "pro" || lower === "ispro" || lower === "is_pro") {
          obj[key] = true;
        }
        if (lower === "premium" || lower === "ispremium" || lower === "is_premium") {
          obj[key] = true;
        }
        if (lower === "subscription" || lower === "is_subscription" || lower === "issubscription") {
          obj[key] = true;
        }
        if (lower === "issubscribed" || lower === "is_subscribed" || lower === "subscribed") {
          obj[key] = true;
        }
        if (lower === "hassubscription" || lower === "has_subscription") {
          obj[key] = true;
        }
        if (lower === "active" || lower === "isactive" || lower === "is_active") {
          obj[key] = true;
        }
        if (lower === "status") {
          if (typeof obj[key] === 'string' && ['trial', 'expired', 'none', 'inactive', 'canceled', 'cancelled'].includes(obj[key].toLowerCase())) {
            obj[key] = "active";
          }
        }
        if (lower === "tier" || lower === "plantier") {
          if (typeof obj[key] === 'string' && ['free', 'none', 'basic'].includes(obj[key].toLowerCase())) {
            obj[key] = "pro";
          }
        }
        if (lower === "plan" || lower === "subscriptionplan") {
          if (typeof obj[key] === 'string' && ['free', 'none'].includes(obj[key].toLowerCase())) {
            obj[key] = "pro_monthly";
          }
        }
        
        // Expiration dates - set to far future
        if (lower === "expiresat" || lower === "expires_at" || lower === "expiration" || lower === "expirationdate" || lower === "expiration_date") {
          if (typeof obj[key] === 'number' && obj[key] < 9999999999999) {
            obj[key] = 4102444800000; // Year 2099
          }
        }
        if (lower === "expirestimestamp" || lower === "expire_time" || lower === "expiretime") {
          if (typeof obj[key] === 'number' && obj[key] < 9999999999999) {
            obj[key] = 4102444800000;
          }
        }
        
        // Credit/bonus related
        if (lower === "credit" || lower === "credits" || lower === "balance") {
          if (typeof obj[key] === 'number' && obj[key] < 99999) {
            obj[key] = 99999;
          }
        }
        if (lower === "bonusredeem" || lower === "bonus" || lower === "totalbonus") {
          if (typeof obj[key] === 'number') {
            obj[key] = 99999;
          }
        }
        
        // Recursively process nested objects
        if (typeof obj[key] === 'object') {
          unlockPro(obj[key]);
        }
      }
    }
    
    unlockPro(obj);
    
    // Return modified response
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    // Not JSON, pass through
    $done({});
  }
} else {
  $done({});
}
