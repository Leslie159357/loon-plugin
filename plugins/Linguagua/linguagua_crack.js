// 瓜瓜跟读 (linguagua) 破解脚本
// 支持: Loon / Quantumult X / Surge
// API域名: api.lgg.oranglish.com

const apiDomain = 'api.lgg.oranglish.com';

// 会员配置
const membershipConfig = {
  membership_status: 'active',
  membership_end_date: '2099-12-31 23:59:59',
  plan: 'LIN_Permanent_PRO_Member',
};

// 用户信息响应拦截
function modifyUserInfo(body) {
  try {
    let obj = JSON.parse(body);
    
    if (obj.data) {
      if (obj.data.user) {
        obj.data.user.membership_status = membershipConfig.membership_status;
        obj.data.user.membership_end_date = membershipConfig.membership_end_date;
        obj.data.user.plan = membershipConfig.plan;
      }
      obj.data.membership_status = membershipConfig.membership_status;
      obj.data.membership_end_date = membershipConfig.membership_end_date;
      obj.data.plan = membershipConfig.plan;
    }
    
    obj.membership_status = membershipConfig.membership_status;
    obj.membership_end_date = membershipConfig.membership_end_date;
    obj.plan = membershipConfig.plan;
    
    if (obj.access_token) {
      obj.expires_in = 999999999;
    }
    
    return JSON.stringify(obj);
  } catch (e) {
    return body;
  }
}

// 收据验证响应拦截
function modifyReceiptVerification(body) {
  try {
    let obj = JSON.parse(body);
    
    if (obj.data) {
      obj.data.membership_status = membershipConfig.membership_status;
      obj.data.membership_end_date = membershipConfig.membership_end_date;
      obj.data.plan = membershipConfig.plan;
    }
    
    obj.membership_status = membershipConfig.membership_status;
    obj.membership_end_date = membershipConfig.membership_end_date;
    obj.plan = membershipConfig.plan;
    obj.success = true;
    
    return JSON.stringify(obj);
  } catch (e) {
    return body;
  }
}

// 兑换码响应拦截
function modifyExchange(body) {
  try {
    let obj = JSON.parse(body);
    obj.success = true;
    if (obj.data) {
      obj.data.membership_status = membershipConfig.membership_status;
      obj.data.membership_end_date = membershipConfig.membership_end_date;
      obj.data.plan = membershipConfig.plan;
    }
    return JSON.stringify(obj);
  } catch (e) {
    return body;
  }
}

var body = $response.body;
var url = $request.url;
var method = $request.method;

if (url.indexOf('/user/info') !== -1 && method === 'GET') {
  body = modifyUserInfo(body);
} else if (url.indexOf('/membership/verify/apple/receipt') !== -1) {
  body = modifyReceiptVerification(body);
} else if (url.indexOf('/membership/exchange') !== -1) {
  body = modifyExchange(body);
} else if (url.indexOf('/refresh/token') !== -1) {
  try {
    let obj = JSON.parse(body);
    obj.expires_in = 999999999;
    body = JSON.stringify(obj);
  } catch(e) {}
}

$done({body: body});
