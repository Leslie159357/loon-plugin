// LinguoLand 解锁 — Quantumult X script-request-header
// 功能: 强制未压缩响应 + 绕过 304（防 gzip body 导致 response 脚本 JSON.parse 失败）
// 放置: Quantumult X → 脚本 → 本地脚本 → 新建 → 粘贴保存为 linguoland_nocache.js
// 注意: QX 中修改请求头用 $done({headers: ...}) 返回

var headers = $request.headers;
headers['Accept-Encoding'] = 'identity';   // 防 gzip（关键!）
headers['Cache-Control'] = 'no-cache';     // 防 304
headers['Pragma'] = 'no-cache';
delete headers['If-None-Match'];           // 删 ETag 条件请求
delete headers['If-Modified-Since'];

$done({ headers: headers });
