// TheGreatMe Premium Unlock — 双模式 v4
// http-request 模式：subscribers/receipts 请求 → 直接本地返回伪造 200 CustomerInfo（绕开 304/etag）
// http-response 模式：如果请求未被 request 拦截（如 200 正常返回）→ 兜底改写 body
// 通过 $response 是否存在区分模式，同一脚本双规则复用
//
// 部署（固定 commit URL，无缓存问题）：
// http-request  ^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(subscribers\/|receipts) script-path=<REMOTE JS>
// http-response ^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(subscribers\/|receipts) script-path=<REMOTE JS> requires-body=true

function makeEntitlement() {
  return {
    "expires_date": "2099-12-31T23:59:59Z",
    "grace_period_expires_date": null,
    "product_identifier": "thegreatme.forever",
    "purchase_date": "2024-09-09T09:09:09Z",
    "purchase_date_ms": 1725872949000,
    "store": "app_store",
    "unsubscribe_detected_at": null,
    "billing_issues_detected_at": null,
    "ownership_type": "PURCHASED"
  };
}

function makeNonSub() {
  return [{
    "id": "thegreatme.forever_mitm",
    "purchase_date": "2024-09-09T09:09:09Z",
    "original_purchase_date": "2024-09-09T09:09:09Z",
    "store": "app_store",
    "store_transaction_id": "490001314520000",
    "is_sandbox": false,
    "ownership_type": "PURCHASED"
  }];
}

function makeSubProduct() {
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
  const ent = {
    "premium": makeEntitlement(),
    "pro": makeEntitlement()
  };
  return {
    "request_date": new Date().toISOString(),
    "request_date_ms": Date.now(),
    "subscriber": {
      "entitlements": ent,
      "non_subscriptions": { "thegreatme.forever": makeNonSub() },
      "other_purchases": { "thegreatme.forever": makeNonSub() },
      "subscriptions": {
        "thegreatme.forever": makeSubProduct(),
        "thegreatme.year": makeSubProduct(),
        "thegreatme.week": makeSubProduct()
      },
      "original_purchase_date": "2024-09-09T09:09:09Z",
      "first_seen": "2024-09-09T09:09:09Z",
      "original_application_version": "1"
    }
  };
}

// 判断是否为需要解锁的请求（subscribers 或 receipts，排除 offerings/attributes 等子端点）
function shouldUnlock(url) {
  if (!url) return false;
  // offerings 是商品列表，SDK 不从这里读 entitlement，放行
  if (/\/(offerings|attributes|intro_eligibility|adservices_attribution)\/?($|\?)/.test(url)) return false;
  return /\/v1\/subscribers\/.+/i.test(url) || /\/v1\/receipts/i.test(url);
}

try {
  const url = $request.url || "";
  const method = $request.method || "GET";
  if (method !== "GET" && method !== "POST") { $done({}); return; }
  if (!shouldUnlock(url)) { $done({}); return; }

  // ===== http-request 模式：直接应答（$response 未定义）=====
  if (typeof $response === "undefined" || $response === null || !$response) {
    $done({
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(makeFakeCustomerInfo())
    });
    return;
  }

  // ===== http-response 模式：改写 body（$response 有定义，兜底）=====
  const resp = $response;
  // 仅处理有 body 的 200
  if (!resp.body) { $done({}); return; }
  $done({
    status: 200,
    headers: Object.assign({}, resp.headers, { "Content-Type": "application/json" }),
    body: JSON.stringify(makeFakeCustomerInfo())
  });
} catch (e) {
  $done({});
}
