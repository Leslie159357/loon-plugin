// Xmind Pro+ 解锁 v2 - 后端会员伪造（端点针对性 + 通用递归兜底）
// 拦截 xmind 域名会员端点，将 subscription/plan 改为 pro/subscribed
// 真实 API 结构来源：Leslie159357/loon-plugin 旧版抓包 (2026-06) + v26.05 静态逆向
//   域名既有 www.xmind.cn 也有 app.xmind.com/cn（地区分流），全部覆盖
//   端点:
//     GET  /_res/user_sub_details     → {"_code":200,"google":[],"appstore":[],"official_website":[]}
//     POST /_res/appstore/sub         → 正常返回 errorcode(需receipt)，直接伪造成功体
//     POST /_api/appstore/active      → {"status":"trial","subscriptionStatus":"UNKNOWN","expireTime":0,...}
//     GET  /_res/devices              → {"raw_data":"...","license":{"status":"Trial","expireTime":0},...}
//     GET  /_res/session              → {"_code":200,"uid":"...","limit":0,...}
//     GET  /store/user/purchases      → 模板购买历史（不改）
//     GET  /_res/appstore/products    → 产品列表（不改）
// 目标: Pro Plus 全面解锁 + AppStore 订阅视为活跃 + License 视为 Pro

const VERSION = "XmindUnlock v2";

// ============ 工具 ============
function log(msg) { console.log(`[${VERSION}] ${msg}`); }

function getHost(url) {
  const m = url.match(/^https?:\/\/([^\/]+)/i);
  return m ? m[1] : '';
}

function isXmindHost(host) {
  return /(^|\.)(xmind\.(com|cn)|xmind\.app)$/i.test(host)
    || /^www\.xmind\.(com|cn)$/i.test(host)
    || /^app\.xmind\.(com|cn)$/i.test(host);
}

// ============ 通用递归锁定（兜底） ============
const BOOL_LOCK = ["ispro","isproplus","isproplus","isprofeature","ispremium","ispro_user","isprouser","issubscribed","isvip","islifetime","hasvalidlicense","isactivated","isproversionvalid","haspayed","haspayment","isactive","isenabled","ispurchasedallowed","pro","isplus","is_paid"];
const BOOL_LOCK_EXACT = new Set(["is_pro","is_proplus","is_pro_plus","is_pro_feature","is_premium","is_pro_user","is_subscribed","is_vip","is_lifetime","is_activated","is_pro_version_valid","has_valid_license","has_paid","is_purchased_allowed","already_purchased_proplus","is_pro_used","haspro","has_pro"]);
const STR_LOCK = {"plan":"pro","plan_name":"pro","subscription":"pro","subscriptionPlan":"pro","licenseType":"pro","productId":"net.xmind.brownieapp.pro.yearly","memberStatus":"pro","memberType":"pro","status":"ACTIVE","subscriptionStatus":"ACTIVE","expireTime":4092599349,"expiresAt":4092599349,"expireDate":4092599349,"expiretime":4092599349};
const NUM_LOCK = {"credits":999999,"limit":1,"bindXmind":1};

const DISABLED = ["is_ai_disabled","isaidisabled","isdisabled","isainabled","ai_disabled","disabled"];

function forceJson(obj, depth) {
  if (!obj || typeof obj !== 'object' || depth > 30) return obj;
  const isArr = Array.isArray(obj);
  const out = isArr ? [] : {};
  for (const k of Object.keys(obj)) {
    let v = obj[k];
    const lk = k.toLowerCase();
    const lkLower = lk;

    if (typeof v === 'boolean' && DISABLED.includes(lkLower)) {
      v = false;
    } else if (typeof v === 'boolean' && (BOOL_LOCK.includes(lk) || BOOL_LOCK_EXACT.has(lkLower))) {
      log(`bool ${k}: ${v} -> true`);
      v = true;
    } else if (typeof v === 'string' && STR_LOCK.hasOwnProperty(lkLower)) {
      log(`str ${k}: ${v} -> ${STR_LOCK[lkLower]}`);
      v = STR_LOCK[lkLower];
    } else if (typeof v === 'number' && NUM_LOCK.hasOwnProperty(lkLower)) {
      log(`num ${k}: ${v} -> ${NUM_LOCK[lkLower]}`);
      v = NUM_LOCK[lkLower];
    } else if (typeof v === 'object') {
      v = forceJson(v, depth + 1);
    }
    if (isArr) out.push(v); else out[k] = v;
  }
  return out;
}

// ============ 端点针对性处理 ============

// user_sub_details: 数组注入活跃订阅
function handleUserSubDetails(json) {
  if (json && typeof json === 'object') {
    for (const arrKey of ['appstore','google','official_website','appStore']) {
      if (Array.isArray(json[arrKey])) {
        // 空数组 → 注入活跃 Pro
        if (json[arrKey].length === 0) {
          json[arrKey].push({
            plan: "Pro",
            isActive: true,
            expireDate: 4092599349,
            productId: "net.xmind.brownieapp.pro.yearly",
            status: "active"
          });
          log(`注入 ${arrKey} Pro 订阅`);
        } else {
          // 已有 → 递归锁定
          json[arrKey] = forceJson(json[arrKey], 1);
        }
      }
    }
    // 顶层直接字段也锁定
    return forceJson(json, 1);
  }
  return json;
}

// appstore/active: 直接改状态字段
function handleAppstoreActive(json) {
  if (json && typeof json === 'object') {
    if (typeof json.status === 'string' && !/^(pro|active|ACTIVE)$/i.test(json.status)) {
      log(`status: ${json.status} -> pro`);
      json.status = "pro";
    }
    if (typeof json.subscriptionStatus === 'string' && !/^ACTIVE$/i.test(json.subscriptionStatus)) {
      log(`subscriptionStatus: ${json.subscriptionStatus} -> ACTIVE`);
      json.subscriptionStatus = "ACTIVE";
    }
    json.expireTime = 4092599349;
    json.bindXmind = 1;
    return forceJson(json, 1);
  }
  return json;
}

// devices: license.status -> Pro
function handleDevices(json) {
  if (json && typeof json === 'object') {
    if (json.license && typeof json.license === 'object') {
      if (typeof json.license.status === 'string' && !/^pro$/i.test(json.license.status)) {
        log(`license.status: ${json.license.status} -> Pro`);
        json.license.status = "Pro";
      }
      json.license.expireTime = 4092599349;
    }
    return forceJson(json, 1);
  }
  return json;
}

// session: limit -> 1
function handleSession(json) {
  if (json && typeof json === 'object') {
    return forceJson(json, 1);
  }
  return json;
}

// appstore/sub: 直接伪造成功响应（原先因无 receipt 返回 errorcode）
function handleAppstoreSub(url, method) {
  log("appstore/sub -> 伪造成功订阅响应");
  return {
    _code: 200,
    plan: "Pro",
    isActive: true,
    expireDate: 4092599349,
    status: "active",
    productId: "net.xmind.brownieapp.pro.yearly"
  };
}

// ============ 主入口 ============
function xmindUnlock() {
  const url = $request.url;
  const method = ($request.method || 'GET').toUpperCase();
  const host = getHost(url);
  log(`${method} ${url}`);

  if (!isXmindHost(host)) { $done({}); return; }

  // POST appstore/sub → 直接伪造（无真实 receipt）
  if (/\/_res\/appstore\/sub$/.test(url) ) {
    const body = JSON.stringify(handleAppstoreSub(url, method));
    const headers = Object.assign({}, $response ? $response.headers : {});
    headers['Content-Type'] = 'application/json';
    $done({ status: 200, headers, body });
    return;
  }

  // 其余 GET/POST 统一改响应体
  if (typeof $response === 'undefined' || $response === null) { $done({}); return; }
  const respBody = $response.body;
  if (typeof respBody !== 'string' || !respBody.length) { $done({}); return; }

  let json = null;
  try { json = JSON.parse(respBody); }
  catch (e) { log(`not json, skip (${respBody.length}b)`); $done({}); return; }

  let result = json;
  if (/\/_res\/user_sub_details/.test(url)) {
    result = handleUserSubDetails(json);
  } else if (/\/_api\/appstore\/active/.test(url)) {
    result = handleAppstoreActive(json);
  } else if (/\/_res\/devices/.test(url)) {
    result = handleDevices(json);
  } else if (/\/_res\/session/.test(url)) {
    result = handleSession(json);
  } else {
    // 通用兜底（purchases/products 等）
    result = forceJson(json, 0);
  }

  const newBody = JSON.stringify(result);
  log(`rewritten ${host} ${respBody.length}b -> ${newBody.length}b`);
  const headers = Object.assign({}, $response.headers || {});
  headers['Content-Type'] = 'application/json';
  // 修正 content-length
  if (headers['Content-Length']) headers['Content-Length'] = String(newBody.length);
  if (headers['content-length']) headers['content-length'] = String(newBody.length);
  $done({ headers, body: newBody });
}

try { xmindUnlock(); } catch (e) {
  log(`error: ${e.message}`);
  $done({});
}
