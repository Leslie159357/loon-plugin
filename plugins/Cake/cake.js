// Cake (me.mycake) 6.8.1 会员解锁插件 v1
// 拦截 api.mycake.plus / CloudFront CDN 的订阅接口
// 双模式：console.log 记录真实响应 + 试探伪造会员字段
// 保守原则：只改已存在的 JSON 字段，不新增

// 已知 JS 端会员状态字段（Hermes 字符串池提取）
const TRUE_FIELDS = [
  'isMembershipUser', 'isSubscribed', 'isMembership', 'hasMembership',
  'isMembershipFreeTrial', 'isMembershipOnly', 'isAutoRenewing',
  'isMembershipSuspendedNow', 'isPremiumUser', 'isPremium', 'isVip',
  'isPlusUser', 'isPlus', 'isMember', 'isPaidUser', 'isEntitled',
  'hasActiveSubscription', 'isActiveSubscription',
];

// 启发式：布尔字段名含会员关键词且当前为 false → 改 true
const HEURISTIC_RE = /(membership|subscription|premium|\bplus\b|entitle|paid|vip|pro\b|trial)/i;

const SUBSCRIPTION_RE = /(subscription|entitlement|verifyReceipt|membership)/i;

function log(msg) {
  console.log('[Cake] ' + msg);
}

function fakeBody(body) {
  if (!body) return body;
  try {
    const obj = JSON.parse(body);
    let changed = false;
    function walk(o, path) {
      if (!o || typeof o !== 'object') return;
      if (Array.isArray(o)) { o.forEach((v, i) => walk(v, path + '[' + i + ']')); return; }
      for (const k of Object.keys(o)) {
        const v = o[k];
        const p = path + '.' + k;
        if (v && typeof v === 'object') { walk(v, p); continue; }
        if (typeof v === 'boolean') {
          if (TRUE_FIELDS.includes(k) && v === false) {
            o[k] = true; changed = true; log('FIX ' + p + ' -> true');
          } else if (HEURISTIC_RE.test(k) && v === false && !/Enabled|Visible|Show|Open|On/i.test(k)) {
            // 跳过 UI 开关类字段，只改状态类
            o[k] = true; changed = true; log('HEUR ' + p + ' -> true');
          }
        }
        if (typeof v === 'string' && /(endDate|expire|Expire|EndDate|expiresAt|validUntil)/.test(k) && v.length > 0 && v.length < 40) {
          if (/^\d{4}-\d{2}-\d{2}/.test(v) || /^\d{10,13}$/.test(v) || /^\d{4}\/\d{2}\/\d{2}/.test(v)) {
            o[k] = /^\d{10,13}$/.test(v) ? 4102444800000 : '2099-12-31'; // 2099
            changed = true; log('DATE ' + p + ' -> 2099');
          }
        }
        if (typeof v === 'number' && /(endDate|expire|expiresAt|validUntil)/.test(k) && v > 0 && v < 2000000000000) {
          o[k] = 4102444800000; changed = true; log('NUMDATE ' + p + ' -> 2099');
        }
      }
    }
    walk(obj, '$');
    if (changed) {
      const nb = JSON.stringify(obj);
      log('FAKED: ' + nb.slice(0, 2000));
      return nb;
    }
    log('NO-CHANGE: ' + body.slice(0, 1000));
    return body;
  } catch (e) {
    log('parse fail: ' + e.message + ' | raw: ' + body.slice(0, 500));
    return body;
  }
}

// ---- Loon http-response ----
if (typeof $response !== 'undefined' && $response) {
  const url = ($request && $request.url) || '';
  log('RESP ' + url);
  const body = $response.body || '';
  if (body) log('RAW ' + body.slice(0, 3000));
  if (SUBSCRIPTION_RE.test(url)) {
    const nb = fakeBody(body);
    if (nb !== body) {
      $done({ body: nb, headers: $response.headers });
    } else {
      $done({});
    }
  } else {
    $done({});
  }
} else {
  $done({});
}
