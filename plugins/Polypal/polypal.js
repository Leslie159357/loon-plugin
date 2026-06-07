// ==UserScript==
// @name         Polypal VIP Unlock
// @version      1.0.0
// @description  解锁Polypal（Timekettle Live Translator）VIP会员 - 无限时长 + 高级功能
// @author       Minis
// @license      MIT
// ==/UserScript==

var url = $request.url;
var body = $response.body;

// ========== 1. 用户订阅计划 ==========
// GET /livetranslator/app/benefit/user_plan/current
// 返回 data: {} 表示非会员 → 改为年度会员
if (url.indexOf('/livetranslator/app/benefit/user_plan/current') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.code === 0 && obj.data) {
        // 只有 data 为空对象时才修改（非会员）
        // 设置年度会员，过期时间 2099 年
        obj.data = {
          "benefit_type": 3,
          "benefit_name": "连续包年",
          "expire_time": "2099-12-31 23:59:59",
          "expire_time_ms": 4099766399000,
          "is_continuous": true,
          "is_online": true,
          "plan_name": "连续包年",
          "purchase_channel": {
            "apple_id": "co.livetranslator.yearly.subscription"
          },
          "used_total_duration_minute": 999999,
          "used_effective_duration": 99,
          "used_effective_duration_unit": "year"
        };
      }
      $done({body: JSON.stringify(obj)});
    } catch (e) {
      $done({});
    }
  } else {
    $done({});
  }
  return;
}

// ========== 2. 剩余时长 ==========
// GET /livetranslator/app/user/duration/remain
// remain: 0 → 改为 999999 分钟
if (url.indexOf('/livetranslator/app/user/duration/remain') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.code === 0 && obj.data) {
        obj.data.remain = 999999;
      }
      $done({body: JSON.stringify(obj)});
    } catch (e) {
      $done({});
    }
  } else {
    $done({});
  }
  return;
}

// ========== 3. 图片翻译权益 ==========
// GET /polypal-ai/app/image/benefit
// 保 ok: true
if (url.indexOf('/polypal-ai/app/image/benefit') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.code === 0 && obj.data) {
        // 确保无限使用
        obj.data.ok = true;
        obj.data.remain_count = 99999;
        obj.data.total_count = 99999;
      }
      $done({body: JSON.stringify(obj)});
    } catch (e) {
      $done({});
    }
  } else {
    $done({});
  }
  return;
}

// ========== 4. 存储空间（增强） ==========
// GET /livetranslator/app/document/si/recording/storage
// 改为无限存储
if (url.indexOf('/livetranslator/app/document/si/recording/storage') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.code === 0 && obj.data) {
        obj.data.used_storage = "0.0";
        obj.data.total_storage = "99999.0";
        obj.data.available = true;
      }
      $done({body: JSON.stringify(obj)});
    } catch (e) {
      $done({});
    }
  } else {
    $done({});
  }
  return;
}

$done({});
