// TheGreatMe Premium Unlock — http-request 直接伪造版 v3
// 策略：subscribers/receipts 请求 → 直接本地返回伪造的 200 CustomerInfo
//       不等服务器响应 → 彻底绕开 304/etag/签名路径
// 适用于 Loon（http-request 模式）

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
  const ent = {};
  ent["premium"] = makeEntitlement();
  ent["pro"] = makeEntitlement();
  return {
    "request_date": new Date().toISOString(),
    "request_date_ms": Date.now(),
    "subscriber": {
      "entitlements": ent,
      "non_subscriptions": {
        "thegreatme.forever": makeNonSub()
      },
      "other_purchases": {
        "thegreatme.forever": makeNonSub()
      },
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

// 主入口：http-request 直接应答
try {
  const url = $request.url || "";
  const method = $request.method || "GET";

  // 仅处理 subscribers 与 receipts 端点，直接伪造 200
  if (/\/v1\/subscribers\/[^\/]+(\?|$)/.test(url) || /\/v1\/receipts/.test(url)) {
    // 注意：/offerings 结尾的不伪造（那是商品列表，SDK 从 subscribers 端点读 entitlement）
    if (/\/(offerings|attributes|intro_eligibility)\/?$/.test(url)) {
      $done({});
      return;
    }
    $done({
      status: 200,
      headers: { "Content-Type": "application/json", "content-type": "application/json" },
      body: JSON.stringify(makeFakeCustomerInfo())
    });
    return;
  }

  // 其他端点放行
  $done({});
} catch (e) {
  $done({});
}
