// 墨墨记忆卡 专业版解锁 v3.1 (扣费接口补全)
// Loon / Surge 通用
// 5.9.00 版 API 迁移到 maimemostatus.com，旧插件 www.markji.com 失效
// 覆盖：
//   /api/v2/system/check          - 会员判定核心
//   /api/v1/users/profile         - 用户资料兜底
//   /api/v1/study_data/records/precheck - 学习预检（记忆币扣费判定）
//   /api/v1/study_data/records    - 学习提交（记忆币结算）
//   /api/v1/system/precheck       - 系统预检

var url = $request.url;

function isMatch(p) {
  return url.indexOf(p) !== -1;
}

function doneWith(obj) {
  if (obj && obj.data) {
    $done({body: JSON.stringify(obj)});
    return true;
  }
  return false;
}

// ====== /api/v2/system/check - VIP 核心接口 ======
if (isMatch('/api/v2/system/check') && $response && $response.body) {
  try {
    var obj = JSON.parse($response.body);
    if (doneWith(obj)) {
      var d = obj.data;
      // 专业版解锁
      d.plus_info = {
        "is_plus": true,
        "plus_expires_time": "2099-12-31T23:59:59.000Z",
        "is_lifetime": true
      };
      // 已付费标记
      d.has_paid = true;
      // 学习限制解除
      d.study_limit_info = {
        "day_new_limit": 9999,
        "day_review_limit": 99999,
        "new_affected_by_review_limit": false
      };
      d.day_study_limit = 9999;
      d.today_study_limit = 9999;
      d.day_new_limit = 9999;
      d.day_review_limit = 99999;
      d.today_new_limit = 9999;
      d.today_review_limit = 99999;
      d.new_affected_by_review_limit = false;
      // 牌组配额 / 记忆币
      if (d.study_info) {
        d.study_info.private_deck_quota = 99999;
        d.study_info.public_deck_quota = 99999;
        d.study_info.replenish_card_count = 999;
        d.study_info.available_mark = 999999;
        d.study_info.free_mark = 999999;
        d.study_info.paid_mark = 999999;
      }
      // 卡片定价
      d.card_price_enabled = true;
      d.card_price_min_limit = 0;
      d.card_price_max_limit = 999;
      d.card_price_study_users_limit = 99999;
      d.is_deck_max_limit_reached = false;
      d.storekit2_iap_disabled = false;
      $done({body: JSON.stringify(obj)});
      return;
    }
  } catch(e) {
    console.log('Markji check error: ' + e);
  }
}

// ====== /api/v1/users/profile - 用户资料兜底 ======
if (isMatch('/api/v1/users/profile') && $response && $response.body) {
  try {
    var obj = JSON.parse($response.body);
    if (doneWith(obj)) {
      var d = obj.data;
      d.is_plus = true;
      d.is_lifetime = true;
      d.plus_expires_time = "2099-12-31T23:59:59.000Z";
      d.has_paid = true;
      d.paid_mark = 1;
      d.free_mark = 0;
      if (d.study_info) {
        d.study_info.available_mark = 999999;
        d.study_info.free_mark = 999999;
        d.study_info.paid_mark = 999999;
      }
      $done({body: JSON.stringify(obj)});
      return;
    }
  } catch(e) {
    console.log('Markji profile error: ' + e);
  }
}

// ====== /api/v1/study_data/records/precheck - 学习预检（扣费判定） ======
if (isMatch('/api/v1/study_data/records/precheck') && $response && $response.body) {
  try {
    var obj = JSON.parse($response.body);
    if (doneWith(obj)) {
      var d = obj.data;
      d.needed_mark = 0;
      d.original_consumed_mark = 0;
      d.available_mark = 999999;
      // 防止服务端因记忆币不足拒绝
      d.studydata_insufficient_available_mark = false;
      $done({body: JSON.stringify(obj)});
      return;
    }
  } catch(e) {
    console.log('Markji precheck error: ' + e);
  }
}

// ====== /api/v1/study_data/records - 学习提交（结算） ======
if (isMatch('/api/v1/study_data/records') && !isMatch('/precheck') && $response && $response.body) {
  try {
    var obj = JSON.parse($response.body);
    if (doneWith(obj)) {
      var d = obj.data;
      d.available_mark = 999999;
      if (d.consumed_mark !== undefined) d.consumed_mark = 0;
      if (d.needed_mark !== undefined) d.needed_mark = 0;
      $done({body: JSON.stringify(obj)});
      return;
    }
  } catch(e) {
    console.log('Markji records error: ' + e);
  }
}

// ====== /api/v1/system/precheck - 系统预检 ======
if (isMatch('/api/v1/system/precheck') && $response && $response.body) {
  try {
    var obj = JSON.parse($response.body);
    if (doneWith(obj)) {
      var d = obj.data;
      d.available_mark = 999999;
      d.needed_mark = 0;
      $done({body: JSON.stringify(obj)});
      return;
    }
  } catch(e) {
    console.log('Markji sysprecheck error: ' + e);
  }
}

$done({});
