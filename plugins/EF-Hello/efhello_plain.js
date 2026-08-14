// EFHello 强制明文响应 (gzip 坑: AWS 类网关对 gzip 请求返回压缩体, 脚本读不到)
// 用途: http-request 阶段改写请求头
var url = $request.url;
if (url.indexOf('v2.api.hello.ef') >= 0) {
  $done({
    headers: Object.assign({}, $request.headers, {
      'Accept-Encoding': 'identity'
    })
  });
} else {
  $done({});
}
