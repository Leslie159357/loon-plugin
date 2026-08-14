// LinguoLand 会员解锁 — http-request 脚本 v3
// 三件事（缺一不可）:
// 1. 强制 Accept-Encoding: identity → 防 gzip（Cake 教训: gzip body 脚本 JSON.parse 失败静默失效）
// 2. Cache-Control: no-cache → 防 304（304 无 body，脚本拿不到内容）
// 3. 删除 If-None-Match / If-Modified-Since → 防 ETag 条件请求返回 304
var h = Object.assign({}, $request.headers);
h['Accept-Encoding'] = 'identity';
h['Cache-Control'] = 'no-cache';
h['Pragma'] = 'no-cache';
delete h['If-None-Match'];
delete h['If-Modified-Since'];
$done({ headers: h });
