// ==CloakScript==
// @name         TheGreatMe Premium Unlock (RevenueCat Bypass)
// @version      1.0.0
// @description  Bypass RevenueCat subscription check for TheGreatMe
// @author       TGMCrack
// @license      MIT
// @icon         https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/.../AppIcon-1x_U007emarketing-0-7-0-85-220.png
// @supportURL   https://github.com/tgm-crack
// @type         response-body
// @hostname     api.revenuecat.com
// @hostname     api-paywalls.revenuecat.com
// @hostname     api-diagnostics.revenuecat.com
// ==/CloakScript==

// Loon / Quantumult X / Surge MITM Script
// Intercepts RevenueCat API responses and returns premium status
//
// Install:
//   Loon:   Put in /Scripts/ directory, add MITM hostname and URL rewrite
//   QX:     Put in /Scripts/ directory, add MITM hostname
//   Surge:  Put in /Scripts/ directory, add MITM hostname

const targetHosts = [
  'api.revenuecat.com',
  'api-paywalls.revenuecat.com',
  'api-diagnostics.revenuecat.com'
];

// Check if this request should be intercepted
const url = $request.url;
const method = $request.method;

console.log(`[TGMPremium] Intercepted: ${method} ${url}`);

// Only handle GET requests
if (method !== 'GET') {
  $done({});
  return;
}

try {
  let body = $response.body;
  
  if (!body || body.length === 0) {
    // No response body - this is likely a request that hasn't completed yet
    // We need to handle the response
    $done({});
    return;
  }

  let data = JSON.parse(body);

  // ==========================================
  // Handle /v1/subscribers/{userId} endpoint
  // Returns CustomerInfo
  // ==========================================
  if (url.includes('/v1/subscribers/') && (data.subscriber || data.entitlements)) {
    console.log('[TGMPremium] Patching subscriber info...');
    
    // Ensure subscriber object exists
    if (!data.subscriber) {
      data.subscriber = {};
    }
    
    // Set all entitlements as active forever
    data.subscriber.entitlements = {
      "pro": {
        "expires_date": "2099-12-31T23:59:59Z",
        "product_identifier": "thegreatme.forever",
        "purchase_date": "2024-01-01T00:00:00Z"
      },
      "premium": {
        "expires_date": "2099-12-31T23:59:59Z",
        "product_identifier": "thegreatme.forever",
        "purchase_date": "2024-01-01T00:00:00Z"
      },
      "plus": {
        "expires_date": "2099-12-31T23:59:59Z",
        "product_identifier": "thegreatme.forever",
        "purchase_date": "2024-01-01T00:00:00Z"
      }
    };
    
    // Ensure all known products show as active subscriptions
    data.subscriber.subscriptions = {
      "thegreatme.forever": {
        "expires_date": "2099-12-31T23:59:59Z",
        "purchase_date": "2024-01-01T00:00:00Z",
        "period_type": "normal",
        "store": "app_store",
        "is_sandbox": false,
        "unsubscribe_detected_at": null,
        "billing_issues_detected_at": null
      },
      "thegreatme.year": {
        "expires_date": "2099-12-31T23:59:59Z",
        "purchase_date": "2024-01-01T00:00:00Z",
        "period_type": "normal",
        "store": "app_store",
        "is_sandbox": false,
        "unsubscribe_detected_at": null,
        "billing_issues_detected_at": null
      },
      "thegreatme.week": {
        "expires_date": "2099-12-31T23:59:59Z",
        "purchase_date": "2024-01-01T00:00:00Z",
        "period_type": "normal",
        "store": "app_store",
        "is_sandbox": false,
        "unsubscribe_detected_at": null,
        "billing_issues_detected_at": null
      }
    };
    
    // Add non-subscriptions (consumable products)
    data.subscriber.non_subscriptions = {};
    
    // Set first_seen and original info
    if (!data.subscriber.first_seen) {
      data.subscriber.first_seen = "2024-01-01T00:00:00Z";
    }
    if (!data.subscriber.original_application_version) {
      data.subscriber.original_application_version = "1";
    }
    if (!data.subscriber.original_purchase_date) {
      data.subscriber.original_purchase_date = "2024-01-01T00:00:00Z";
    }
    
    // Set management URL (optional)
    data.subscriber.management_url = null;
    
    // Update request dates
    data.request_date = new Date().toISOString();
    data.request_date_ms = Date.now();
  }
  
  // ==========================================
  // Handle /v1/subscribers/{userId}/offerings endpoint
  // Returns Offerings
  // ==========================================
  else if (url.includes('/offerings')) {
    console.log('[TGMPremium] Patching offerings...');
    
    if (!data.offerings) {
      data.offerings = [];
    }
    
    // Ensure offerings have properly priced products
    // (this doesn't affect entitlement, but makes sure the paywall renders)
    if (data.offerings && Array.isArray(data.offerings)) {
      data.offerings.forEach(offering => {
        if (offering.packages && Array.isArray(offering.packages)) {
          offering.packages.forEach(pkg => {
            if (pkg.storeProduct) {
              // Ensure price is displayed (doesn't affect purchase)
              pkg.storeProduct.price = 0.01;
              pkg.storeProduct.price_string = "$0.01";
            }
          });
        }
      });
    }
    
    // Update request dates
    data.request_date = new Date().toISOString();
    data.request_date_ms = Date.now();
  }
  
  // ==========================================
  // Handle product_entitlement_mapping endpoint
  // ==========================================
  else if (url.includes('product_entitlement_mapping')) {
    console.log('[TGMPremium] Patching product entitlements mapping...');
    
    data = {
      "product_entitlement_mapping": {
        "thegreatme.forever": {
          "entitlement": "pro",
          "entitlements": ["pro", "premium"]
        },
        "thegreatme.year": {
          "entitlement": "pro",
          "entitlements": ["pro", "premium"]
        },
        "thegreatme.week": {
          "entitlement": "pro",
          "entitlements": ["pro", "premium"]
        }
      }
    };
  }
  
  // Convert back to string
  body = JSON.stringify(data);
  
  console.log('[TGMPremium] Successfully patched response');
  $done({ body });

} catch (e) {
  console.log(`[TGMPremium] Error: ${e.message}`);
  $done({});
}
