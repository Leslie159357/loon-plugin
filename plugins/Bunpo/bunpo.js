// Bunpo Plus & Platinum Unlock v4.0
// Author: Leslie159357

const url = .url;

// offerings 请求放行
if (url.includes('/offerings')) {
  ({});
} else {
  const expireDate = "2099-12-31T23:59:59Z";
  const plusProduct = "com.N2BunpouApp.yuki.product.lifetimeTime";
  const platinumProduct = "com.N2BunpouApp.yuki.product.platinum.yearly";

  const fakeData = {
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
        "com.N2BunpouApp.yuki.product.lifetimeTime": [
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
        "com.N2BunpouApp.yuki.product.platinum.yearly": {
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
        "com.N2BunpouApp.yuki.product.lifetimeTime": {
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
  };

  const fakeResponseBody = JSON.stringify(fakeData);
  const fakeHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Expose-Headers": "X-Request-Id",
    "X-RevenueCat-Request-Time": Date.now().toString()
  };

  // 直接 mock 200 返回
  ({
    response: {
      status: 200,
      headers: fakeHeaders,
      body: fakeResponseBody
    }
  });
}
