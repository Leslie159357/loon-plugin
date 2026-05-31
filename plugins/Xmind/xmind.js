var body = $response.body;
var url = $request.url;
var method = $request.method;

if (!body) {
  $done({});
  return;
}

try {
  var obj = JSON.parse(body);

  // 1. POST _res/devices — 设备许可
  if (url.indexOf('/_res/devices') !== -1) {
    if (obj.license) {
      obj.license.status = 'Subscribed';
      obj.license.expireTime = 4099680000;
    }
    console.log('[Xmind] _res/devices -> license: Subscribed');
  }

  // 2. GET _res/user_sub_details — 订阅详情
  if (url.indexOf('/_res/user_sub_details') !== -1) {
    obj._code = 200;
    obj.google = [];
    obj.appstore = [{
      'product_id': 'net.xmind.brownieapp.yearly',
      'expires_date': '2099-12-31T23:59:59Z',
      'purchase_date': '2026-05-31T15:00:00Z',
      'is_trial_period': false
    }];
    obj.official_website = [];
    console.log('[Xmind] _res/user_sub_details -> injected subscription');
  }

  // 3. POST _api/appstore/active — 订阅验证
  if (url.indexOf('/_api/appstore/active') !== -1) {
    obj.status = 'subscribed';
    obj.subscriptionStatus = 'ACTIVE';
    obj.expireTime = 4099680000;
    obj.bindXmind = 1;
    console.log('[Xmind] _api/appstore/active -> subscribed');
  }

  // 4. POST app.xmind.cn profile-by-id — 团队Pro计划
  if (url.indexOf('app.xmind.cn') !== -1 && url.indexOf('profile-by-id') !== -1) {
    if (obj.profile) {
      obj.profile.plan = 'pro';
      obj.profile.status = 'active';
      obj.profile.expiredAt = '2099-12-31T23:59:59Z';
      obj.profile.credits = [{
        'type': 'pro',
        'total': 99999,
        'remainder': 99999
      }];
      obj.profile.isAiDisabled = false;
    }
    if (obj.credit) {
      obj.credit.sheetLimit = 99999;
    }
    console.log('[Xmind] profile-by-id -> plan: pro, sheetLimit: 99999');
  }

  $done({body: JSON.stringify(obj)});

} catch(e) {
  console.log('[Xmind] Error: ' + e.message);
  $done({});
}
