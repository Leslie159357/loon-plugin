// Bunpo No-Cache & Nonce Bypass v5.0
// 1. 删除 x-revenuecat-etag / If-None-Match 彻底强制服务器返回 200，绝不返回 304
// 2. 删除 x-nonce 剥离 RevenueCat 签名校验，降级为普通免签响应
// 3. 强制 Accept-Encoding: identity 防止 gzip 压缩导致篡改失败

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
