// ==ClosureCopy==
// ==/ClosureCopy==

// Trancy MITM Plugin v2.1 - 修复 3/translations 403 + 细化所有已知 API 路径
// MITM Domain: api.trancy.org, service.trancy.org, api.revenuecat.com, api.rc-backup.com, api-paywalls.revenuecat.com
//
// 从抓包确认的关键接口:
// 1. api.trancy.org/1/user/profile?includeQuota=1  → premium: false → true
// 2. api.trancy.org/2/translator/engines            → quota.balance=0 → 999999
// 3. api.trancy.org/3/translations                  → code:403 → 200 (高级AI过期)
// 4. api.trancy.org/4/translations                  → code:403 → 200 (高级AI过期)
// 5. service.trancy.org/1/user/profile              → premium: false → true
// 6. api.rc-backup.com/v1/subscribers/{id}          → entitlements:{} → 填充pro

const VERSION = "2.1";

function main() {
  const url = $request.url;
  const path = url.replace(/^https?:\/\/[^\/]+/, '').split('?')[0];
  
  // 只处理 JSON 响应
  const ct = ($response.headers['Content-Type'] || ($response.headers['content-type'] || '')).toLowerCase();
  if (!ct.includes('json')) {
    $done({});
    return;
  }
  
  let body;
  try {
    body = JSON.parse(typeof $response.body === 'string' ? $response.body : $response.body.toString());
  } catch (e) {
    $done({});
    return;
  }
  
  console.log('[Trancy v2.1] Processing: ' + path);
  
  // ===== 1. /translations (3/4 translations - AI翻译接口) =====
  // 原始: {"code":403,"message":"高级 AI 已过期，请升级"}
  if (path === '/3/translations' || path === '/4/translations') {
    console.log('[Trancy] Translations 403 -> 200');
    $done({
      body: JSON.stringify({
        data: {
          translations: [],
          alternatives: []
        },
        message: "ok"
      })
    });
    return;
  }
  
  // ===== 2. api.trancy.org/1/user/profile 和 api.trancy.org/1/user/profile?includeQuota=1 =====
  if (path === '/1/user/profile' && /api\.trancy\.org/.test(url)) {
    console.log('[Trancy] Modifying api.trancy.org user/profile');
    if (!body.data) { $done({}); return; }
    const d = body.data;
    d.premium = true;
    d.stripePremiumActive = true;
    d.stripeAIEngineActive = true;
    d.subscription = "premium";
    d.AIEngineActive = true;
    d.plan = "premium";
    d.tier = "premium";
    d.isPro = true;
    d.isPremium = true;
    if (d.quota && d.quota.AIEngineBill) {
      const q = d.quota.AIEngineBill;
      q.balance = 999999; q.cost = 0; q.amount = 999999;
      q.OpenAI = 999999; q.Anthropic = 999999; q.DeepL = 999999;
      q.Google = 999999; q.DeepSeek = 999999; q.Meta = 999999; q.GLM = 999999;
      q.tokens = 999999; q.AIEngineExpired = 9999999999999; q.premiumExpired = 9999999999999;
    }
    if (d.quota && d.quota.AITokens) { d.quota.AITokens.used = 0; d.quota.AITokens.limit = 999999; }
    if (d.quota && d.quota.whisperx) { d.quota.whisperx.used = 0; d.quota.whisperx.limit = 999999; }
    if (d.quota && d.quota.pdf) { d.quota.pdf.used = 0; d.quota.pdf.limit = 999999; }
    $done({ body: JSON.stringify(body) });
    return;
  }
  
  // ===== 3. service.trancy.org/1/user/profile =====
  if (path === '/1/user/profile' && /service\.trancy\.org/.test(url)) {
    console.log('[Trancy] Modifying service.trancy.org user/profile');
    if (!body.data) { $done({}); return; }
    const d = body.data;
    d.premium = true;
    d.stripePremiumActive = true;
    d.stripeAIEngineActive = true;
    d.subscription = "premium";
    d.AIEngineActive = true;
    d.plan = "premium";
    d.tier = "premium";
    d.isPro = true;
    d.isPremium = true;
    if (d.quota && d.quota.AIEngineBill) {
      const q = d.quota.AIEngineBill;
      q.balance = 999999; q.cost = 0; q.amount = 999999;
      q.OpenAI = 999999; q.Anthropic = 999999; q.DeepL = 999999;
      q.Google = 999999; q.DeepSeek = 999999; q.Meta = 999999; q.GLM = 999999;
      q.tokens = 999999; q.AIEngineExpired = 9999999999999; q.premiumExpired = 9999999999999;
    }
    if (d.quota && d.quota.AITokens) { d.quota.AITokens.used = 0; d.quota.AITokens.limit = 999999; }
    if (d.quota && d.quota.whisperx) { d.quota.whisperx.used = 0; d.quota.whisperx.limit = 999999; }
    if (d.quota && d.quota.pdf) { d.quota.pdf.used = 0; d.quota.pdf.limit = 999999; }
    $done({ body: JSON.stringify(body) });
    return;
  }
  
  // ===== 4. /2/translator/engines - 翻译引擎配额 =====
  if (path === '/2/translator/engines') {
    console.log('[Trancy] Modifying translator/engines');
    if (body.data && body.data.quota) {
      const q = body.data.quota;
      q.balance = 999999; q.cost = 0; q.amount = 999999;
      q.OpenAI = 999999; q.Anthropic = 999999; q.DeepL = 999999;
      q.Google = 999999; q.DeepSeek = 999999; q.Meta = 999999; q.GLM = 999999;
      q.tokens = 999999; q.AIEngineExpired = 9999999999999; q.premiumExpired = 9999999999999;
    }
    $done({ body: JSON.stringify(body) });
    return;
  }
  
  // ===== 5. RevenueCat - api.rc-backup.com/v1/subscribers/{id} =====
  if (/api\.revenuecat\.com|api\.rc-backup\.com/.test(url) && body.subscriber) {
    console.log('[Trancy] Modifying RevenueCat subscriber');
    const sub = body.subscriber;
    
    // 确保 entitlements
    if (!sub.entitlements) sub.entitlements = {};
    for (const eid of ["pro", "premium", "plus", "all_access"]) {
      if (!sub.entitlements[eid]) sub.entitlements[eid] = {};
      sub.entitlements[eid] = {
        ...sub.entitlements[eid],
        expires_date: "2099-12-31T23:59:59Z",
        purchase_date: "2024-06-10T00:00:00Z",
        latest_purchase_date: "2024-06-10T00:00:00Z",
        product_identifier: sub.entitlements[eid]?.product_identifier || "com.trancy.app_yearly",
        is_active: true, will_renew: true, is_sandbox: false,
        ownership_type: "PURCHASED", store: "app_store", period_type: "active",
        original_purchase_date: "2024-01-01T00:00:00Z",
        unsubscribe_detected_at: null, billing_issues_detected_at: null, refund_reason: null
      };
    }
    
    // 订阅
    if (!sub.subscriptions) sub.subscriptions = {};
    for (const pid of ["com.trancy.app_monthly", "com.trancy.app_yearly", "com.trancy.app_ai_monthly", "com.trancy.app_ai_yearly"]) {
      if (!sub.subscriptions[pid]) sub.subscriptions[pid] = {};
      sub.subscriptions[pid] = {
        ...sub.subscriptions[pid],
        expires_date: "2099-12-31T23:59:59Z",
        purchase_date: sub.subscriptions[pid]?.purchase_date || "2024-06-10T00:00:00Z",
        is_active: true, will_renew: true, is_sandbox: false,
        period_type: "active", store: "app_store",
        ownership_type: "PURCHASED",
        unsubscribe_detected_at: null, billing_issues_detected_at: null
      };
    }
    
    sub.management_url = "https://apps.apple.com/account/subscriptions";
    body.request_date = "2099-12-31T23:59:59Z";
    body.request_date_ms = "9999999999999";
    
    $done({ body: JSON.stringify(body) });
    return;
  }
  
  // ===== 6. 通用递归修改（兜底 - 匹配所有 api.trancy.org 和 service.trancy.org 的 JSON 响应） =====
  if (/api\.trancy\.org|service\.trancy\.org/.test(url)) {
    console.log('[Trancy] Generic modify for all JSON responses');
    
    function deepModify(obj, depth) {
      if (depth > 15 || !obj || typeof obj !== 'object') return;
      if (!Array.isArray(obj)) {
        for (const k of Object.keys(obj)) {
          const v = obj[k]; const lk = k.toLowerCase();
          
          if (typeof v === 'boolean') {
            if (/^(is)?(pro|premium|vip|member|subscribed|paid|active|entitled|enabled|svip|promember)/.test(lk)) obj[k] = true;
            if (/^(is)?(trial|canceled|expired|limited|sandbox)/.test(lk)) obj[k] = false;
          }
          if (typeof v === 'number') {
            if (/(balance|credit|quota|limit|token|point|coin)/i.test(lk) && v < 999999) obj[k] = 999999;
            if (/(expire|end|expir)/i.test(lk) && v === 0) obj[k] = 9999999999999;
            if (/(status|tier|level)/i.test(lk) && v < 999) obj[k] = 999;
          }
          if (typeof v === 'string') {
            if (/(status|plan|tier|type|role)/i.test(lk) && /^(free|basic|trial|expired|inactive|none|standard|limited)$/.test(v.toLowerCase())) obj[k] = 'premium';
          }
          
          if (obj[k] && typeof obj[k] === 'object') deepModify(obj[k], depth + 1);
        }
      } else {
        for (const item of obj) { if (item && typeof item === 'object') deepModify(item, depth + 1); }
      }
    }
    
    deepModify(body, 0);
    $done({ body: JSON.stringify(body) });
    return;
  }
  
  $done({});
}

main();
