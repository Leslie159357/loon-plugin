// ==ClosureCopy==
// ==/ClosureCopy==

// Trancy MITM Plugin v1.1 - 针对 RevenueCat 响应体精确修改
// MITM Domain: api.revenuecat.com, api.rc-backup.com, api-paywalls.revenuecat.com, api.trancy.org
// 
// RevenueCat API 典型响应结构:
// GET /v1/subscribers/{appUserId}
// {
//   "request_date": "...",
//   "request_date_ms": 123456789,
//   "subscriber": {
//     "entitlements": {
//       "pro": {          // <-- entitlement identifier，通常是 "pro" 或 "premium"
//         "expires_date": "2024-01-01T00:00:00Z",
//         "product_identifier": "com.trancy.app_yearly",
//         "purchase_date": "...",
//         "is_active": true,
//         "will_renew": true,
//         "period_type": "active",
//         "store": "app_store"
//       }
//     },
//     "subscriptions": {
//       "com.trancy.app_yearly": {
//         "expires_date": "...",
//         "is_active": true,
//         "will_renew": true
//       }
//     },
//     "non_subscriptions": {},
//     "first_seen": "...",
//     "original_application_version": "1.0",
//     "original_purchase_date": "...",
//     "management_url": "https://apps.apple.com/account/subscriptions"
//   }
// }

const VERSION = "1.1";

const CONFIG = {
  futureExpiry: "2099-12-31T23:59:59Z",
  futureExpiryMs: 4092599349000,
  
  // Trancy 的 RevenueCat 产品 ID（从 StoreKit 配置中提取）
  productIdentifiers: [
    "com.trancy.app_monthly",
    "com.trancy.app_yearly",
    "com.trancy.app_ai_monthly",
    "com.trancy.app_ai_yearly"
  ],
  
  // 可能的 entitlement identifier（Trancy 使用的）
  possibleEntitlements: ["pro", "premium", "plus", "all_access"]
};

function processRevenueCatResponse(body) {
  // 确保 subscriber 字段存在
  if (!body.subscriber) {
    body.subscriber = {};
  }
  
  const subscriber = body.subscriber;
  
  // ===== 1. 创建/修改 entitlements =====
  if (!subscriber.entitlements) {
    subscriber.entitlements = {};
  }
  
  // 为每个可能的 entitlement ID 创建活跃条目
  for (const entId of CONFIG.possibleEntitlements) {
    if (!subscriber.entitlements[entId]) {
      subscriber.entitlements[entId] = {};
    }
    
    const entitlement = subscriber.entitlements[entId];
    if (typeof entitlement === 'object' && !Array.isArray(entitlement)) {
      // 用第一个产品 ID 作为默认
      const defaultProductId = CONFIG.productIdentifiers[1]; // yearly
      
      subscriber.entitlements[entId] = {
        ...entitlement,
        expires_date: CONFIG.futureExpiry,
        purchase_date: "2024-06-10T00:00:00Z",
        product_identifier: entitlement.product_identifier || defaultProductId,
        latest_purchase_date: entitlement.latest_purchase_date || "2024-06-10T00:00:00Z",
        is_active: true,
        will_renew: true,
        is_sandbox: false,
        ownership_type: "PURCHASED",
        store: "app_store",
        period_type: "active",
        original_purchase_date: entitlement.original_purchase_date || "2024-01-01T00:00:00Z",
        grace_period_expires_date: null,
        unsubscribe_detected_at: null,
        billing_issues_detected_at: null,
        refund_reason: null
      };
    }
  }
  
  // 移除现有的 sandbox/sandbox_entitlements 等干扰项
  delete subscriber.sandbox_entitlements;
  delete subscriber.sandbox_entitlements_verification;
  
  // ===== 2. 创建/修改 subscriptions =====
  if (!subscriber.subscriptions) {
    subscriber.subscriptions = {};
  }
  
  for (const pid of CONFIG.productIdentifiers) {
    if (!subscriber.subscriptions[pid]) {
      subscriber.subscriptions[pid] = {};
    }
    
    const sub = subscriber.subscriptions[pid];
    if (typeof sub === 'object' && !Array.isArray(sub)) {
      subscriber.subscriptions[pid] = {
        ...sub,
        expires_date: CONFIG.futureExpiry,
        purchase_date: sub.purchase_date || "2024-06-10T00:00:00Z",
        original_purchase_date: sub.original_purchase_date || "2024-01-01T00:00:00Z",
        latest_purchase_date: sub.latest_purchase_date || "2024-06-10T00:00:00Z",
        is_active: true,
        will_renew: true,
        is_sandbox: false,
        auto_resume_date: null,
        unsubscribe_detected_at: null,
        billing_issues_detected_at: null,
        period_type: "active",
        store: "app_store",
        ownership_type: "PURCHASED"
      };
    }
  }
  
  // ===== 3. 修改 non_subscriptions =====
  if (!subscriber.non_subscriptions) {
    subscriber.non_subscriptions = {};
  }
  
  // ===== 4. 修改 subscriber 顶层字段 =====
  subscriber.first_seen = subscriber.first_seen || "2024-01-01T00:00:00Z";
  subscriber.original_application_version = subscriber.original_application_version || "1.0";
  subscriber.original_purchase_date = subscriber.original_purchase_date || "2024-01-01T00:00:00Z";
  subscriber.management_url = "https://apps.apple.com/account/subscriptions";
  subscriber.latest_expiration_date = CONFIG.futureExpiry;
  subscriber.entitlements = subscriber.entitlements; // ensure it's set
  
  // ===== 5. 修改顶层 request_date =====
  body.request_date = CONFIG.futureExpiry;
  body.request_date_ms = String(CONFIG.futureExpiryMs);
  
  return body;
}

function processTrancyAPI(body) {
  // Trancy 自有 API 响应处理
  // api.trancy.org 的 JSON 响应
  
  // 递归修改所有布尔型 VIP 字段
  function recursiveModify(obj, depth) {
    if (depth > 15 || obj === null || obj === undefined || typeof obj !== 'object') return obj;
    
    if (!Array.isArray(obj)) {
      // 对象处理
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        const lk = key.toLowerCase();
        
        // 布尔型 VIP 字段
        if (typeof val === 'boolean') {
          if (/^is(pro|premium|vip|member|subscribed|active|entitled|purchased|paid|svip|gold|plus|promember|premiummember|verified|enabled|featured|allow|allowed|accessible|unlocked)/.test(lk)) {
            obj[key] = true;
          }
          if (/^is(trial|canceled|cancelled|pending|sandbox|expired|frozen|limited|blocked|restricted)/.test(lk)) {
            obj[key] = false;
          }
          // show/hide VIP elements
          if (lk === 'showvip' || lk === 'showpremium' || lk === 'showpaywall' || lk === 'showads') {
            obj[key] = false;
          }
          if (lk === 'vipelements'hidden' || lk === 'viphidden') {
            obj[key] = true;
          }
        }
        
        // 数字型字段
        if (typeof val === 'number') {
          if (/^(vip|svip|sub|tier|level|member|plan)(status|level|tier|rank)?$/.test(lk)) {
            obj[key] = Math.max(val, 999);
          }
          if (/^(vip|svip|expire|expir|end|trial)(time|date|uts|at|end)?$/.test(lk) || 
              /(expires|expirydate|expiration|enduts)$/.test(lk)) {
            obj[key] = CONFIG.futureExpiryMs;
          }
          if (/^(balance|credit|point|coin|token|quota|limit|remain|count|total)(s|ed)?$/.test(lk)) {
            obj[key] = Math.max(val, 999999);
          }
        }
        
        // 字符串型字段
        if (typeof val === 'string') {
          if (/^(status|plan|tier|level|type|membertype|usertype|entitlement|role)$/.test(lk)) {
            const vl = val.toLowerCase();
            if (vl === 'free' || vl === 'basic' || vl === 'trial' || 
                vl === 'expired' || vl === 'inactive' || vl === 'none' ||
                vl === 'standard' || vl === 'limited') {
              obj[key] = 'premium';
            }
          }
          if (/^(producttier|subscriptiontier)$/.test(lk)) {
            if (val.toLowerCase() === 'free' || val.toLowerCase() === 'basic') {
              obj[key] = 'premium';
            }
          }
          if (/^(expires|expiry|expiration|expiresdate|expirydate)$/.test(lk) ||
              /(expiresdate|expirydate)$/.test(lk)) {
            obj[key] = CONFIG.futureExpiry;
          }
        }
        
        // 递归
        if (obj[key] && typeof obj[key] === 'object') {
          recursiveModify(obj[key], depth + 1);
        }
      }
    } else {
      // 数组处理
      for (let i = 0; i < obj.length; i++) {
        if (obj[i] && typeof obj[i] === 'object') {
          recursiveModify(obj[i], depth + 1);
        }
      }
    }
    
    return obj;
  }
  
  return recursiveModify(body, 0);
}

function main() {
  const url = $request.url;
  const isRevenueCat = /api\.revenuecat\.com|api\.rc-backup\.com|api-paywalls\.revenuecat\.com/.test(url);
  const isTrancyAPI = /api\.trancy\.org/.test(url);
  
  // 只处理 URL 匹配的请求
  if (!isRevenueCat && !isTrancyAPI) {
    $done({});
    return;
  }
  
  // 只处理 JSON 响应
  const contentType = ($response.headers['Content-Type'] || $response.headers['content-type'] || '').toLowerCase();
  if (!contentType.includes('json')) {
    $done({});
    return;
  }
  
  let body;
  try {
    body = typeof $response.body === 'string' ? JSON.parse($response.body) : JSON.parse($response.body.toString());
  } catch (e) {
    $done({});
    return;
  }
  
  console.log(`[Trancy] Processing ${isRevenueCat ? 'RevenueCat' : 'Trancy'} response from: ${url}`);
  
  try {
    if (isRevenueCat) {
      body = processRevenueCatResponse(body);
      console.log('[Trancy] RevenueCat response modified successfully');
    } else if (isTrancyAPI) {
      body = processTrancyAPI(body);
      console.log('[Trancy] Trancy API response modified successfully');
    }
  } catch (e) {
    console.log(`[Trancy] Error: ${e.message}`);
    $done({});
    return;
  }
  
  $done({ body: JSON.stringify(body) });
}

main();
