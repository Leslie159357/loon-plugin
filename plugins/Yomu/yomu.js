// ==CloakNote==
// Yomu Premium 解锁 v1.2
// 兼容: Loon / Surge / Quantumult X
// 拦截: api.adaptytech.com — 覆盖 GET/PATCH 的 analytics profiles
// ==/CloakNote==

const url = $request.url;
let body = $response.body;

if (!body) {
  $done({});
  return;
}

try {
  let obj = JSON.parse(body);

  // ==========================================================
  // 1. Analytics Profile — GET 和 PATCH 都拦截
  //    宽泛匹配 analytics/profiles/ 路径
  // ==========================================================
  if (url.indexOf('api.adaptytech.com') !== -1 && url.indexOf('/analytics/profiles/') !== -1) {
    console.log('Yomu: intercepted ' + url);

    // 确保 data 和 attributes 存在
    if (!obj.data || JSON.stringify(obj.data) === '{}') {
      // 如果返回空 data，构造完整对象
      obj = {
        "data": {
          "type": "adapty_analytics_profile",
          "id": "injected_profile",
          "attributes": {
            "app_id": "d4434d39-4786-4757-9b81-fbf9bdb4de3e",
            "profile_id": "injected_profile",
            "customer_user_id": null,
            "is_test_user": true
          }
        }
      };
    }

    // 确保有 attributes
    if (!obj.data.attributes) {
      obj.data.attributes = {};
    }

    // ========== 注入 premium paid_access_levels ==========
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
        "purchased_at": "2024-01-01T00:00:00Z",
        "renewed_at": "2024-01-01T00:00:00Z",
        "expires_at": "2099-12-31T23:59:59Z",
        "starts_at": "2024-01-01T00:00:00Z",
        "is_sandbox": false,
        "is_refund": false
      }
    };

    obj.data.attributes.total_revenue_usd = 999.99;
    obj.data.attributes.is_test_user = true;

    console.log('Yomu: injected premium ✓');
    $done({body: JSON.stringify(obj)});
    return;
  }

  $done({});

} catch (e) {
  console.log('Yomu error: ' + e.message);
  $done({});
}
