// Bunpo Ultimate Unlocker v11.0
// 1. 递归粉碎所有 JSON 中的 locked: true -> false, unlocked: false -> true
// 2. 伪造 RevenueCat 所有官方订阅 (pro + platinum 终身)

function unlockAll(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      unlockAll(obj[i]);
    }
    return obj;
  }
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (k === 'locked' && v === true) {
      obj[k] = false;
    } else if (k === 'unlocked' && v === false) {
      obj[k] = true;
    } else if (v && typeof v === 'object') {
      unlockAll(v);
    }
  }
  return obj;
}

function makeEntitlement(productId) {
  return {
    expires_date: "2099-12-31T23:59:59Z",
    grace_period_expires_date: null,
    product_identifier: productId,
    purchase_date: "2024-01-01T00:00:00Z",
    purchase_date_ms: 1704067200000,
    store: "app_store",
    unsubscribe_detected_at: null,
    billing_issues_detected_at: null,
    ownership_type: "PURCHASED"
  };
}

if (typeof  !== 'undefined' &&  && .body) {
  const url = ( && .url) || '';
  try {
    let data = JSON.parse(.body);

    // 1. RevenueCat 用户信息拦截
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
        [platId]: {
          expires_date: "2099-12-31T23:59:59Z",
          original_purchase_date: "2024-01-01T00:00:00Z",
          purchase_date: "2024-01-01T00:00:00Z",
          store: "app_store",
          ownership_type: "PURCHASED",
          period_type: "normal"
        }
      };
      data.subscriber.non_subscriptions = {
        [proId]: [{
          id: "bunpo_pro_lifetime",
          purchase_date: "2024-01-01T00:00:00Z",
          original_purchase_date: "2024-01-01T00:00:00Z",
          store: "app_store",
          ownership_type: "PURCHASED"
        }]
      };
      data.subscriber.other_purchases = data.subscriber.non_subscriptions;
      console.log('[Bunpo] RevenueCat Pro & Platinum Injected successfully');
      ({ body: JSON.stringify(data) });
      return;
    }

    // 2. Bunpo 后端所有课程与关卡解密（/content/course, /content/lesson 等）
    if (/run\.app|bunpo/i.test(url)) {
      data = unlockAll(data);
      console.log('[Bunpo] Backend JSON Unlocked: ' + url.slice(0, 80));
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
