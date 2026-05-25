// EnglishDaily (ABC Zone) VIP Unlock - v5
// MITM script for Loon - 全面覆盖+拦截所有支付+拦截购买页
// 思路: 让App认为VIP已激活，同时阻止购买页加载

let body = $response.body;
let url = $request.url;

// ===== 拦截购买H5页面 - 重定向回App首页scheme =====
if (url.includes('/verticalmembership') || url.includes('/membership') || url.includes('/buyVIP')) {
  // 重定向回App首页
  $done({
    body: '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><script>window.location.href="xesabczone://xrsApp?m=HomePage";setTimeout(function(){window.close()},500);</script></head><body></body></html>',
    headers: {'Content-Type': 'text/html; charset=utf-8'}
  });
  return;
}

// ===== 拦截所有支付相关API - 全部返回成功 =====
if (url.includes('/abc-api/v3/pay/get-pay-url') || 
    url.includes('/abc-api/v3/pay/order-create') || 
    url.includes('/abc-api/v3/pay/pre-sign') ||
    url.includes('/abc-api/v3/pay/order-stay') ||
    url.includes('/abc-api/v3/pay/coupon-query') ||
    url.includes('/abc-api/v3/pay/has_union_user') ||
    url.includes('/abc-api/v3/pay/get-wx-openid')) {
  $done({body: JSON.stringify({"stat":1,"code":0,"msg":"success"})});
  return;
}

// ===== 拦截 order-confirm 返回VIP已激活 =====
if (url.includes('/abc-api/v3/pay/order-confirm')) {
  $done({body: JSON.stringify({
    "stat": 1, "code": 0, "msg": "success",
    "data": {
      "vip_status": 1, "svip_status": 1, "identity": 1,
      "vip_end_uts": 4102329600000, "svip_end_uts": 4102329600000,
      "goods_list": []
    }
  })});
  return;
}

// ===== 拦截 check_ios_backdoor =====
if (url.includes('/abc-api/v3/pay/check_ios_backdoor')) {
  $done({body: JSON.stringify({
    "stat": 1, "code": 0, "msg": "success",
    "data": {"has_ios_backdoor": true, "black_user": false, "review_version": true}
  })});
  return;
}

// ===== 拦截 remote-control/live-auth (学而思权限验证) =====
if (url.includes('/abc-api/v3/remote-control/live-auth')) {
  $done({body: JSON.stringify({
    "stat": 1, "code": 0, "msg": "success",
    "data": {"is_auth": true, "can_watch": true, "is_vip": true, "is_svip": true}
  })});
  return;
}

if (!body) {
  $done({});
  return;
}

try {
  let obj = JSON.parse(body);
  
  // 1. 用户数据中心
  if (url.includes('/abc-api/v3/ucenter/get-user-data')) {
    if (obj.data) {
      obj.data.is_vip = true;
      obj.data.vip_status = 1;
      obj.data.svip_status = 1;
      obj.data.identity = 1;
      obj.data.cheese_cnt = 999999;
      obj.data.power_cnt = 999;
    }
  }
  
  // 2. 书籍用户数据
  if (url.includes('/abc-api/v3/book/get-user-data')) {
    if (obj.data) {
      obj.data.vip_status = 1;
      obj.data.svip_status = 1;
      obj.data.identity = 1;
    }
  }
  
  // 3. 学习等级
  if (url.includes('/abc-api/v3/study-level/get-my-level')) {
    if (obj.data) {
      obj.data.is_vip = true;
      obj.data.is_svip = true;
      obj.data.vip_status = 1;
      obj.data.svip_status = 1;
      obj.data.identity = 1;
    }
  }
  
  // 4. 单元列表
  if (url.includes('/abc-api/v3/book/get-user-level-list') || url.includes('/abc-api/v3/book/get-level-list/new-v2')) {
    if (obj.data) {
      obj.data.vip_button = false;
      obj.data.vip_status = 1;
      obj.data.trial_show = 0;
      if ('is_vip' in obj.data) obj.data.is_vip = true;
      if ('is_svip' in obj.data) obj.data.is_svip = true;
    }
  }
  
  // 5. 文章模式状态
  if (url.includes('/abc-api/v3/book-article/get-mode-status')) {
    if (obj.data) {
      obj.data.is_vip = true;
      obj.data.vip_status = 1;
      obj.data.svip_status = 1;
    }
  }
  
  // 6. pay/get-user-data (支付VIP数据)
  if (url.includes('/abc-api/v3/pay/get-user-data')) {
    if (obj.data) {
      obj.data.vip_status = 1;
      obj.data.svip_status = 1;
      obj.data.identity = 1;
      obj.data.vip_days = 36500;
      obj.data.vip_end_uts = 4102329600000;
      obj.data.svip_end_uts = 4102329600000;
      obj.data.vip_hidden = true;
      obj.data.order_hidden = true;
      obj.data.review_mode = 1;
    }
  }
  
  // 7. 文章学习数据
  if (url.includes('/abc-api/v3/book-article/get-article-data')) {
    if (obj.data) {
      obj.data.is_vip = true;
    }
  }
  
  // 8. 对话主题列表 (KET/PET)
  if (url.includes('/abc-api/v3/dialogue/get-theme-list')) {
    if (obj.data) {
      obj.data.is_svip = true;
      if (obj.data.dialogue_list && Array.isArray(obj.data.dialogue_list)) {
        obj.data.dialogue_list.forEach(function(item) {
          item.vip_icon_img = '';
          item.status = 1;
          item.is_free = true;
        });
      }
    }
  }
  
  // 9. Hello English外教课程
  if (url.includes('/abc-api/v3/hello/get-level-list')) {
    if (obj.data) {
      obj.data.vip_button = false;
      obj.data.vip_status = 1;
      obj.data.svip_status = 1;
    }
  }
  
  // 10. 剑桥练习列表
  if (url.includes('/abc-api/v3/camb/get-practice-list')) {
    if (obj.data) {
      obj.data.is_svip_member = true;
      if (obj.data.theme_list && Array.isArray(obj.data.theme_list)) {
        obj.data.theme_list.forEach(function(theme) {
          theme.is_free = true;
          theme.is_svip_member = true;
        });
      }
    }
  }
  
  // 10. 教材列表
  if (url.includes('/abc-api/v3/book/get-book-list-v3')) {
    if (obj.data && obj.data.list) {
      if (Array.isArray(obj.data.list)) {
        obj.data.list.forEach(function(level) {
          level.is_vip = true;
          level.vip_status = 1;
          if (level.semester_list) {
            level.semester_list.forEach(function(sem) {
              if (sem.book_list) {
                sem.book_list.forEach(function(book) {
                  book.is_vip = true;
                });
              }
            });
          }
        });
      }
    }
  }
  
  // 11. SVIP扩展课程
  if (url.includes('/abc-api/v3/svip/expansion-course/get-video-list')) {
    if (obj.data) {
      obj.data.is_svip = true;
      if (obj.data.list && Array.isArray(obj.data.list)) {
        obj.data.list.forEach(function(video) {
          video.is_free = true;
        });
      }
    }
  }
  if (url.includes('/abc-api/v3/svip/expansion-course/get-category-list')) {
    if (obj.data && obj.data.list && Array.isArray(obj.data.list)) {
      obj.data.list.forEach(function(cat) {
        cat.is_free = true;
        cat.is_svip = true;
      });
    }
  }
  
  // 12. 知识币
  if (url.includes('/abc-api/v3/user/cheese/get')) {
    if (obj.data) {
      obj.data.cheese = 999999;
    }
  }
  
  // 13. 体力
  if (url.includes('/abc-api/v3/user/power/get')) {
    if (obj.data) {
      obj.data.power = 999;
    }
  }
  if (url.includes('/abc-api/v3/user/power/is-enough')) {
    if (obj.data) {
      obj.data.is_enough = true;
    }
  }
  
  // 14. 学识
  if (url.includes('/abc-api/v3/user/stone/get')) {
    if (obj.data) {
      obj.data.stone = 999999;
    }
  }
  
  // 15. 钻石商城
  if (url.includes('/abc-api/v3/dress/diamond-shop-dress-list')) {
    if (obj.data && obj.data.list && Array.isArray(obj.data.list)) {
      obj.data.list.forEach(function(item) {
        item.is_buy = 1;
      });
    }
  }
  
  // 16. 家长控制
  if (url.includes('/abc-api/v3/parent-control/check-in-control')) {
    if (obj.data) {
      obj.data.study_time = 999999;
      obj.data.can_update_time = true;
      obj.data.control_type = 0;
    }
  }
  
  $done({body: JSON.stringify(obj)});
} catch(e) {
  console.log('Parse error: ' + e);
  $done({});
}
