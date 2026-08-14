// Cake (me.mycake) —— 强制 API 响应明文
// api.cakeapp.me 走 AWS API Gateway，app 默认 Accept-Encoding: gzip → 响应压缩
// → Loon http-response 脚本拿到的 body 是 gzip 二进制，JSON.parse 失败，伪造全部失效
// 请求阶段把 Accept-Encoding 改为 identity，强制服务器返回明文 JSON

if ($request && $request.headers) {
  const h = Object.assign({}, $request.headers);
  h['Accept-Encoding'] = 'identity';
  $done({ headers: h });
} else {
  $done({});
}
