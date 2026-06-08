// ==CloakNote==
// 得到大脑 GetNotes VIP 解锁
// Quantumult X 脚本 v1.0
// 拦截 notes-api.biji.com 修改VIP状态
// ==/CloakNote==

const url = $request.url;
let body = $response.body;

if (!body) {
  $done({});
  return;
}

try {
  let obj = JSON.parse(body);

  // 1. VIP状态核心 /ddbrain/vip/info
  if (url.indexOf('/ddbrain/vip/info') !== -1) {
    obj.isVip = true;
    obj.is_vip = true;
    obj.expireTime = 4092599349000;  // 2099-09-09
    obj.expire_time = 4092599349000;
    obj.expired = false;
    obj.is_expire = false;
    obj.vipType = 'premium';
    obj.vip_type = 'premium';
    obj.is_vip_card_received = true;
    obj.is_vip_tip_closed = true;
    console.log('GetNotes: /ddbrain/vip/info -> VIP unlocked');
  }

  // 2. 用户VIP卡信息 /shop/mind/app/v1/vipcards/user
  if (url.indexOf('/shop/mind/app/v1/vipcards/user') !== -1) {
    if (obj.data) {
      obj.data.isVip = true;
      obj.data.expireTime = 4092599349000;
      obj.data.vipType = 'premium';
      obj.data.is_vip_card_received = true;
    } else {
      obj.isVip = true;
      obj.expireTime = 4092599349000;
      obj.vipType = 'premium';
    }
    console.log('GetNotes: /vipcards/user -> VIP unlocked');
  }

  // 3. 内购收据验证 /shop/mind/app/v1/vipcards/iap/validate_receipt
  if (url.indexOf('/vipcards/iap/validate_receipt') !== -1) {
    obj.code = 0;
    obj.success = true;
    obj.msg = 'success';
    if (obj.data) {
      obj.data.isVip = true;
      obj.data.expireTime = 4092599349000;
    }
    console.log('GetNotes: /validate_receipt -> success');
  }

  // 4. 创建内购订单 /shop/mind/app/v1/vipcards/iap/create_order
  if (url.indexOf('/vipcards/iap/create_order') !== -1) {
    obj.code = 0;
    obj.success = true;
    obj.msg = 'success';
    console.log('GetNotes: /create_order -> success');
  }

  // 5. 购买 /shop/mind/app/v1/vipcards/purchase
  if (url.indexOf('/vipcards/purchase') !== -1) {
    obj.code = 0;
    obj.success = true;
    obj.msg = 'success';
    console.log('GetNotes: /purchase -> success');
  }

  // 6. 轮询 /shop/mind/app/v1/vipcards/polling
  if (url.indexOf('/vipcards/polling') !== -1) {
    if (obj.data) {
      obj.data.isVip = true;
      obj.data.expireTime = 4092599349000;
    }
    console.log('GetNotes: /polling -> VIP unlocked');
  }

  // 7. AI输入限制 /yoda/mind/app/v1/chats/llm_input_restrict
  if (url.indexOf('/chats/llm_input_restrict') !== -1) {
    if (obj.data) {
      obj.data.restricted = false;
      obj.data.input_limit = 999999;
      obj.data.daily_limit = 999999;
    } else {
      obj.restricted = false;
    }
    console.log('GetNotes: /llm_input_restrict -> removed');
  }

  // 8. 活动检查 /shop/mind/app/v1/activity/education_2025/prize/check
  if (url.indexOf('/activity/education_2025/prize/check') !== -1) {
    if (obj.data) {
      obj.data.canClaim = true;
      obj.data.claimed = false;
    }
    console.log('GetNotes: /prize/check -> can claim');
  }

  $done({body: JSON.stringify(obj)});

} catch(e) {
  console.log('GetNotes script error: ' + e.message);
  $done({});
}
