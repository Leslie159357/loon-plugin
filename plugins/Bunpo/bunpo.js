// Bunpo Pro & Platinum Unlock — 100% 对齐 TheGreatMe 实战成功架构
// App: Bunpo (com.N2BunpouApp.yuki)

function makeEntitlement(productId) {
  return {
    "expires_date": "2099-12-31T23:59:59Z",
    "grace_period_expires_date": null,
    "product_identifier": productId,
    "purchase_date": "2024-09-09T09:09:09Z",
    "purchase_date_ms": 1725872949000,
    "store": "app_store",
    "unsubscribe_detected_at": null,
    "billing_issues_detected_at": null,
    "ownership_type": "PURCHASED"
  };
}

function makeNonSub(productId) {
  return [{
    "id": "bunpo.lifetime_mitm",
    "purchase_date": "2024-09-09T09:09:09Z",
    "original_purchase_date": "2024-09-09T09:09:09Z",
    "store": "app_store",
    "store_transaction_id": "490001314520000",
    "is_sandbox": false,
    "ownership_type": "PURCHASED"
  }];
}

function makeSubProduct(productId) {
  return {
    "expires_date": "2099-12-31T23:59:59Z",
    "original_purchase_date": "2024-09-09T09:09:09Z",
    "purchase_date": "2024-09-09T09:09:09Z",
    "store": "app_store",
    "is_sandbox": false,
    "ownership_type": "PURCHASED",
    "period_type": "normal"
  };
}

function makeFakeCustomerInfo() {
  const proId = "com.N2BunpouApp.yuki.product.lifetimeTime";
  const platId = "com.N2BunpouApp.yuki.product.platinum.yearly";
  const ent = {
    "pro": makeEntitlement(proId),
    "platinum": makeEntitlement(platId),
    "plus": makeEntitlement(proId),
    "premium": makeEntitlement(platId),
    "all_access": makeEntitlement(proId)
  };
  return {
    "request_date": new Date().toISOString(),
    "request_date_ms": Date.now(),
    "subscriber": {
      "entitlements": ent,
      "non_subscriptions": {
        [proId]: makeNonSub(proId)
      },
      "other_purchases": {
        [proId]: makeNonSub(proId)
      },
      "subscriptions": {
        [platId]: makeSubProduct(platId),
        [proId]: makeSubProduct(proId)
      },
      "original_purchase_date": "2024-09-09T09:09:09Z",
      "first_seen": "2024-09-09T09:09:09Z",
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
  const url = ( && .url) || "";
  const method = ( && .method) || "GET";
  if (method !== "GET" && method !== "POST") { ({}); }
  else if (!shouldUnlock(url)) { ({}); }
  else if (typeof  === "undefined" ||  === null || !) {
    // http-request 模式：直接应答 200，绝不走 304
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
    // http-response 模式：兜底改写
    const resp = ;
    if (!resp.body) { ({}); }
    else {
      ({
        status: 200,
        headers: Object.assign({}, resp.headers, { "Content-Type": "application/json" }),
        body: JSON.stringify(makeFakeCustomerInfo())
      });
    }
  }
} catch (e) {
  ({});
}
