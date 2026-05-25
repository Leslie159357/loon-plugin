// ELSA Speak Premium Unlock
// 适用版本: elsa-ios 9.x
// 全部接口 pool.elsanow.io 明文JSON

const BASE_URL = 'pool.elsanow.io';

// 修改entitlements主响应
function fixEntitlements(body) {
  if (!body || body.length < 20) return body;
  try {
    let obj = JSON.parse(body);
    if (obj.tier && obj.tier.code) {
      // 改tier为premium
      obj.tier.code = 'premium';
      obj.tier.owner_type = 'individual';
      if (obj.tiers && obj.tiers.length > 0) {
        obj.tiers = [{
          ...obj.tiers[0],
          code: 'premium'
        }];
      }
      // 改所有feature的credit限制
      if (obj.entitlements) {
        if (obj.entitlements.features) {
          obj.entitlements.features.forEach(f => {
            f.credit_remaining = 99999;
            f.credit_total = 99999;
            f.expire_at = 4102329600; // 2099-12-31
          });
        }
        if (obj.entitlements.assets) {
          obj.entitlements.assets.forEach(a => {
            a.credit_remaining = 99999;
            a.credit_total = 99999;
            a.expire_at = 4102329600;
          });
        }
        // 加membership
        if (!obj.entitlements.memberships) obj.entitlements.memberships = [];
        obj.entitlements.memberships.push({
          code: 'elsa_speak.membership.premium',
          start_at: 1779707643,
          expire_at: 4102329600,
          application: 'elsa_speak',
          owner_type: 'individual',
          owner_id: obj.tier.owner_id || ''
        });
      }
      // 加transactions
      if (!obj.transactions) obj.transactions = [];
      obj.transactions.push({
        transaction_id: 'MITM_ELSA_PREMIUM',
        product_id: 'one_year.paid.ios.v4.elsa.premium_membership',
        purchased_at: 1779707643,
        expires_at: 4102329600
      });
    }
    return JSON.stringify(obj);
  } catch (e) {
    return body;
  }
}

// 修改单个entitlement查询
function fixSingleEntitlement(body, credit = 99999) {
  if (!body || body.length < 20) return body;
  try {
    let obj = JSON.parse(body);
    obj.credit_remaining = credit;
    obj.credit_total = credit;
    obj.expire_at = 4102329600;
    return JSON.stringify(obj);
  } catch (e) {
    return body;
  }
}

// 修改play_lesson响应
function fixPlayLesson(body) {
  if (!body || body.length < 20) return body;
  try {
    let obj = JSON.parse(body);
    // 如果返回了错误（CREDIT_LESSON_NOT_ENOUGH），伪造成功响应
    if (obj.detail && obj.error_code === 'CREDIT_LESSON_NOT_ENOUGH') {
      return JSON.stringify({
        user_id: 'MUAICTwkJTEcASI7Oy8lXA8edwV9Yx4BMjx/ISEBDVs=',
        action: 'play_lesson',
        message: 'Execute play_lesson successfully',
        available_entitlements: [{
          user_id: 'K3Lo_FIUqgHHPCH3xS9Q771ccnHppVzo',
          code: 'elsa_speak.feature.lesson',
          expire_at: 4102329600,
          credit_used: 0,
          credit_remaining: 99999,
          credit_total: 99999
        }, {
          user_id: 'K3Lo_FIUqgHHPCH3xS9Q771ccnHppVzo',
          code: 'elsa_speak.feature.learning_time',
          expire_at: 4102329600,
          credit_used: 0,
          credit_remaining: null,
          credit_total: null
        }],
        used_entitlements: []
      });
    }
    // 如果响应成功，保证credit充足
    if (obj.available_entitlements) {
      obj.available_entitlements.forEach(e => {
        e.credit_remaining = 99999;
        e.credit_total = 99999;
        e.expire_at = 4102329600;
      });
    }
    return JSON.stringify(obj);
  } catch (e) {
    return body;
  }
}

// 修改product-catalog
function fixProductCatalog(body) {
  if (!body || body.length < 20) return body;
  try {
    let obj = JSON.parse(body);
    obj.eligible = false;
    obj.current_tier = 'premium';
    obj.is_lifetime_membership = true;
    return JSON.stringify(obj);
  } catch (e) {
    return body;
  }
}

// 修改lesson_limit/reset
function fixLessonLimit(body) {
  if (!body || body.length < 10) return body;
  try {
    let arr = JSON.parse(body);
    if (Array.isArray(arr)) {
      arr.forEach(item => {
        if (item.type === 'lesson_limit') {
          item.tier = 'premium';
          item.credits = 99999;
          item.time_interval_in_seconds = 86400;
        }
      });
    }
    return JSON.stringify(arr);
  } catch (e) {
    return body;
  }
}

// 修改用户账户
function fixUserAccount(body) {
  if (!body || body.length < 20) return body;
  try {
    let obj = JSON.parse(body);
    obj.daily_limit_free_lesson = 99999;
    return JSON.stringify(obj);
  } catch (e) {
    return body;
  }
}

// 修改sl-api subscription
function fixSubscription(body) {
  if (!body || body.length < 10) return body;
  try {
    let obj = JSON.parse(body);
    obj.subscriptions = [{
      product_id: 'one_year.paid.ios.v4.elsa.premium_membership',
      environment: 'Production',
      kind: 'Subscription',
      purchase_date: '2026-05-25 11:14:03 Etc/GMT',
      original_purchase_date: '2026-05-25 11:14:03 Etc/GMT',
      expires_date: '2099-12-31 00:00:00 Etc/GMT',
      renewal_preference: 'Auto-Renew On',
      renewal_status: 'Will Renew',
      store: 'App Store',
      in_trial_period: false,
      in_intro_offer_period: false,
      cancellation_date: null,
      status: 'Active',
      is_sandbox: false,
      original_transaction_id: 'MITM_ELSA_PREMIUM_001',
      transaction_id: 'MITM_ELSA_PREMIUM_001',
      auto_renew_status: true,
      auto_renew_product_id: 'one_year.paid.ios.v4.elsa.premium_membership'
    }];
    obj.free_accesses = [];
    return JSON.stringify(obj);
  } catch (e) {
    return body;
  }
}

// 路由
const url = $request.url;
const method = $request.method;
const isResponse = typeof $response !== 'undefined';

if (!isResponse) {
  $done({});
  return;
}

let body = $response.body;
if (!body) { $done({}); return; }

try {
  if (method === 'GET' && url.includes('/entitlement/api/v1/user/entitlements?')) {
    body = fixEntitlements(body);
  } else if (method === 'GET' && url.includes('/entitlement/api/v1/user/entitlement/')) {
    body = fixSingleEntitlement(body);
  } else if (method === 'POST' && url.includes('/entitlement/api/v1/user/operator/play_lesson')) {
    body = fixPlayLesson(body);
  } else if (url.includes('/product-catalog/v1/eligible/upgrade-to-premium')) {
    body = fixProductCatalog(body);
  } else if (url.includes('/user-segmentation/limitation/v1/segments/lesson_limit_baseline/reset')) {
    body = fixLessonLimit(body);
  } else if (method === 'GET' && url.includes('/user/api/v1/account') && !url.includes('achievement') && !url.includes('streak')) {
    body = fixUserAccount(body);
  } else if (url.includes('//sl-api/api/users/me/subscriptions')) {
    body = fixSubscription(body);
  }
} catch (e) {
  console.log('ELSA Unlock Error: ' + e);
}

$done({ body });
