/*
Echo Loop RevenueCat 解锁脚本
http-request 模式：拦截请求并直接返回伪造的 premium 订阅数据
适配 Loon / Surge / Quantumult X / Shadowrocket

Loon Plugin:
#!name=Echo Loop Premium Unlocker
[Script]
http-request ^https:\/\/api\.revenuecat\.com\/v1\/subscribers\/ script-path=EchoLoop_RC.js, timeout=10, tag=EchoLoop 解锁
[MITM]
hostname = api.revenuecat.com
*/

var body = {
  subscriber: {
    entitlements: {
      "premium": {
        expires_date: "2099-12-31T23:59:59Z",
        product_identifier: "top.echo-loop.lifetime",
        purchase_date: "2026-01-01T00:00:00Z",
        is_active: true
      }
    },
    subscriptions: {
      "top.echo-loop.lifetime": {
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
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});
