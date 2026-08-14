// 强制 Accept-Encoding: identity — 防 gzip 压缩响应导致 JSON.parse 失败
// (AWS API Gateway 类后端对 gzip 请求返回压缩体 → Loon $response.body 是二进制 → 脚本静默失效)

let headers = $request.headers;
headers['Accept-Encoding'] = 'identity';
$done({ headers });
