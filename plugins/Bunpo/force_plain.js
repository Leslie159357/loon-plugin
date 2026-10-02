// Bunpo force_plain.js (仿 Cake force_plain.js)
// 1. Accept-Encoding: identity -> 防止响应被 gzip 压缩导致 body 无法解析
// 2. 删除 If-None-Match 与 x-revenuecat-etag -> 强制 RevenueCat 返回 200 全包，绝不返回 304
// 3. 删除 x-nonce -> 降级为普通免密响应

if ( && .headers) {
  var h = Object.assign({}, .headers);
  h['Accept-Encoding'] = 'identity';
  h['Cache-Control'] = 'no-cache';
  h['Pragma'] = 'no-cache';
  delete h['If-None-Match'];
  delete h['if-none-match'];
  delete h['If-Modified-Since'];
  delete h['if-modified-since'];
  delete h['x-revenuecat-etag'];
  delete h['X-RevenueCat-ETag'];
  delete h['x-nonce'];
  delete h['X-Nonce'];
  delete h['x-headers-hash'];
  delete h['X-Headers-Hash'];
  ({ headers: h });
} else {
  ({});
}
