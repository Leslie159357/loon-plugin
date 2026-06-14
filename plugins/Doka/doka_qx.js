// ==Quantumult X==
// @name         Doka Pro Unlock
// @description  解锁 Doka Pro VIP + AI 构图无限使用
// @version      1.2
// @author       Minis
// ==/Quantumult X==

var url = $request.url;
var body = $response.body;

if (!body) {
  $done({});
  return;
}

try {

// ===== vip-detail：修改 VIP 状态 =====
if (url.indexOf('/apple/vip-detail') >= 0) {
  var obj = JSON.parse(body);
  if (obj && obj.data) {
    obj.data.is_vip = true;
    obj.data.vip_type = 'pro';
    obj.data.expire_time = '2099-12-31T23:59:59Z';
    obj.data.remaining_count = 999999;
    obj.data.remaining_compose_count = 999999;
    obj.data.remaining_filter_count = 999999;
  }
  $done({body: JSON.stringify(obj)});
  return;
}

// ===== check-subscription-status =====
if (url.indexOf('/apple/check-subscription-status') >= 0) {
  var obj = JSON.parse(body);
  if (obj && obj.data) {
    obj.data.is_vip = true;
    obj.data.status = 'active';
    obj.data.expires_date = '2099-12-31T23:59:59Z';
    obj.data.product_id = 'com.ydgn.dokacamera.year.beimei';
    obj.data.auto_renew_status = true;
    obj.data.is_trial_period = false;
    obj.data.environment = 'Production';
  }
  $done({body: JSON.stringify(obj)});
  return;
}

// ===== validate-receipt =====
if (url.indexOf('/apple/validate-receipt') >= 0) {
  var obj = JSON.parse(body);
  if (obj && obj.code && obj.code !== 0) {
    var fake = {
      code: 0,
      message: 'succ',
      data: {
        is_vip: true,
        vip_type: 'pro',
        expire_time: '2099-12-31T23:59:59Z',
        status: 'active',
        product_id: 'com.ydgn.dokacamera.year.beimei',
        auto_renew_status: true,
        is_trial_period: false,
        environment: 'Production'
      }
    };
    $done({body: JSON.stringify(fake)});
    return;
  }
  $done({});
  return;
}

// ===== ai_camera/v2：AI 构图拦截 =====
if (url.indexOf('/ai_camera/v2') >= 0) {
  var obj = JSON.parse(body);
  // 只有次数用完时才处理（code不为0）
  if (obj && obj.code && obj.code !== 0) {
    // 只改 code 和 message，完全保留 data 结构不变
    // 这样 App 不会因为缺字段崩溃
    obj.code = 0;
    obj.message = 'succ';
    if (!obj.data) {
      obj.data = {};
    }
    $done({body: JSON.stringify(obj)});
    return;
  }
  // 本来就能用的直接放行
  $done({});
  return;
}

} catch(e) {
  // 出错不干扰
}

$done({});
