// 墨墨记忆卡 专业版解锁 v3.0 (maimemostatus.com 适配)
// Loon / Surge 通用
// 5.9.00 版 API 迁移到 maimemostatus.com，旧插件 www.markji.com 失效
// 拦截 /api/v2/system/check（会员判定核心）+ /api/v1/users/profile（用户资料兜底）

var url = $request.url;
var method = $request.method;

// ====== /api/v2/system/check - VIP 核心接口 ======
if (url.indexOf('/api/v2/system/check') !== -1) {
  if ($response && $response.body) {
    try {
      var obj = JSON.parse($response.body);
      if (obj && obj.data) {
        // 专业版解锁
        obj.data.plus_info = {
          "is_plus": true,
          "plus_expires_time": "2099-12-31T23:59:59.000Z",
          "is_lifetime": true
        };

        // 已付费标记
        obj.data.has_paid = true;

        // 学习限制解除
        obj.data.study_limit_info = {
          "day_new_limit": 9999,
          "day_review_limit": 99999,
          "new_affected_by_review_limit": false
        };
        obj.data.day_study_limit = 9999;
        obj.data.today_study_limit = 9999;
        obj.data.day_new_limit = 9999;
        obj.data.day_review_limit = 99999;
        obj.data.today_new_limit = 9999;
        obj.data.today_review_limit = 99999;
        obj.data.new_affected_by_review_limit = false;

        // 牌组配额 / 记忆币
        if (obj.data.study_info) {
          obj.data.study_info.private_deck_quota = 99999;
          obj.data.study_info.public_deck_quota = 99999;
          obj.data.study_info.replenish_card_count = 999;
          obj.data.study_info.available_mark = 999999;
          obj.data.study_info.free_mark = 999999;
          obj.data.study_info.paid_mark = 999999;
        }

        // 卡片定价
        obj.data.card_price_enabled = true;
        obj.data.card_price_min_limit = 0;
        obj.data.card_price_max_limit = 999;
        obj.data.card_price_study_users_limit = 99999;

        // 其他限制
        obj.data.is_deck_max_limit_reached = false;
        obj.data.storekit2_iap_disabled = false;

        $done({body: JSON.stringify(obj)});
        return;
      }
    } catch(e) {
      console.log('Markji check script error: ' + e);
    }
  }
}

// ====== /api/v1/users/profile - 用户资料兜底 ======
if (url.indexOf('/api/v1/users/profile') !== -1) {
  if ($response && $response.body) {
    try {
      var obj = JSON.parse($response.body);
      if (obj && obj.data) {
        obj.data.is_plus = true;
        obj.data.is_lifetime = true;
        obj.data.plus_expires_time = "2099-12-31T23:59:59.000Z";
        obj.data.has_paid = true;
        obj.data.paid_mark = 1;
        obj.data.free_mark = 0;
        $done({body: JSON.stringify(obj)});
        return;
      }
    } catch(e) {
      console.log('Markji profile script error: ' + e);
    }
  }
}

$done({});
