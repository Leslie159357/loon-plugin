// LinguoLand 会员解锁 — http-request 脚本（强制 no-cache，绕过 304）
// 抓包显示 quota-status 常返回 304 (ETag 缓存)，http-response 脚本拿不到 body
// 强制服务器返回 200 完整响应，解锁脚本才有 body 可改
$done({
  headers: Object.assign({}, $request.headers, {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  })
});
