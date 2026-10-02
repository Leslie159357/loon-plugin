// Bunpo Ultimate Unlocker (基于 GitHub 社区 2026 最新工业级成熟方案)
// 适配 Loon / Quantumult X
// 原理：
// 1. Loon 原生 [Rewrite] header-del 抹除 X-RevenueCat-ETag，强破 304 缓存
// 2. 本地自动全量注入 RevenueCat 所有 entitlements（pro, platinum, plus, all_access 等）
// 3. 同时递归解密 Bunpo 后端所有课程 JSON（/v3/content/course 与 /v3/content/lesson），locked: true -> false

function unlockJson(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) unlockJson(obj[i]);
    return obj;
  }
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (k === 'locked' && v === true) {
      obj[k] = false;
    } else if (k === 'unlocked' && v === false) {
      obj[k] = true;
    } else if (v && typeof v === 'object') {
      unlockJson(v);
    }
  }
  return obj;
}

function makeEntitlement(productId) {
  return {
    "purchase_date": "2024-01-01T01:01:01Z",
    "original_purchase_date": "2024-01-01T01:01:01Z",
    "expires_date": "2099-12-31T23:59:59Z",
    "is_sandbox": false,
    "ownership_type": "PURCHASED",
    "store": "app_store",
    "product_identifier": productId
  };
}

function makeSub(productId) {
  return {
    "expires_date": "2099-12-31T23:59:59Z",
    "original_purchase_date": "2024-01-01T01:01:01Z",
    "purchase_date": "2024-01-01T01:01:01Z",
    "is_sandbox": false,
    "ownership_type": "PURCHASED",
    "store": "app_store",
    "period_type": "normal"
  };
}

if (typeof  !== 'undefined' &&  && .body) {
  const url = ( && .url) || '';
  try {
    let data = JSON.parse(.body);

    // 1. RevenueCat 用户信息拦截注入
    if (/revenuecat|rc-backup/i.test(url)) {
      if (/\/(offerings|attributes|intro_eligibility)\/?($|\?)/.test(url)) {
        ({});
        return;
      }
      if (!data.subscriber) data.subscriber = {};
      const proId = "com.N2BunpouApp.yuki.product.lifetimeTime";
      const platId = "com.N2BunpouApp.yuki.product.platinum.yearly";

      data.subscriber.entitlements = {
        "pro": makeEntitlement(proId),
        "platinum": makeEntitlement(platId),
        "plus": makeEntitlement(proId),
        "premium": makeEntitlement(platId),
        "all_access": makeEntitlement(proId)
      };

      data.subscriber.subscriptions = {
        [platId]: makeSub(platId),
        [proId]: makeSub(proId)
      };

      data.subscriber.non_subscriptions = {
        [proId]: [{
          "id": "bunpo_pro_lifetime",
          "purchase_date": "2024-01-01T01:01:01Z",
          "original_purchase_date": "2024-01-01T01:01:01Z",
          "store": "app_store",
          "ownership_type": "PURCHASED"
        }]
      };
      data.subscriber.other_purchases = data.subscriber.non_subscriptions;
      console.log('[Bunpo] RevenueCat 200 Body Injected Successfully');
      ({ body: JSON.stringify(data) });
      return;
    }

    // 2. Bunpo 后端所有课程与关卡解密（/content/course, /content/lesson 等）
    if (/run\.app|bunpo/i.test(url)) {
      data = unlockJson(data);
      console.log('[Bunpo] Backend JSON Unlocked (locked -> false)');
      ({ body: JSON.stringify(data) });
      return;
    }

    ({});
  } catch (e) {
    ({});
  }
} else {
  ({});
}
