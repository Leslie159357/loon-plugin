// LinguoLand TTS 免费听书 — Loon http-request (requires-body=true)
// 原理: hash = sha1(normalize(text)) 前16位；CDN 音频公开无鉴权
// 拦截 POST /api/v1/tts/sentence:
//   1. 本地算 hash（含弯引号→直引号规范化候选）
//   2. HEAD 探测 CDN 各 voice 路径
//   3. 命中 → 直接返回伪造响应（服务器不收到请求 → 不扣费！）
//   4. 未命中 → 放行（服务器生成，仅首次扣费，之后 CDN 缓存永久免费）

function sha1hex(msg) {
  function rotl(n, b) { return (n << b) | (n >>> (32 - b)); }
  function toBytes(str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c < 128) bytes.push(c);
      else if (c < 2048) bytes.push((c >> 6) | 192, (c & 63) | 128);
      else bytes.push((c >> 12) | 224, ((c >> 6) & 63) | 128, (c & 63) | 128);
    }
    return bytes;
  }
  var bytes = toBytes(msg);
  var bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  bytes.push(0, 0, 0, 0);
  bytes.push((bitLen >>> 24) & 255, (bitLen >>> 16) & 255, (bitLen >>> 8) & 255, bitLen & 255);
  var h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;
  var w = new Array(80);
  for (var i = 0; i < bytes.length; i += 64) {
    for (var j = 0; j < 16; j++) {
      w[j] = (bytes[i + j * 4] << 24) | (bytes[i + j * 4 + 1] << 16) | (bytes[i + j * 4 + 2] << 8) | bytes[i + j * 4 + 3];
    }
    for (var j = 16; j < 80; j++) w[j] = rotl(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
    var a = h0, b = h1, c = h2, d = h3, e = h4;
    for (var j = 0; j < 80; j++) {
      var f, k;
      if (j < 20) { f = (b & c) | ((~b) & d); k = 0x5A827999; }
      else if (j < 40) { f = b ^ c ^ d; k = 0x6ED9EBA1; }
      else if (j < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8F1BBCDC; }
      else { f = b ^ c ^ d; k = 0xCA62C1D6; }
      var temp = (rotl(a, 5) + f + e + k + w[j]) & 0xFFFFFFFF;
      e = d; d = c; c = rotl(b, 30); b = a; a = temp;
    }
    h0 = (h0 + a) & 0xFFFFFFFF; h1 = (h1 + b) & 0xFFFFFFFF;
    h2 = (h2 + c) & 0xFFFFFFFF; h3 = (h3 + d) & 0xFFFFFFFF; h4 = (h4 + e) & 0xFFFFFFFF;
  }
  function hex(n) { var s = (n >>> 0).toString(16); while (s.length < 8) s = '0' + s; return s; }
  return hex(h0) + hex(h1) + hex(h2) + hex(h3) + hex(h4);
}

var VOICES = [
  'premium-us-blair', 'premium-us-andy', 'premium-uk-emily',
  'economy-us-donna', 'economy-us-andy', 'economy-uk-emily'
];
var BASE = 'https://cdn.linguoland.com/assets/tts/sentences/';

try {
  var req = JSON.parse($request.body || '{}');
  var text = req.text || '';
  if (!text) { $done({}); return; }

  var cands = [text];
  var norm = text.replace(/\u2018|\u2019/g, "'").replace(/\u201C|\u201D/g, '"');
  if (norm !== text) cands.push(norm);

  var hashes = [];
  for (var i = 0; i < cands.length; i++) {
    var h = sha1hex(cands[i]).substring(0, 16);
    if (hashes.indexOf(h) < 0) hashes.push(h);
  }

  var urls = [];
  hashes.forEach(function(h) {
    VOICES.forEach(function(v) { urls.push({ voice: v, hash: h, url: BASE + v + '/' + h + '.mp3' }); });
  });

  var idx = 0;
  function next() {
    if (idx >= urls.length) { $done({}); return; }
    var item = urls[idx++];
    $httpClient.head({ url: item.url }, function(err, resp, data) {
      if (!err && resp && resp.statusCode === 200) {
        var fake = { hash: item.hash, url: item.url, coins: 0 };
        $done({
          response: {
            status: 201,
            statusCode: 201,
            headers: { 'content-type': 'application/json; charset=utf-8' },
            body: JSON.stringify(fake)
          }
        });
      } else {
        next();
      }
    });
  }
  next();
} catch (e) {
  $done({});
}
