// Bunpo 100% 对齐 Cake 极简无状态树状解密架构
// 只要是 JSON，无论层级多深，直接将 locked: true -> false, unlocked: false -> true
// 如果是 RevenueCat 订阅响应，注入 pro & platinum 终身权限

function log(msg) {
  console.log('[Bunpo] ' + msg);
}

function makeEntitlement(productId) {
  return {
    "purchase_date": "2024-01-01T01:01:01Z",
    "original_purchase_date": "2024-01-01T01:01:01Z",
    "expires_date": "2099-12-31T23:59:59Z",
    "is_sandbox": false,
    "ownership_type": "PURCHASED",
    "store": "app_store",
    "product_identifier": productId
  };
}

function fakeBody(body, url) {
  if (!body) return body;
  const trimmed = body.trimStart();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return body;

  try {
    let obj = JSON.parse(trimmed);
    let changed = false;

    // 1. RevenueCat 用户信息注入
    if (/revenuecat|rc-backup/i.test(url)) {
      if (/\/(offerings|attributes|intro_eligibility)\/?($|\?)/.test(url)) {
        return body;
      }
      if (!obj.subscriber) obj.subscriber = {};
      const proId = "com.N2BunpouApp.yuki.product.lifetimeTime";
      const platId = "com.N2BunpouApp.yuki.product.platinum.yearly";
      obj.subscriber.entitlements = {
        "pro": makeEntitlement(proId),
        "platinum": makeEntitlement(platId),
        "plus": makeEntitlement(proId),
        "premium": makeEntitlement(platId),
        "all_access": makeEntitlement(proId)
      };
      obj.subscriber.subscriptions = {
        [platId]: {
          "expires_date": "2099-12-31T23:59:59Z",
          "original_purchase_date": "2024-01-01T01:01:01Z",
          "purchase_date": "2024-01-01T01:01:01Z",
          "store": "app_store",
          "ownership_type": "PURCHASED",
          "period_type": "normal"
        }
      };
      obj.subscriber.non_subscriptions = {
        [proId]: [{
          "id": "bunpo_pro_lifetime",
          "purchase_date": "2024-01-01T01:01:01Z",
          "original_purchase_date": "2024-01-01T01:01:01Z",
          "store": "app_store",
          "ownership_type": "PURCHASED"
        }]
      };
      obj.subscriber.other_purchases = obj.subscriber.non_subscriptions;
      log('RevenueCat Subscriber Injected successfully');
      return JSON.stringify(obj);
    }

    // 2. 深度遍历改写 locked 字段 (Cake 同款)
    function walk(o, path) {
      if (!o || typeof o !== 'object') return;
      if (Array.isArray(o)) {
        o.forEach((v, i) => walk(v, path + '[' + i + ']'));
        return;
      }
      for (const k of Object.keys(o)) {
        const v = o[k];
        const p = path + '.' + k;
        if (v && typeof v === 'object') {
          walk(v, p);
          continue;
        }
        if (k === 'locked' && typeof v === 'boolean' && v === true) {
          o[k] = false;
          changed = true;
          log('UNLOCK ' + p + ' -> false');
        } else if (k === 'unlocked' && typeof v === 'boolean' && v === false) {
          o[k] = true;
          changed = true;
          log('UNLOCK ' + p + ' -> true');
        }
      }
    }

    walk(obj, '$');

    if (changed) {
      const nb = JSON.stringify(obj);
      log('FAKED ' + url.slice(0, 100));
      return nb;
    }
    return body;
  } catch (e) {
    log('parse fail ' + url.slice(0, 80) + ': ' + e.message);
    return body;
  }
}

if (typeof  !== 'undefined' && ) {
  const url = ( && .url) || '';
  const body = .body || '';
  if (body) {
    const nb = fakeBody(body, url);
    if (nb !== body) {
      ({ body: nb, headers: .headers });
    } else {
      ({});
    }
  } else {
    ({});
  }
} else {
  ({});
}
