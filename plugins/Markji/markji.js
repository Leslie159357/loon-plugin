// 墨墨记忆卡 专业版解锁 v1.0
// Surge / Loon 通用版本
// 拦截 www.markji.com 的 /api/v2/system/check 接口
// 修改响应 - 解锁专业版所有功能

var url = $request.url;
var method = $request.method;

if (url.indexOf('/api/v2/system/check') !== -1) {
  if (method === 'POST' && $response.body) {
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
        
        // 牌组配额
        obj.data.study_info.private_deck_quota = 99999;
        obj.data.study_info.public_deck_quota = 99999;
        obj.data.study_info.replenish_card_count = 999;
        obj.data.study_info.available_mark = 999999;
        obj.data.study_info.free_mark = 999999;
        obj.data.study_info.paid_mark = 999999;
        
        // 卡片定价
        obj.data.card_price_enabled = true;
        obj.data.card_price_min_limit = 0;
        obj.data.card_price_max_limit = 999;
        obj.data.card_price_study_users_limit = 99999;
        
        // 其他限制
        obj.data.is_deck_max_limit_reached = false;
        
        $done({body: JSON.stringify(obj)});
      }
    } catch(e) {
      console.log('Markji script error: ' + e);
    }
  }
}

$done({});
