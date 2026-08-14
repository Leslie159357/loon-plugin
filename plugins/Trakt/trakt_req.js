// Trakt VIP 解锁 - 请求头修改
// 强制 Accept-Encoding: identity,防止服务器返回 gzip 压缩响应导致响应脚本解析失败
let headers = $request.headers || {};
headers["Accept-Encoding"] = "identity";
$done({ headers });
