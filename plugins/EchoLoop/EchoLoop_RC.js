/*
Echo Loop RevenueCat 解锁脚本
http-request 模式：直接响应伪造的 RevenueCat 订阅数据
适配 Loon / Surge / Quantumult X / Shadowrocket

配置:
[Script]
http-request ^https:\/\/api\.revenuecat\.com\/v1\/subscribers\/ script-path=EchoLoop_RC.js, requires-body=true, tag=EchoLoop 解锁

[MITM]
hostname = api.revenuecat.com
*/

const entitlementId = "premium";
const productId = "top.echo-loop.lifetime";

// 统一的伪造数据
const FAKE_BODY = {
  subscriber: {
    entitlements: {
      [entitlementId]: {
        expires_date: "2099-12-31T23:59:59Z",
        product_identifier: productId,
        purchase_date: "2026-01-01T00:00:00Z",
        is_active: true
      }
    },
    subscriptions: {
      [productId]: {
        expires_date: "2099-12-31T23:59:59Z",
        purchase_date: "2026-01-01T00:00:00Z",
        is_active: true,
        period_type: "lifetime",
        store: "app_store",
        unsubscribe_detected_at: null
      }
    },
    non_subscriptions: {},
    original_application_version: "1231",
    original_purchase_date: "2026-01-01T00:00:00Z",
    management_url: "https://apps.apple.com/account/subscriptions"
  },
  request_date: new Date().toISOString(),
  request_date_ms: Date.now()
};

const RESPONSE = {
  status: 200,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  body: JSON.stringify(FAKE_BODY)
};

// ============ 各平台运行时 ============
// Loon / Surge / Shadowrocket
if (typeof $done !== "undefined") {
  $done(RESPONSE);
}
