/*
 * Bunpo Unlock - Plus & Platinum v2.0
 * App: Bunpo (com.N2BunpouApp.yuki)
 * Author: Leslie159357
 */

const url = .url;

// 如果是 offerings 列表请求，直接放行，不影响商店展示
if (/\/v1\/subscribers\/[^\/]+\/offerings/.test(url)) {
  ({});
} else {
  const expireDate = "2099-12-31T23:59:59Z";
  const plusProduct = "com.N2BunpouApp.yuki.product.lifetimeTime";
  const platinumProduct = "com.N2BunpouApp.yuki.product.platinum.yearly";

  const fakeResponseBody = JSON.stringify({
    "request_date": "2099-12-31T23:59:59Z",
    "request_date_ms": 4102444799000,
    "subscriber": {
      "entitlements": {
        "plus": {
          "expires_date": expireDate,
          "grace_period_expires_date": null,
          "product_identifier": plusProduct,
          "purchase_date": "2024-01-01T00:00:00Z"
        },
        "platinum": {
          "expires_date": expireDate,
          "grace_period_expires_date": null,
          "product_identifier": platinumProduct,
          "purchase_date": "2024-01-01T00:00:00Z"
        },
        "pro": {
          "expires_date": expireDate,
          "grace_period_expires_date": null,
          "product_identifier": plusProduct,
          "purchase_date": "2024-01-01T00:00:00Z"
        },
        "premium": {
          "expires_date": expireDate,
          "grace_period_expires_date": null,
          "product_identifier": platinumProduct,
          "purchase_date": "2024-01-01T00:00:00Z"
        },
        "all_access": {
          "expires_date": expireDate,
          "grace_period_expires_date": null,
          "product_identifier": plusProduct,
          "purchase_date": "2024-01-01T00:00:00Z"
        }
      },
      "first_seen": "2024-01-01T00:00:00Z",
      "last_seen": "2026-10-02T19:20:00Z",
      "management_url": "https://apps.apple.com/account/subscriptions",
      "non_subscriptions": {
        [plusProduct]: [
          {
            "id": "bunpo_lifetime_pass",
            "is_sandbox": false,
            "original_purchase_date": "2024-01-01T00:00:00Z",
            "purchase_date": "2024-01-01T00:00:00Z",
            "store": "app_store"
          }
        ]
      },
      "original_app_user_id": ":890da430a2744a9591a91fdbe2fecb6e",
      "original_application_version": "48",
      "original_purchase_date": "2024-01-01T00:00:00Z",
      "other_purchases": {},
      "subscriptions": {
        [platinumProduct]: {
          "billing_issues_detected_at": null,
          "expires_date": expireDate,
          "grace_period_expires_date": null,
          "is_sandbox": false,
          "original_purchase_date": "2024-01-01T00:00:00Z",
          "ownership_type": "PURCHASED",
          "period_type": "normal",
          "purchase_date": "2024-01-01T00:00:00Z",
          "store": "app_store",
          "unsubscribe_detected_at": null
        },
        [plusProduct]: {
          "billing_issues_detected_at": null,
          "expires_date": expireDate,
          "grace_period_expires_date": null,
          "is_sandbox": false,
          "original_purchase_date": "2024-01-01T00:00:00Z",
          "ownership_type": "PURCHASED",
          "period_type": "normal",
          "purchase_date": "2024-01-01T00:00:00Z",
          "store": "app_store",
          "unsubscribe_detected_at": null
        }
      }
    }
  });

  const fakeHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Expose-Headers": "X-Request-Id",
    "X-RevenueCat-Request-Time": Date.now().toString()
  };

  // http-request 阶段直接 mock 200 返回，绕过 304 缓存
  if (typeof  === 'undefined' ||  === null) {
    ({
      response: {
        status: 200,
        headers: fakeHeaders,
        body: fakeResponseBody
      }
    });
  } else {
    // http-response 阶段强制覆盖
    ({
      status: 200,
      headers: fakeHeaders,
      body: fakeResponseBody
    });
  }
}
