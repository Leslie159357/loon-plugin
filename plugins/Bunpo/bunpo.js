// Bunpo cake.js 同款全响应篡改脚本
// 1. RevenueCat 用户订阅伪造 (plus + platinum 终身)
// 2. Bunpo 后端所有课程内容锁定解除 (locked: true -> false)

const plusId = "com.N2BunpouApp.yuki.product.lifetimeTime";
const platId = "com.N2BunpouApp.yuki.product.platinum.yearly";

function makeEntitlement(productId) {
  return {
    "expires_date": "2099-12-31T23:59:59Z",
    "grace_period_expires_date": null,
    "product_identifier": productId,
    "purchase_date": "2024-01-01T00:00:00Z",
    "purchase_date_ms": 1704067200000,
    "store": "app_store",
    "unsubscribe_detected_at": null,
    "billing_issues_detected_at": null,
    "ownership_type": "PURCHASED"
  };
}

function makeNonSub(productId) {
  return [{
    "id": "bunpo_lifetime_pass",
    "purchase_date": "2024-01-01T00:00:00Z",
    "original_purchase_date": "2024-01-01T00:00:00Z",
    "store": "app_store",
    "store_transaction_id": "490001314520000",
    "is_sandbox": false,
    "ownership_type": "PURCHASED"
  }];
}

function makeSubProduct(productId) {
  return {
    "expires_date": "2099-12-31T23:59:59Z",
    "original_purchase_date": "2024-01-01T00:00:00Z",
    "purchase_date": "2024-01-01T00:00:00Z",
    "store": "app_store",
    "is_sandbox": false,
    "ownership_type": "PURCHASED",
    "period_type": "normal"
  };
}

function unlockTree(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    obj.forEach(item => unlockTree(item));
    return obj;
  }
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (k === 'locked' && typeof v === 'boolean' && v === true) {
      obj[k] = false;
      console.log('[Bunpo] UNLOCK locked: true -> false');
    } else if (k === 'unlocked' && typeof v === 'boolean' && v === false) {
      obj[k] = true;
      console.log('[Bunpo] UNLOCK unlocked: false -> true');
    } else if (v && typeof v === 'object') {
      unlockTree(v);
    }
  }
  return obj;
}

if (typeof  !== 'undefined' &&  && .body) {
  const url = ( && .url) || '';
  const isRC = /revenuecat|rc-backup/i.test(url);
  const isBackend = /run\.app|bunpo/i.test(url);

  try {
    let obj = JSON.parse(.body);

    if (isRC) {
      if (/\/(offerings|attributes|intro_eligibility)\/?($|\?)/.test(url)) {
        ({});
        return;
      }
      if (!obj.subscriber) obj.subscriber = {};
      obj.subscriber.entitlements = {
        "plus": makeEntitlement(plusId),
        "platinum": makeEntitlement(platId),
        "pro": makeEntitlement(plusId),
        "premium": makeEntitlement(platId),
        "all_access": makeEntitlement(plusId)
      };
      obj.subscriber.non_subscriptions = { [plusId]: makeNonSub(plusId) };
      obj.subscriber.other_purchases = { [plusId]: makeNonSub(plusId) };
      obj.subscriber.subscriptions = {
        [platId]: makeSubProduct(platId),
        [plusId]: makeSubProduct(plusId)
      };
      obj.subscriber.management_url = "https://apps.apple.com/account/subscriptions";
      console.log('[Bunpo] RC Subscriber INJECTED PLUS & PLATINUM');
      ({ body: JSON.stringify(obj) });
      return;
    }

    if (isBackend) {
      obj = unlockTree(obj);
      ({ body: JSON.stringify(obj) });
      return;
    }

    ({});
  } catch (e) {
    ({});
  }
} else {
  ({});
}
