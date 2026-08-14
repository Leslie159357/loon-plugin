// LinguoLand 会员解锁 — http-request 脚本（强制 no-cache，绕过 304）
// 覆盖: quota-status / credits / profile（这些接口常 304，脚本拿不到 body 就无法改写）
$done({
  headers: Object.assign({}, $request.headers, {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  })
});
