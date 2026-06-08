// Pollykann 会员解锁 v1.0
// Quantumult X 版本
// 拦截 api.pollykann.com 接口
// 注意: account/stream 和 appConfig/stream 为AES加密
// 本地UserDefaults: pollykannVipState, pollykannVipExpireDate, isVip

var url = $request.url;
var method = $request.method;

// ====== 响应拦截 ======
if ($response && $response.body) {
    var body = $response.body;
    var obj = null;
    try { obj = JSON.parse(body); } catch(e) {}
    
    // 1. /home - 首页
    if (url.indexOf('/home') !== -1 && obj && obj.data) {
        console.log('Pollykann: home intercepted');
        obj.data.isVip = 1;
        obj.data.vipExpireDate = '2099-12-31 23:59:59';
        $done({body: JSON.stringify(obj)});
    }
    // 2. /vip/applePay - Apple内购买卖
    else if (url.indexOf('/vip/applePay') !== -1) {
        console.log('Pollykann: applePay intercepted');
        // 伪造购买成功，返回已付状态
        if (obj && obj.data) {
            obj.data.orderNo = 'FAKE_ORDER_' + Date.now();
        }
        $done({body: JSON.stringify(obj)});
    }
    // 3. /vip/productList - 商品列表
    else if (url.indexOf('/vip/productList') !== -1 && obj && obj.data) {
        console.log('Pollykann: product list intercepted');
        for (var i = 0; i < obj.data.length; i++) {
            if (obj.data[i].id === 19) {
                obj.data[i].isOpenBuy = false;
            }
        }
        $done({body: JSON.stringify(obj)});
    }
    // 4. /account/stream - AES加密，透传
    else if (url.indexOf('/account/stream') !== -1) {
        $done({});
    }
    // 5. /appConfig/stream - AES加密，透传
    else if (url.indexOf('/appConfig/stream') !== -1) {
        $done({});
    }
    // 6. /device/veryDevice - 设备验证
    else if (url.indexOf('/device/veryDevice') !== -1 && obj) {
        console.log('Pollykann: device verify intercepted');
        obj.data = 999;
        $done({body: JSON.stringify(obj)});
    }
    // 7. /media - 媒体详情
    else if (url.indexOf('/media') !== -1 && obj && obj.data) {
        $done({});
    }
    else {
        $done({});
    }
}
// ====== 请求拦截（修改请求参数）=====
// 例如将 isVip 参数改为 1
else if ($request && !$response) {
    if (url.indexOf('/home') !== -1) {
        // 修改请求中的 isVip 参数
        var newUrl = url.replace(/isVip=0/g, 'isVip=1');
        $done({url: newUrl});
    } else if (url.indexOf('/vip/applePay') !== -1 && method === 'POST') {
        // 拦截购买请求，直接返回成功
        // 注意: 这里拦截的是请求，可能会影响正常购买流程
        $done({});
    } else {
        $done({});
    }
}
else {
    $done({});
}
