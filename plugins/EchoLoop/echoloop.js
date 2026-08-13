// ==CloakNote==
// EchoLoop Premium 解锁 v1.0
// 判定源: www.echo-loop.top 后端 API（dio 直连，只能 Loon MITM 拦截）
// 策略: 通用注入 —— entitlements.active/all 注入 premium + 常见布尔字段强制 true
// 注意: 后端响应结构尚未抓包确认，若未生效请抓包后反馈字段结构
// ==/CloakNote==

const url = $request.url;
let body = $response.body;

function makeEntitlement() {
  return {
    "id": "premium",
    "identifier": "premium",
    "is_active": true,
    "isActive": true,
    "will_renew": true,
    "period_type": "normal",
    "store": "app_store",
    "ownership_type": "PURCHASED",
    "product_identifier": "echo_loop_plus_annual",
    "expires_date": "2099-01-01T00:00:00Z",
    "expiration_date": "2099-01-01T00:00:00Z",
    "purchase_date": "2026-01-01T00:00:00Z",
    "latest_purchase_date": "2026-01-01T00:00:00Z",
    "is_sandbox": false
  };
}

function injectPremium(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  // 1) entitlements 容器: {all, active} / {premium} / 数组
  if (obj.entitlements && typeof obj.entitlements === 'object') {
    var ent = obj.entitlements;
    ['all', 'active', 'activeInCurrentEnvironment', 'active_in_current_environment'].forEach(function (k) {
      if (ent[k] && typeof ent[k] === 'object' && !Array.isArray(ent[k])) {
        ent[k]['premium'] = makeEntitlement();
      }
    });
    // 若 entitlements 本身就是 map（如 {"premium": {...}}）
    if (!ent.all && !ent.active && !ent.premium) {
      ent['premium'] = makeEntitlement();
    }
  }

  // 2) 直接布尔/状态字段强制解锁
  ['isPremium', 'is_premium', 'isPro', 'is_pro', 'isSubscribed', 'is_subscribed',
   'isVip', 'is_vip', 'isLifetimePro', 'premium', 'unlocked', 'isEntitled',
   'hasActiveEntitlement', 'is_active'].forEach(function (k) {
    if (k in obj) obj[k] = true;
  });

  // 3) data 包裹层（常见 API 包装）
  if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
    injectPremium(obj.data);
  }

  // 4) 订阅/计划列表
  if (obj.subscriptions && typeof obj.subscriptions === 'object') {
    var sub = obj.subscriptions;
    if (!sub['echo_loop_plus_annual']) {
      sub['echo_loop_plus_annual'] = makeEntitlement();
    }
    if (!sub['echo_loop_plus_monthly']) {
      sub['echo_loop_plus_monthly'] = makeEntitlement();
    }
  }

  return obj;
}

if (body) {
  try {
    var obj = JSON.parse(body);
    var hit = false;
    if (url.indexOf('/api/entitlements') !== -1) { injectPremium(obj); hit = true; }
    if (url.indexOf('/api/v1/client/config') !== -1) { injectPremium(obj); hit = true; }
    if (url.indexOf('entitlement') !== -1 || url.indexOf('premium') !== -1 || url.indexOf('plan') !== -1) {
      injectPremium(obj); hit = true;
    }
    if (hit) {
      $done({ body: JSON.stringify(obj) });
      return;
    }
  } catch (e) {
    // 非 JSON 响应不处理
  }
}
$done({});
