// force_plain.js
// 强制后端和 RevenueCat 返回明文完整 200 JSON，防止 gzip 和 304 缓存
if ( && .headers) {
  var h = Object.assign({}, .headers);
  h['Accept-Encoding'] = 'identity';
  delete h['If-None-Match'];
  delete h['if-none-match'];
  delete h['If-Modified-Since'];
  delete h['if-modified-since'];
  delete h['X-RevenueCat-ETag'];
  delete h['x-revenuecat-etag'];
  ({ headers: h });
} else {
  ({});
}
