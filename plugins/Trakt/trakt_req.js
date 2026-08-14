// Trakt VIP 解锁 - 请求头修改
// 1. 强制 Accept-Encoding: identity（防 gzip 导致响应脚本 JSON.parse 失败）
// 2. Cache-Control: no-cache（防缓存旧响应）
// 3. 删 If-None-Match / If-Modified-Since（防 304 无 body，响应脚本收不到内容）
let headers = $request.headers || {};
headers["Accept-Encoding"] = "identity";
headers["Cache-Control"] = "no-cache";
delete headers["If-None-Match"];
delete headers["If-Modified-Since"];
$done({ headers });
