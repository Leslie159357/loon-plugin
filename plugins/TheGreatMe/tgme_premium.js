// TheGreatMe Premium Unlock — RevenueCat MITM 定制版
// 逆向依据：thegreatme.forever（永久买断）/ .week / .year 产品
// entitlement: premium + pro 双写；etag 防 304；幂等直通
// 适用于 Loon / Quantumult X / Surge（$request/$response/$done 通用）
// 部署：脚本放 /Scripts/，配合对应平台配置文件

// ========== 端点分类 ==========
function isSubscribers(url) {
  return /\/v1\/subscribers\//.test(url);
}
function isReceipts(url) {
  return /\/v1\/receipts/.test(url);
}
function isMapping(url) {
  return /product_entitlement_mapping/.test(url);
}
function isOfferings(url) {
  return /\/offerings/.test(url);
}

// ========== 幂等：已含未过期 entitlement → 直通 ==========
function alreadyActive(body) {
  try {
    const d = JSON.parse(body);
    const subs = d.subscriber || {};
    const ent = subs.entitlements || {};
    for (const k in ent) {
      const e = ent[k];
      if (e && e.expires_date && new Date(e.expires_date).getTime() > Date.now()) return true;
    }
  } catch (e) {}
  return false;
}

function makeEntitlement() {
  return {
    "expires_date": "2099-12-31T23:59:59Z",
    "grace_period_expires_date": null,
    "product_identifier": "thegreatme.forever",
    "purchase_date": "2024-09-09T09:09:09Z",
    "purchase_date_ms": 1725872949000,
    "store": "app_store",
    "unsubscribe_detected_at": null,
    "billing_issues_detected_at": null,
    "ownership_type": "PURCHASED"
  };
}

function makeNonSub() {
  return [{
    "id": "thegreatme.forever_mitm",
    "purchase_date": "2024-09-09T09:09:09Z",
    "original_purchase_date": "2024-09-09T09:09:09Z",
    "store": "app_store",
    "store_transaction_id": "490001314520000",
    "is_sandbox": false,
    "ownership_type": "PURCHASED"
  }];
}

function makeSubProduct() {
  return {
    "expires_date": "2099-12-31T23:59:59Z",
    "original_purchase_date": "2024-09-09T09:09:09Z",
    "purchase_date": "2024-09-09T09:09:09Z",
    "store": "app_store",
    "is_sandbox": false,
    "ownership_type": "PURCHASED",
    "period_type": "normal"
  };
}

function patchSubscribers(body) {
  const d = JSON.parse(body);
  const subs = d.subscriber || (d.subscriber = {});
  const ent = subs.entitlements || (subs.entitlements = {});
  const fake = makeEntitlement();
  ent["premium"] = fake;
  ent["pro"] = fake;
  if (!subs.non_subscriptions) subs.non_subscriptions = {};
  subs.non_subscriptions["thegreatme.forever"] = makeNonSub();
  if (!subs.other_purchases) subs.other_purchases = {};
  subs.other_purchases["thegreatme.forever"] = makeNonSub();
  if (!subs.subscriptions) subs.subscriptions = {};
  subs.subscriptions["thegreatme.forever"] = makeSubProduct();
  subs.subscriptions["thegreatme.year"] = makeSubProduct();
  subs.subscriptions["thegreatme.week"] = makeSubProduct();
  subs.original_purchase_date = "2024-09-09T09:09:09Z";
  subs.first_seen = "2024-09-09T09:09:09Z";
  d.request_date = new Date().toISOString();
  d.request_date_ms = Date.now();
  return JSON.stringify(d);
}

function patchMapping() {
  const map = {
    "product_entitlement_mapping": {}
  };
  for (const pid of ["thegreatme.forever", "thegreatme.year", "thegreatme.week"]) {
    map.product_entitlement_mapping[pid] = {
      "entitlement": "premium",
      "entitlements": ["premium", "pro"]
    };
  }
  return JSON.stringify(map);
}

function patchOfferings(body) {
  try {
    const d = JSON.parse(body);
    d.request_date = new Date().toISOString();
    d.request_date_ms = Date.now();
    return JSON.stringify(d);
  } catch (e) {
    return body;
  }
}

// ========== 主入口 ==========
try {
  const url = $request.url || "";
  const method = $request.method || "GET";

  // request 阶段：删 etag 防 304（无 body 无法改写）
  if (typeof $request.headers !== "undefined" && !$response) {
    if ($request.headers["x-revenuecat-etag"]) {
      delete $request.headers["x-revenuecat-etag"];
    }
    $done({ headers: $request.headers });
    return;
  }

  // response 阶段
  if (isMapping(url)) {
    $done({ body: patchMapping() });
    return;
  }
  if (isSubscribers(url)) {
    if (alreadyActive($response.body)) { $done({}); return; }
    $done({ body: patchSubscribers($response.body) });
    return;
  }
  if (isReceipts(url)) {
    if (alreadyActive($response.body)) { $done({}); return; }
    $done({ body: patchSubscribers($response.body) });
    return;
  }
  if (isOfferings(url)) {
    $done({ body: patchOfferings($response.body) });
    return;
  }
  $done({});
} catch (e) {
  $done({});
}
