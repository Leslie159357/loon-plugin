// Doka Pro Unlock - Quantumult X
// 精准拦截 www.yindoka.com 的三个 VIP 接口
// 
// 抓包确认的响应格式:
//   /apple/vip-detail: {"code":0,"data":{"is_vip":false,"vip_type":"free_user","expire_time":"","remaining_count":5}}
//   /apple/check-subscription-status: {"code":0,"data":{"is_vip":false,"status":"free_user","expires_date":"0001-01-01T00:00:00Z"}}
//   /apple/validate-receipt: {"code":-80001}

var url = $request.url;
var body = $response.body;

if (!body) {
    $done({});
    return;
}

var obj = JSON.parse(body);

if (!obj.data) {
    $done({});
    return;
}

// ===== /apple/vip-detail =====
if (url.indexOf('/apple/vip-detail') >= 0) {
    obj.data.is_vip = true;
    obj.data.vip_type = 'pro';
    obj.data.expire_time = '2099-12-31T23:59:59Z';
    obj.data.remaining_count = 999999;
    obj.data.remaining_compose_count = 999999;
    obj.data.remaining_filter_count = 999999;
    $done({body: JSON.stringify(obj)});
    return;
}

// ===== /apple/check-subscription-status =====
if (url.indexOf('/apple/check-subscription-status') >= 0) {
    obj.data.is_vip = true;
    obj.data.status = 'active';
    obj.data.expires_date = '2099-12-31T23:59:59Z';
    obj.data.product_id = 'com.ydgn.dokacamera.year.beimei';
    obj.data.auto_renew_status = true;
    obj.data.is_trial_period = false;
    obj.data.environment = 'Production';
    $done({body: JSON.stringify(obj)});
    return;
}

// ===== /apple/validate-receipt =====
if (url.indexOf('/apple/validate-receipt') >= 0) {
    var fake = {
        "code": 0,
        "message": "succ",
        "data": {
            "is_vip": true,
            "vip_type": "pro",
            "expire_time": "2099-12-31T23:59:59Z",
            "status": "active",
            "product_id": "com.ydgn.dokacamera.year.beimei",
            "auto_renew_status": true,
            "is_trial_period": false,
            "environment": "Production"
        }
    };
    $done({body: JSON.stringify(fake)});
    return;
}

$done({});
