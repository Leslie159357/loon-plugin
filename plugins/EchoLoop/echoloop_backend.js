// ==CloakNote==
// EchoLoop Premium 解锁 v2.0（后端权威源劫持）
// 判定链（源码确认 lib/features/subscription/services/entitlement_repository.dart）:
//   GET /api/entitlements (Authorization: Bearer <supabase token>)
//   → 响应 { isPremium, entitlementIds, productId, expiresAtMs, willRenew, source, purchaseType }
//   → 2xx 即权威，直接覆盖本地缓存
// 注意: 匿名用户 (userId==null) 直接判 free 不走后端 → 必须先登录 app 账号
// ==/CloakNote==

const url = $request.url;

if (url.indexOf('/api/entitlements') !== -1) {
  const fake = {
    isPremium: true,
    entitlementIds: ["premium"],
    productId: "echo_loop_plus_annual",
    expiresAtMs: 4070908800000, // 2099-01-01T00:00:00Z
    willRenew: true,
    source: "apple",
    purchaseType: "subscription"
  };
  var headers = {};
  if ($response && $response.headers) {
    headers = $response.headers;
  }
  // E6 信号头：Dio 拦截器读 x-entitlement-active 触发对账（与响应体一致）
  headers['x-entitlement-active'] = '1';
  $done({ body: JSON.stringify(fake), headers: headers });
  return;
}

$done({});
