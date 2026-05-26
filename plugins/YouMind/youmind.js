// YouMind Premium Unlock - Loon Script v1.3
// By Leslie159357
// Fix: Now handles both camelCase AND snake_case response formats
//       Also patches YOUMIND_USER embedded in SSR HTML pages
// Hook: POST /api/v1/getCurrentUser
//       POST /api/v1/subscription/findSubscription
//       POST /api/v1/credit/getCreditAccount
//       GET  /*  (HTML pages with embedded YOUMIND_USER)

const url = $request.url;
const method = $request.method;

// Helper: check if response uses camelCase or snake_case
function isCamelCase(obj) {
  return obj && ('productTier' in obj || 'monthlyBalance' in obj || 'spaceId' in obj);
}

// Patch YOUMIND_USER in SSR HTML pages
if (method === 'GET' && $response && $response.body) {
  let body = $response.body;
  if (body.includes('YOUMIND_USER') && body.includes('"status":"trialing"')) {
    body = body.replace(/"status":"trialing"/g, '"status":"active"');
    body = body.replace(/"trial_expires_at":"[^"]+"/g, '"trial_expires_at":"2099-12-31T23:59:59.000Z"');
    body = body.replace(/"trialExpiresAt":"[^"]+"/g, '"trialExpiresAt":"2099-12-31T23:59:59.000Z"');
    $done({ body });
    return;
  }
  $done({});
  return;
}

if (method !== 'POST') {
  $done({});
  return;
}

if (url.includes('/api/v1/getCurrentUser')) {
  try {
    let bodyObj = JSON.parse($response.body);
    if (bodyObj) {
      const camel = isCamelCase(bodyObj);
      if (bodyObj.space) {
        if (camel) {
          bodyObj.space.status = 'active';
          bodyObj.space.trialExpiresAt = '2099-12-31T23:59:59.000Z';
        } else {
          bodyObj.space.status = 'active';
          bodyObj.space.trial_expires_at = '2099-12-31T23:59:59.000Z';
        }
      }
    }
    $done({ body: JSON.stringify(bodyObj) });
  } catch (e) {
    $done({});
  }

} else if (url.includes('/api/v1/subscription/findSubscription')) {
  const now = new Date().toISOString();
  const fakeSubscription = {
    "id": "sub_" + Date.now(),
    "space_id": "",
    "product_tier": "max",
    "sub_tier": 3,
    "billing_interval": "yearly",
    "status": "active",
    "current_period_start": now,
    "current_period_end": "2099-12-31T23:59:59.000Z",
    "cancel_at_period_end": false,
    "provider": "apple",
    "is_cny": false,
    "credits": 999999,
    "monthly_credits": 999999,
    "renew_change": null,
    "created_at": now,
    "updated_at": now
  };
  $done({ body: JSON.stringify(fakeSubscription) });

} else if (url.includes('/api/v1/credit/getCreditAccount')) {
  try {
    let bodyObj = JSON.parse($response.body);
    if (bodyObj) {
      const camel = isCamelCase(bodyObj);
      
      if (camel) {
        // camelCase format (x-use-camel-case: true)
        bodyObj.productTier = 'max';
        bodyObj.subTier = 3;
        bodyObj.monthlyBalance = 999999;
        bodyObj.monthlyQuota = 999999;
        bodyObj.permanentBalance = 999999;
        bodyObj.dailyBalance = 99999;
        bodyObj.dailyLimit = 99999;
        bodyObj.bonusBalance = 99999;
        bodyObj.spendableBalance = 999999;
        bodyObj.dailyUsed = 0;
        bodyObj.hasEverHadSubscription = true;
        bodyObj.freeMonthlyDailyGrantCount = 30;
        bodyObj.freeMonthlyDailyGrantMax = 30;
        bodyObj.currentPeriodEnd = '2099-12-31T23:59:59.000Z';
      } else {
        // snake_case format (x-use-snake-case: true)
        bodyObj.product_tier = 'max';
        bodyObj.sub_tier = 3;
        bodyObj.monthly_balance = 999999;
        bodyObj.monthly_quota = 999999;
        bodyObj.permanent_balance = 999999;
        bodyObj.daily_balance = 99999;
        bodyObj.daily_limit = 99999;
        bodyObj.bonus_balance = 99999;
        bodyObj.spendable_balance = 999999;
        bodyObj.daily_used = 0;
        bodyObj.has_ever_had_subscription = true;
        bodyObj.free_monthly_daily_grant_count = 30;
        bodyObj.free_monthly_daily_grant_max = 30;
        bodyObj.current_period_end = '2099-12-31T23:59:59.000Z';
      }
    }
    $done({ body: JSON.stringify(bodyObj) });
  } catch (e) {
    $done({});
  }

} else {
  $done({});
}
