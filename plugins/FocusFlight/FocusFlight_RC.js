// FocusFlight RevenueCat 订阅劫持脚本
// 拦截 /v1/subscribers/* 响应，返回伪造的全量权益数据
// 支持 FocusFlight 所有权益: pro, premium, plus, all_access

const url = $request.url;
const isSubscriberRequest = /\/v1\/subscribers\/[^\/]+$/.test(url);

// 只劫持 subscribers 查询（非 offerings）
if (!isSubscriberRequest) {
  $done({});
  return;
}

// 伪造响应体
const fakeResponse = {
  "request_date": "2099-12-31T23:59:59Z",
  "request_date_ms": "9999999999999",
  "subscriber": {
    "entitlements": {
      "pro": {
        "expires_date": "2099-12-31T23:59:59Z",
        "purchase_date": "2024-06-10T00:00:00Z",
        "latest_purchase_date": "2024-06-10T00:00:00Z",
        "product_identifier": "net.cementpla.focusflights.lifetime",
        "is_active": true,
        "will_renew": true,
        "is_sandbox": false,
        "ownership_type": "PURCHASED",
        "store": "app_store",
        "period_type": "active",
        "original_purchase_date": "2024-01-01T00:00:00Z",
        "unsubscribe_detected_at": null,
        "billing_issues_detected_at": null,
        "refund_reason": null
      },
      "premium": {
        "expires_date": "2099-12-31T23:59:59Z",
        "purchase_date": "2024-06-10T00:00:00Z",
        "latest_purchase_date": "2024-06-10T00:00:00Z",
        "product_identifier": "net.cementpla.focusflights.lifetime",
        "is_active": true,
        "will_renew": true,
        "is_sandbox": false,
        "ownership_type": "PURCHASED",
        "store": "app_store",
        "period_type": "active",
        "original_purchase_date": "2024-01-01T00:00:00Z",
        "unsubscribe_detected_at": null,
        "billing_issues_detected_at": null,
        "refund_reason": null
      },
      "plus": {
        "expires_date": "2099-12-31T23:59:59Z",
        "purchase_date": "2024-06-10T00:00:00Z",
        "latest_purchase_date": "2024-06-10T00:00:00Z",
        "product_identifier": "net.cementpla.focusflights.lifetime",
        "is_active": true,
        "will_renew": true,
        "is_sandbox": false,
        "ownership_type": "PURCHASED",
        "store": "app_store",
        "period_type": "active",
        "original_purchase_date": "2024-01-01T00:00:00Z",
        "unsubscribe_detected_at": null,
        "billing_issues_detected_at": null,
        "refund_reason": null
      },
      "all_access": {
        "expires_date": "2099-12-31T23:59:59Z",
        "purchase_date": "2024-06-10T00:00:00Z",
        "latest_purchase_date": "2024-06-10T00:00:00Z",
        "product_identifier": "net.cementpla.focusflights.lifetime",
        "is_active": true,
        "will_renew": true,
        "is_sandbox": false,
        "ownership_type": "PURCHASED",
        "store": "app_store",
        "period_type": "active",
        "original_purchase_date": "2024-01-01T00:00:00Z",
        "unsubscribe_detected_at": null,
        "billing_issues_detected_at": null,
        "refund_reason": null
      }
    },
    "first_seen": "2026-06-23T07:02:16Z",
    "last_seen": "2026-06-23T07:02:16Z",
    "management_url": "https://apps.apple.com/account/subscriptions",
    "non_subscriptions": {},
    "original_app_user_id": "unknown",
    "original_application_version": null,
    "original_purchase_date": null,
    "other_purchases": {},
    "subscriptions": {
      "net.cementpla.focusflights.premium.monthly": {
        "expires_date": "2099-12-31T23:59:59Z",
        "purchase_date": "2024-06-10T00:00:00Z",
        "is_active": true,
        "will_renew": true,
        "is_sandbox": false,
        "period_type": "active",
        "store": "app_store",
        "ownership_type": "PURCHASED",
        "unsubscribe_detected_at": null,
        "billing_issues_detected_at": null
      },
      "net.cementpla.focusflights.premium.annually": {
        "expires_date": "2099-12-31T23:59:59Z",
        "purchase_date": "2024-06-10T00:00:00Z",
        "is_active": true,
        "will_renew": true,
        "is_sandbox": false,
        "period_type": "active",
        "store": "app_store",
        "ownership_type": "PURCHASED",
        "unsubscribe_detected_at": null,
        "billing_issues_detected_at": null
      },
      "net.cementpla.focusflights.lifetime": {
        "expires_date": "2099-12-31T23:59:59Z",
        "purchase_date": "2024-06-10T00:00:00Z",
        "is_active": true,
        "will_renew": true,
        "is_sandbox": false,
        "period_type": "active",
        "store": "app_store",
        "ownership_type": "PURCHASED",
        "unsubscribe_detected_at": null,
        "billing_issues_detected_at": null
      }
    }
  }
};

// 返回伪造响应
$done({
  status: 200,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Expose-Headers": "X-Request-Id"
  },
  body: JSON.stringify(fakeResponse)
});
