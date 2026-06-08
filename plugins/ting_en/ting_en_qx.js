// 每日英语听力 (ting_en) VIP解锁脚本 v1.0
// 适用于 Quantumult X / Loon / Surge
// MITM域名: api.eudic.net, cn.eudic.net, api.frdic.com
//
// 使用方法:
//   QX: 添加重写规则 http-response ^https://api\.eudic\.net/api/v5/ting/ requires-body=1,max-size=262144,script-path=ting_en_qx.js
//   Loon: 使用插件 ting_en.plugin
//   Surge: 添加脚本规则

const url = $request.url;
let body = $response.body;

if (typeof body !== 'string' && typeof body !== 'object') {
  $done({ body });
}

try {
  // 尝试解析JSON
  let obj = JSON.parse(typeof body === 'string' ? body : JSON.stringify(body));
  let modified = false;

  // ============================
  // 递归修改所有VIP字段
  // ============================
  function recursiveModifyVIP(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      
      // VIP布尔字段
      if (key === 'isVip' || key === 'isVIP' || key === 'is_vip' || key === 'isvip') {
        if (val === false || val === 0) {
          obj[key] = true;
          modified = true;
        }
      }
      
      // VIP类型
      if (key === 'vipType' || key === 'viptype') {
        if (val === 0 || val === null || val === undefined) {
          obj[key] = 2; // 永久会员
          modified = true;
        }
      }
      
      // tingviptype - 欧路专属
      if (key === 'tingviptype') {
        if (val !== 'forevervip') {
          obj[key] = 'forevervip';
          modified = true;
        }
      }
      
      // isTransVip / istransvip
      if (key === 'isTransVip' || key === 'istransvip' || key === 'is_trans_vip') {
        if (val === false || val === 0) {
          obj[key] = true;
          modified = true;
        }
      }
      
      // VIP过期时间 - 改为2099年
      if (key === 'tingvipendtime' || key === 'vipendtime' || key === 'vipEndTime' || 
          key === 'vip_end_time' || key === 'vipExpireTime' || key === 'vipExpire' ||
          key === 'vip_expire_time' || key === 'vip_expire' || key === 'expireTime' ||
          key === 'transvip_endtime' || key === 'vipEndDate' || key === 'endDate') {
        if (val === null || val === undefined || val === 0 || val === '' || val < 4000000000000) {
          obj[key] = 4092599349000; // 2099-09-09 09:09:09 毫秒时间戳
          modified = true;
        }
      }
      
      // 开头带USER_的字段
      if (key === 'USER_TransVip' || key === 'USER_TransVip_EndTime') {
        if (!val || val < 4000000000000) {
          obj[key] = 4092599349000;
          modified = true;
        }
      }
      
      // 通用布尔字段 - 尝试找到类似权限开关的字段
      if (key === 'premium' || key === 'isPremium' || key === 'hasPremium' ||
          key === 'isPro' || key === 'pro' || key === 'isMember' ||
          key === 'purchased' || key === 'isPurchased' || key === 'buy_status' ||
          key === 'can_read' || key === 'is_activation' || key === 'canAccess' ||
          key === 'hasAccess') {
        if (val === false || val === 0) {
          obj[key] = true;
          modified = true;
        }
      }
      
      // 数字字段 - 无限化
      if (key === 'gold' || key === 'coin' || key === 'score' || key === 'point' || key === 'points') {
        if (typeof val === 'number' && val < 99999) {
          obj[key] = 99999;
          modified = true;
        }
      }
      
      // 每日试用次数
      if (key === 'trialRemaining' || key === 'freeCount' || key === 'dailyLimit' ||
          key === 'remaining' || key === 'dailyRemaining') {
        if (typeof val === 'number' && val < 9999) {
          obj[key] = 9999;
          modified = true;
        }
      }
      
      // 递归处理嵌套对象
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        recursiveModifyVIP(val);
      }
      
      // 处理数组中的对象
      if (Array.isArray(val)) {
        for (const item of val) {
          recursiveModifyVIP(item);
        }
      }
    }
  }
  
  recursiveModifyVIP(obj);
  
  if (modified) {
    body = JSON.stringify(obj);
    console.log(`[ting_en] ✅ VIP已解锁 - 修改接口: ${url}`);
  } else {
    console.log(`[ting_en] ℹ️ 未找到VIP字段 - 接口: ${url}`);
  }
  
  $done({ body });
  
} catch (e) {
  console.log(`[ting_en] ❌ 解析失败: ${e.message} - ${url}`);
  $done({ body });
}
