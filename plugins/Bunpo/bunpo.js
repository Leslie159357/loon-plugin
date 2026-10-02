// Bunpo Plus & Platinum Unlock v5.0
// App: Bunpo (com.N2BunpouApp.yuki)
// Author: Leslie159357

const resp = typeof  !== 'undefined' &&  ?  : null;
if (!resp || !resp.body) {
  ({});
}

try {
  let obj = JSON.parse(resp.body);
  const expireDate = "2099-12-31T23:59:59Z";
  const plusProduct = "com.N2BunpouApp.yuki.product.lifetimeTime";
  const platinumProduct = "com.N2BunpouApp.yuki.product.platinum.yearly";

  if (!obj.subscriber) {
    obj.subscriber = {};
  }

  obj.subscriber.entitlements = {
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
  };

  obj.subscriber.non_subscriptions = {
    [plusProduct]: [
      {
        "id": "bunpo_lifetime_pass",
        "is_sandbox": false,
        "original_purchase_date": "2024-01-01T00:00:00Z",
        "purchase_date": "2024-01-01T00:00:00Z",
        "store": "app_store"
      }
    ]
  };

  obj.subscriber.subscriptions = {
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
  };

  ({ body: JSON.stringify(obj) });
} catch (e) {
  ({});
}
