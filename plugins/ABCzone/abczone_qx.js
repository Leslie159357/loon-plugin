// 英语天天练 - ABCzone VIP/SVIP 全解锁
// Quantumult X / Loon 通用脚本
// 基于实际抓包数据: app.chuangjing.com (Flutter API)
// 
// 抓包确认的 VIP 接口:
//   POST /abc-api/v3/study-level/get-my-level        → is_vip/is_svip (Bool)
//   POST /abc-api/v3/book/get-user-level-list         → vip_status (Int: 0=免费, 2=Pro)
//   POST /abc-api/v3/hello/get-level-list              → vip_status/svip_status (Int)
//   POST /abc-api/v3/pay/order-confirm                 → has_bought/is_svip 
//   POST /abc-api/v3/book-article/get-article-data     → is_vip (Bool)
//   POST /abc-api/v3/fox-activity/detail               → is_svip (Bool)

const url = $request.url;
const isResponse = typeof $response !== 'undefined';

const FUTURE_TIMESTAMP = 4102444799000;

if (isResponse) {
  let body = $response.body;

  if (typeof body === 'string' && body.length > 0) {
    try {
      let obj = JSON.parse(body);
      let modified = false;

      // ===== 递归修改所有VIP字段 =====
      function deepModify(obj, path) {
        if (!obj || typeof obj !== 'object') return false;
        let changed = false;

        for (let key in obj) {
          const val = obj[key];
          const lowerKey = key.toLowerCase();
          const currentPath = path ? path + '.' + key : key;

          // === Bool类型VIP标记 ===
          if (lowerKey === 'isvip' || lowerKey === 'is_vip' ||
              lowerKey === 'issvip' || lowerKey === 'is_svip' ||
              lowerKey === 'issvvip' || lowerKey === 'is_svvip' ||
              lowerKey === 'ispremium' || lowerKey === 'premium' ||
              lowerKey === 'issubscribe' || lowerKey === 'is_subscribe' ||
              lowerKey === 'ismember' || lowerKey === 'is_member' ||
              lowerKey === 'issvipmember' || lowerKey === 'is_svip_member' ||
              lowerKey === 'ismembership' || lowerKey === 'is_membership' ||
              lowerKey === 'haspurchased' || lowerKey === 'has_purchased' ||
              lowerKey === 'haspayed' || lowerKey === 'has_payed' ||
              lowerKey === 'canread' || lowerKey === 'can_read' ||
              lowerKey === 'isentitled' || lowerKey === 'is_entitled' ||
              lowerKey === 'isunlocked' || lowerKey === 'is_unlocked') {
            if (val === false) {
              obj[key] = true;
              changed = true;
            }
          }

          // === Int状态类VIP标记 ===
          if (lowerKey === 'vipstatus' || lowerKey === 'vip_status' ||
              lowerKey === 'svipstatus' || lowerKey === 'svip_status' ||
              lowerKey === 'membertype' || lowerKey === 'member_type' ||
              lowerKey === 'membershiptype' || lowerKey === 'membership_type' ||
              lowerKey === 'usertype' || lowerKey === 'user_type' ||
              lowerKey === 'viptype' || lowerKey === 'vip_type' ||
              lowerKey === 'viplevel' || lowerKey === 'vip_level' ||
              lowerKey === 'subscriberlevel' || lowerKey === 'subscriber_level') {
            // vip_status: 0=免费 → 2=Pro/SVIP, svip_status: 0 → 1
            if (val === 0 || val === '0') {
              obj[key] = 2;
              changed = true;
            } else if (val === 2) {
              // 已经是Pro(2)，保持
            }
          }

          // === has_bought (是否购买过) ===
          if (lowerKey === 'hasbought' || lowerKey === 'has_bought') {
            if (val === false || val === 0) {
              obj[key] = true;
              changed = true;
            }
          }

          // === is_discount 商品折扣 ===
          if (lowerKey === 'is_discount') {
            // 标记为折扣商品（隐藏价格敏感信息）
          }

          // === 过期时间 ===
          if (lowerKey === 'vipexpire' || lowerKey === 'vip_expire' ||
              lowerKey === 'vipexpiration' || lowerKey === 'vip_expiration' ||
              lowerKey === 'expiretime' || lowerKey === 'expire_time' ||
              lowerKey === 'expirationtime' || lowerKey === 'expiration_time' ||
              lowerKey === 'expirydate' || lowerKey === 'expiry_date' ||
              lowerKey === 'expiredate' || lowerKey === 'expire_date' ||
              lowerKey === 'endtime' || lowerKey === 'end_time') {
            if (val === null || val === 0 || val === '0' || val === '' ||
                (typeof val === 'number' && val > 0 && val < 100000000000)) {
              obj[key] = FUTURE_TIMESTAMP;
              changed = true;
            }
          }

          // === 会员过期日期字符串 ===
          if (lowerKey === 'vipexpiredate' || lowerKey === 'vip_expire_date' ||
              lowerKey === 'membershipenddate' || lowerKey === 'membership_end_date' ||
              lowerKey === 'enddate' || lowerKey === 'end_date') {
            if (typeof val === 'string' && (val === '' || val === null || val.indexOf('197') === 0 || val.indexOf('200') === 0 || val.indexOf('202') === 0)) {
              obj[key] = "2099-12-31T23:59:59Z";
              changed = true;
            }
          }

          // === 商品价格置零（隐藏购买入口） ===
          if (lowerKey === 'goodssprice' || lowerKey === 'goods_price' ||
              lowerKey === 'price' || lowerKey === 'amount') {
            // 保留原价供参考，不做修改
          }

          // === 锁定/需要VIP ===
          if (lowerKey === 'islock' || lowerKey === 'is_lock' ||
              lowerKey === 'locked' || lowerKey === 'islocked' || lowerKey === 'is_locked' ||
              lowerKey === 'needvip' || lowerKey === 'need_vip' ||
              lowerKey === 'requiresvip' || lowerKey === 'requires_vip') {
            if (val === true || val === 1 || val === 'true' || val === '1') {
              obj[key] = false;
              changed = true;
            }
          }

          // === 配额/限制 ===
          if (lowerKey === 'cheese' || lowerKey === 'coins' || lowerKey === 'coin' ||
              lowerKey === 'gold' || lowerKey === 'gems' || lowerKey === 'diamond' ||
              lowerKey === 'score' || lowerKey === 'points' || lowerKey === 'stones' ||
              lowerKey === 'energy' || lowerKey === 'power' ||
              lowerKey === 'balance' || lowerKey === 'credit') {
            if (typeof val === 'number' && val >= 0 && val < 999999) {
              obj[key] = 999999;
              changed = true;
            }
          }

          // === 每日限制 ===
          if (lowerKey === 'daynewlimit' || lowerKey === 'day_new_limit' ||
              lowerKey === 'dailynewlimit' || lowerKey === 'daily_new_limit' ||
              lowerKey === 'dayreviewlimit' || lowerKey === 'day_review_limit' ||
              lowerKey === 'dailyreviewlimit' || lowerKey === 'daily_review_limit' ||
              lowerKey === 'freelimit' || lowerKey === 'free_limit' ||
              lowerKey === 'maxfreelesson' || lowerKey === 'max_free_lesson' ||
              lowerKey === 'dailylimit' || lowerKey === 'daily_limit' ||
              lowerKey === 'remainingquota' || lowerKey === 'remaining_quota' ||
              lowerKey === 'vocablimit' || lowerKey === 'vocab_limit') {
            if (typeof val === 'number' && val < 99999) {
              obj[key] = 99999;
              changed = true;
            }
          }

          // === VIP按钮/引导 ===
          if (lowerKey === 'vipbutton' || lowerKey === 'vip_button' ||
              lowerKey === 'vipschemaurl' || lowerKey === 'vip_schema_url' ||
              lowerKey === 'vipscheme' || lowerKey === 'vip_scheme' ||
              lowerKey === 'vipschema' || lowerKey === 'vip_schema') {
            // 保留但可以改为空或隐藏
          }

          // === 递归处理子对象 ===
          if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            if (deepModify(val, currentPath)) {
              changed = true;
            }
          }

          // === 递归处理子数组 ===
          if (Array.isArray(val)) {
            for (var i = 0; i < val.length; i++) {
              if (typeof val[i] === 'object' && val[i] !== null) {
                if (deepModify(val[i], currentPath + '[' + i + ']')) {
                  changed = true;
                }
              }
            }
          }
        }
        return changed;
      }

      modified = deepModify(obj, '');

      // ===== 特殊处理: pay/order-confirm =====
      // 将 has_bought 改为 true 并标记所有商品已购
      if (obj && obj.data && typeof obj.data === 'object') {
        // has_bought
        if (obj.data.has_bought !== undefined && obj.data.has_bought !== true) {
          obj.data.has_bought = true;
          modified = true;
        }
        // 商品列表 - 隐藏购买
        if (obj.data.goods_list && Array.isArray(obj.data.goods_list)) {
          // 商品列表保留但标记已购
        }
      }

      if (modified) {
        $done({ body: JSON.stringify(obj) });
        return;
      }
    } catch (e) {
      // JSON parse 失败
    }
  }
}

$done({});
