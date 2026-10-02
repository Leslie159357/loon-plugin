// Bunpo Plus & Platinum Unlock — 仿 TheGreatMe 双模式架构
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

function shouldUnlock(url) {
  if (!url) return false;
  if (/\/(offerings|attributes|intro_eligibility|adservices_attribution)\/?($|\?)/.test(url)) return false;
  return /\/v1\/subscribers\/.+/i.test(url) || /\/v1\/receipts/i.test(url);
}

try {
  const url = .url || "";
  const method = .method || "GET";
  if (method !== "GET" && method !== "POST") { ({}); }
  else if (!shouldUnlock(url)) { ({}); }
  else if (typeof  === "undefined" ||  === null || !) {
    // http-request 模式：直接应答
    ({
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(makeFakeCustomerInfo())
    });
  } else {
    // http-response 模式：改写响应
    ({
      status: 200,
      headers: Object.assign({}, .headers, { "Content-Type": "application/json" }),
      body: JSON.stringify(makeFakeCustomerInfo())
    });
  }
} catch (e) {
  ({});
}
