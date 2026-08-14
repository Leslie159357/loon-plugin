// Pollykann 会员解锁 v3.0 (2026-08-15)
// 抓包确认的判定链:
//   /account/sign 返回 PlkAccountInfo (含 pollykannVipState/vipType/vipEndTimestamp 等可选字段)
//   -> 客户端解码 -> 写入 UserDefaults["pollykannVipExpireDate"] (NSDate)
//   -> vipAvailable 读日期 > now 即会员
// 免费用户响应里 VIP 字段缺失(nil) -> 脚本必须【新增】字段, 不能只改写已有字段
// v3 修改: /account/sign 强制注入 vipEndTimestamp=2099 + pollykannVipState=1 + vipType=5
//          /home 同样强制注入; 其他 JSON 递归改写已有 vip 字段

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

// 强制注入 VIP 字段 (针对用户信息类响应, 免费用户缺这些字段)
function injectVip(obj) {
    if (!obj) return;
    var d = obj.data || obj;
    d.pollykannVipState = 1;
    d.vipType = 5;
    d.vipStartTimestamp = 0;
    d.vipEndTimestamp = 4070908800;       // 2099-01-01 epoch 秒
    d.vipExpireDate = '2099-12-31 23:59:59';
    d.isVip = 1;
}

var url = $request.url;

if ($response && $response.body) {
    var body = $response.body;
    // AES 加密接口: 透传诊断
    if (url.indexOf('/account/stream') !== -1 || url.indexOf('/appConfig/stream') !== -1) {
        console.log('Pollykann: encrypted stream, len=' + body.length);
        $done({});
        return;
    }
    var obj = null;
    try { obj = JSON.parse(body); } catch (e) { $done({}); return; }

    // 1. /account/sign 用户信息: 强制注入 VIP 字段 (判定数据源!)
    if (url.indexOf('/account/sign') !== -1) {
        console.log('Pollykann: account/sign injected vip fields');
        injectVip(obj);
        $done({ body: JSON.stringify(obj) });
        return;
    }
    // 2. /home 首页: 注入 VIP 字段
    if (url.indexOf('/home') !== -1) {
        console.log('Pollykann: home injected');
        injectVip(obj);
        walk(obj);
        $done({ body: JSON.stringify(obj) });
        return;
    }
    // 3. LeanCloud users/me: 注入 VIP 字段 (双保险)
    if (url.indexOf('/1.1/users/me') !== -1) {
        console.log('Pollykann: users/me injected');
        injectVip(obj);
        $done({ body: JSON.stringify(obj) });
        return;
    }
    // 4. /vip/productList 商品列表
    if (url.indexOf('/vip/productList') !== -1) {
        console.log('Pollykann: productList');
        walk(obj);
        if (obj.data && obj.data.length) {
            for (var i = 0; i < obj.data.length; i++) {
                if (obj.data[i]) obj.data[i].isOpenBuy = false;
            }
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }
    // 5. 其他 JSON: 递归改写已有 vip 字段
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
