// Pollykann 会员解锁 v4.0 (2026-08-15)
// v3 结论: 注入字段成功但未解锁 -> 嫌疑 = x-plk-api-signature 响应签名校验
//   (客户端 0x1000cd700 区域: 对响应体计算签名与响应头比较, 不匹配丢弃)
// v4 修改: /account/sign 注入 VIP 字段 + 删除 x-plk-api-signature 响应头
//   (若客户端"无签名头=跳过校验"则注入生效; 若崩溃则回滚)

var TARGET_KEYS = {
    'vipendtimestamp': 4070908800,
    'vip_end_timestamp': 4070908800,
    'vipexpiredate': 4070908800,
    'vip_expire_date': 4070908800,
    'vipstarttimestamp': 0,
    'vip_start_timestamp': 0,
    'pollykannvipstate': 1,
    'pollykann_vip_state': 1,
    'tingleevipstate': 1,
    'chinleevipstate': 1,
    'jpnvipstate': 1,
    'vipstate': 1,
    'vip_state': 1,
    'viptype': 5,
    'vip_type': 5,
    'isvip': 1,
    'is_vip': 1,
    'ispremium': 1,
    'is_premium': 1,
    'is_pro_feature_enabled': 1,
};

function walk(obj) {
    if (!obj) return;
    if (Array.isArray(obj)) { for (var i = 0; i < obj.length; i++) walk(obj[i]); return; }
    if (typeof obj === 'object') {
        for (var k in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
            var kl = k.toLowerCase().replace(/-/g, '_');
            if (TARGET_KEYS[kl] !== undefined) {
                obj[k] = TARGET_KEYS[kl];
            } else if ((kl.indexOf('vipend') !== -1 || kl.indexOf('expire') !== -1) &&
                       (kl.indexOf('vip') !== -1 || kl.indexOf('pro') !== -1)) {
                obj[k] = 4070908800;
            } else if ((kl.indexOf('vip') !== -1 || kl.indexOf('pro') !== -1) &&
                       (kl.indexOf('state') !== -1 || kl.indexOf('status') !== -1 || kl.indexOf('active') !== -1)) {
                obj[k] = 1;
            } else {
                walk(obj[k]);
            }
        }
    }
}

function injectVip(obj) {
    if (!obj) return;
    var d = obj.data || obj;
    d.pollykannVipState = 1;
    d.vipType = 5;
    d.vipStartTimestamp = 0;
    d.vipEndTimestamp = 4070908800;
    d.vipExpireDate = '2099-12-31 23:59:59';
    d.isVip = 1;
}

// 删除响应签名头 (尝试绕过校验)
function stripSigHeaders(headers) {
    if (!headers) return headers;
    var out = {};
    for (var k in headers) {
        if (!Object.prototype.hasOwnProperty.call(headers, k)) continue;
        var kl = k.toLowerCase();
        if (kl === 'x-plk-api-signature' || kl === 'plk-api-signature') {
            continue;
        }
        out[k] = headers[k];
    }
    return out;
}

var url = $request.url;

if ($response && $response.body) {
    var body = $response.body;
    if (url.indexOf('/account/stream') !== -1 || url.indexOf('/appConfig/stream') !== -1) {
        console.log('Pollykann: encrypted stream, len=' + body.length);
        $done({});
        return;
    }
    var obj = null;
    try { obj = JSON.parse(body); } catch (e) { $done({}); return; }

    if (url.indexOf('/account/sign') !== -1) {
        console.log('Pollykann: account/sign injected + sig stripped');
        injectVip(obj);
        $done({ body: JSON.stringify(obj), headers: stripSigHeaders($response.headers) });
        return;
    }
    if (url.indexOf('/home') !== -1) {
        console.log('Pollykann: home injected');
        injectVip(obj);
        walk(obj);
        $done({ body: JSON.stringify(obj) });
        return;
    }
    if (url.indexOf('/1.1/users/me') !== -1) {
        console.log('Pollykann: users/me injected');
        injectVip(obj);
        $done({ body: JSON.stringify(obj) });
        return;
    }
    if (url.indexOf('/vip/productList') !== -1) {
        walk(obj);
        if (obj.data && obj.data.length) {
            for (var i = 0; i < obj.data.length; i++) {
                if (obj.data[i]) obj.data[i].isOpenBuy = false;
            }
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }
    walk(obj);
    var newBody = JSON.stringify(obj);
    if (newBody !== body) {
        $done({ body: newBody });
    } else {
        $done({});
    }
} else {
    $done({});
}
