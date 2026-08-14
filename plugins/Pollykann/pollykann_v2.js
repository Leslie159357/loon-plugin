// Pollykann 会员解锁 v2.0 (2026-08-14)
// 逆向确认的判定链:
//   checkIsVipMemberWith: → IAPService.vipAvailable → UserDefaults["pollykannVipExpireDate"] (NSDate)
//   UserDefaults 值由服务器同步写入 (VIP 数据源 = account/stream, AES 加密)
// 策略:
//   1. /home 等明文接口: 注入全套 VIP 字段 (vipEndTimestamp/vipExpireDate/vipState/isVip)
//   2. account/stream + appConfig/stream: AES 加密, 透传 + 打印加密体供分析
//   3. 递归改写: 任何 JSON 响应中的 vip 时间/状态字段统一改为 2099/1
// 注意: 配合 pollykann_identity.js (http-request 强制 Accept-Encoding: identity, 防 gzip)

// ====== 递归伪造 vip 字段 ======
var TARGET_KEYS = {
    'vipendtimestamp': 4070908800,      // 2099-01-01 epoch 秒
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

var url = $request.url;
var isStream = url.indexOf('/account/stream') !== -1 || url.indexOf('/appConfig/stream') !== -1;

if ($response && $response.body) {
    var body = $response.body;
    // AES 加密接口: 透传, 打印加密体 (base64 长度) 供抓包分析
    if (isStream) {
        console.log('Pollykann: ' + (url.indexOf('/account/stream') !== -1 ? 'account' : 'appConfig') + '/stream encrypted, len=' + body.length + ' head=' + body.substring(0, 32));
        $done({});
        return;
    }
    var obj = null;
    try { obj = JSON.parse(body); } catch (e) { $done({}); return; }

    // 1. /home 首页: 注入 VIP 字段 (响应可能含 data 包裹)
    if (url.indexOf('/home') !== -1) {
        console.log('Pollykann: home intercepted');
        walk(obj);
        var d = obj.data || obj;
        d.isVip = 1;
        d.vipExpireDate = '2099-12-31 23:59:59';
        d.vipEndTimestamp = 4070908800;
        d.vipType = 5;
        $done({ body: JSON.stringify(obj) });
        return;
    }
    // 2. /vip/productList 商品列表: 终身/年费商品标记已购买
    if (url.indexOf('/vip/productList') !== -1) {
        console.log('Pollykann: productList intercepted');
        walk(obj);
        if (obj.data && obj.data.length) {
            for (var i = 0; i < obj.data.length; i++) {
                obj.data[i].isOpenBuy = false;
                if (obj.data[i].id === 19) obj.data[i].isOpenBuy = false;
            }
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }
    // 3. /device/veryDevice 设备验证: 透传 (不伪造, 防副作用)
    if (url.indexOf('/device/veryDevice') !== -1) {
        console.log('Pollykann: device verify passthrough');
        $done({});
        return;
    }
    // 4. 其他 JSON: 递归改写 vip 字段 (广撒网)
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
