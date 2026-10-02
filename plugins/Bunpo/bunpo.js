// Bunpo Plus & Platinum Unlock v9.0
// App: Bunpo (com.N2BunpouApp.yuki)
// 适配 Loon / Quantumult X / Surge

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
    "id": "bunpo_lifetime_mitm",
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

function makeFakeCustomerInfo() {
  return {
    "request_date": new Date().toISOString(),
    "request_date_ms": Date.now(),
    "subscriber": {
      "entitlements": {
        "plus": makeEntitlement(plusId),
        "platinum": makeEntitlement(platId),
        "pro": makeEntitlement(plusId),
        "premium": makeEntitlement(platId),
        "all_access": makeEntitlement(plusId)
      },
      "non_subscriptions": {
        [plusId]: makeNonSub(plusId)
      },
      "other_purchases": {
        [plusId]: makeNonSub(plusId)
      },
      "subscriptions": {
        [platId]: makeSubProduct(platId),
        [plusId]: makeSubProduct(plusId)
      },
      "original_purchase_date": "2024-01-01T00:00:00Z",
      "first_seen": "2024-01-01T00:00:00Z",
      "original_application_version": "48",
      "management_url": "https://apps.apple.com/account/subscriptions"
    }
  };
}

function unlockJson(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    obj.forEach(item => unlockJson(item));
    return obj;
  }
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (k === 'locked' && typeof v === 'boolean' && v === true) {
      obj[k] = false;
    } else if (k === 'unlocked' && typeof v === 'boolean' && v === false) {
      obj[k] = true;
    } else if (v && typeof v === 'object') {
      unlockJson(v);
    }
  }
  return obj;
}

try {
  const url = ( && .url) || "";
  const isRC = /revenuecat|rc-backup/i.test(url);
  const isBackend = /run\.app|bunpo/i.test(url);

  // ===== 1. RevenueCat 劫持 =====
  if (isRC) {
    if (/\/(offerings|attributes|intro_eligibility)\/?($|\?)/.test(url)) {
      ({});
    } else if (typeof  === "undefined" ||  === null || !) {
      console.log('[Bunpo] RC HTTP-REQUEST MOCK -> 200: ' + url.slice(0, 80));
      const fakeHeaders = {
        "Content-Type": "application/json; charset=utf-8",
        "content-type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      };
      const fakeBody = JSON.stringify(makeFakeCustomerInfo());
      // 兼容所有 Loon 版本语法：同时包含 response 包裹与顶层字段
      ({
        response: {
          status: 200,
          statusCode: 200,
          headers: fakeHeaders,
          body: fakeBody
        },
        status: 200,
        statusCode: 200,
        headers: fakeHeaders,
        body: fakeBody
      });
    } else {
      console.log('[Bunpo] RC HTTP-RESPONSE FAKE -> 200: ' + url.slice(0, 80));
      ({
        status: 200,
        headers: Object.assign({}, .headers, { "Content-Type": "application/json" }),
        body: JSON.stringify(makeFakeCustomerInfo())
      });
    }
  }
  // ===== 2. 后端接口 (run.app) 内容解锁 =====
  else if (isBackend && typeof  !== "undefined" &&  && .body) {
    try {
      let data = JSON.parse(.body);
      data = unlockJson(data);
      console.log('[Bunpo] BACKEND UNLOCKED (locked: false): ' + url.slice(0, 80));
      ({
        body: JSON.stringify(data),
        headers: .headers
      });
    } catch (e) {
      ({});
    }
  } else {
    ({});
  }
} catch (e) {
  ({});
}
