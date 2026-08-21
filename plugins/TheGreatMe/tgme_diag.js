// TheGreatMe 诊断 v1 — 验证脚本是否被 Loon 执行
// 无条件弹通知 + 直接伪造 subscribers 响应
// 用途：确认 http-request 脚本路径是否加载成功
try {
  const url = $request.url || "";
  if (typeof $notification !== "undefined") {
    $notification.post("TGME诊断", "脚本执行成功", url.substring(0, 80));
  }
  // 无条件伪造 subscribers 响应
  const ent = {
    "premium": {
      "expires_date": "2099-12-31T23:59:59Z",
      "product_identifier": "thegreatme.forever",
      "purchase_date": "2024-09-09T09:09:09Z",
      "store": "app_store",
      "ownership_type": "PURCHASED"
    },
    "pro": {
      "expires_date": "2099-12-31T23:59:59Z",
      "product_identifier": "thegreatme.forever",
      "purchase_date": "2024-09-09T09:09:09Z",
      "store": "app_store",
      "ownership_type": "PURCHASED"
    }
  };
  const fake = {
    "request_date": new Date().toISOString(),
    "request_date_ms": Date.now(),
    "subscriber": {
      "entitlements": ent,
      "subscriptions": {
        "thegreatme.forever": { "expires_date": "2099-12-31T23:59:59Z", "purchase_date": "2024-09-09T09:09:09Z", "period_type": "normal", "store": "app_store", "is_sandbox": false }
      },
      "original_purchase_date": "2024-09-09T09:09:09Z",
      "original_application_version": "1"
    }
  };
  $done({
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fake)
  });
} catch (e) {
  $done({});
}
