// ==CloakNote==
// Yomu Premium 解锁 v1.3
// 兼容: Loon / Surge / Quantumult X
// 拦截: api.adaptytech.com — 注入 paid_access_levels premium
// ==/CloakNote==

const url = $request.url;
let body = $response.body;

if (!body) {
  $done({});
  return;
}

try {
  let obj = JSON.parse(body);

  if (url.indexOf('adaptytech.com') !== -1 && url.indexOf('/analytics/profiles/') !== -1) {
    console.log('Yomu: intercepted analytics profile');

    // 处理空 data
    if (!obj.data || JSON.stringify(obj.data) === '{}') {
      obj.data = {
        "type": "adapty_analytics_profile",
        "id": "injected_profile",
        "attributes": {}
      };
    }
    if (!obj.data.attributes) {
      obj.data.attributes = {};
    }

    // ===== 注入 premium access levels =====
    obj.data.attributes.paid_access_levels = {
      "premium": {
        "id": "premium",
        "is_active": true,
        "is_lifetime": true,
        "will_renew": true,
        "is_in_grace_period": false,
        "is_refund": false,
        "store": "app_store",
        "vendor_product_id": "lifetime.yomu.app",
        "activated_at": "2024-01-01T00:00:00Z",
        "renewed_at": "2024-01-01T00:00:00Z",
        "expires_at": "2099-12-31T23:59:59Z",
        "starts_at": "2024-01-01T00:00:00Z",
        "unsubscribed_at": null,
        "billing_issue_detected_at": null,
        "cancellation_reason": null
      }
    };

    // 注入 subscriptions
    obj.data.attributes.subscriptions = {
      "lifetime.yomu.app": {
        "is_active": true,
        "is_lifetime": true,
        "store": "app_store",
        "vendor_product_id": "lifetime.yomu.app",
        "vendor_transaction_id": "2000000000000000",
        "vendor_original_transaction_id": "2000000000000000",
        "purchased_at": "2024-01-01T00:00:00Z",
        "renewed_at": "2024-01-01T00:00:00Z",
        "expires_at": "2099-12-31T23:59:59Z",
        "starts_at": "2024-01-01T00:00:00Z",
        "is_sandbox": false,
        "is_refund": false
      }
    };

    obj.data.attributes.total_revenue_usd = 999.99;

    console.log('Yomu: ✓ premium injected');
    $done({body: JSON.stringify(obj)});
    return;
  }

  $done({});

} catch (e) {
  console.log('Yomu error: ' + e.message);
  $done({});
}
