// 瓜瓜跟读 (linguagua) 破解脚本 v2.0
// 基于实际抓包数据（2026-06-08）
// 支持: Loon / Quantumult X / Surge
// API域名: api.lgg.oranglish.com

var body = $response.body;
var url = $request.url;
var method = $request.method;

if (!body) { $done({}); }

try {
  // ===== 1. 用户信息 - 注入会员状态 =====
  // 实际响应: {"code":200,"data":{"id":"...","membership_status":false,"membership_end_date":null,...},"message":"成功"}
  if (url.indexOf('/user/info') !== -1 && method === 'GET') {
    var obj = JSON.parse(body);
    if (obj.data) {
      obj.data.membership_status = true;
      obj.data.membership_end_date = '2099-12-31 23:59:59';
      obj.data.is_create_permission = true;
    }
    body = JSON.stringify(obj);
  
  // ===== 2. 统计数据 - 小红花无限 =====
  // 实际响应: {"code":200,"data":{"trophy_num":252,...},"message":"成功"}
  } else if (url.indexOf('/stats/user') !== -1 && method === 'GET') {
    var obj = JSON.parse(body);
    if (obj.data) {
      obj.data.trophy_num = 99999;
      obj.data.is_create_permission = true;
    }
    body = JSON.stringify(obj);
  
  // ===== 3. 检查导入文章所需小红花 =====
  } else if (url.indexOf('/article/check-flower-for-import') !== -1) {
    var obj = JSON.parse(body);
    if (obj.data) {
      obj.data.can_import = true;
      obj.data.need_flower = 0;
      obj.data.current_flower = 99999;
    }
    body = JSON.stringify(obj);
  
  // ===== 4. 收据验证 - 返回成功 =====
  } else if (url.indexOf('/membership/verify/apple/receipt') !== -1) {
    var obj = JSON.parse(body);
    if (obj.data) {
      obj.data.membership_status = true;
      obj.data.membership_end_date = '2099-12-31 23:59:59';
    }
    obj.success = true;
    body = JSON.stringify(obj);
  
  // ===== 5. 兑换码 - 返回成功 =====
  } else if (url.indexOf('/membership/exchange') !== -1) {
    var obj = JSON.parse(body);
    obj.success = true;
    if (obj.data) {
      obj.data.membership_status = true;
      obj.data.membership_end_date = '2099-12-31 23:59:59';
    }
    body = JSON.stringify(obj);
  
  // ===== 6. Token刷新 - 延长有效期 =====
  } else if (url.indexOf('/refresh/token') !== -1) {
    var obj = JSON.parse(body);
    if (obj.expires_in) {
      obj.expires_in = 999999999;
    }
    body = JSON.stringify(obj);
  }
} catch(e) {}

$done({body: body});
