/*
Echo Loop RevenueCat 解锁脚本
http-response 模式：拦截 RevenueCat 响应并替换为伪造数据
适配 Loon / Surge / Shadowrocket

Loon 配置:
[Script]
http-response ^https:\/\/api\.revenuecat\.com\/v1\/subscribers\/ script-path=EchoLoop_RC.js, requires-body=true, timeout=10, tag=EchoLoop 解锁

[MITM]
hostname = api.revenuecat.com
*/

const entitlementId = "premium";
const productId = "top.echo-loop.lifetime";

const body = {
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

$done({
  status: 200,
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(body)
});
