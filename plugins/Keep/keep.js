/*
 * Keep Premium Unlock v2.0
 * 暴力全覆盖版 — 所有api.gotokeep.com的JSON响应都过一遍替换
 * 不改JSON结构，只替换会员相关字段值
 */

// ================== 完整伪造的会员核心接口 ==================
const fakeFull = {
  "/kprime/v2/infoForClient": {
    ok:true, errorCode:0, text:null, moreInfo:null,
    data: {
      memberDTOList:[{memberType:"YEAR_CARD",membershipType:"YEAR_CARD",autoRenew:true,status:1,statusTrack:"in_effect",paidStatus:1,paidStatusTrack:"paid",gmtCurrentTypeExpire:4102444799000,gmtExpire:4102444799000,totalEffectiveDays:9999,stockFlag:false}],
      status:'{"WEIGHT_LOSS_COACH":"none","POSTURE_TIMES":"none","PHYSICAL_TEST_LOW_PRICE_COURSE":"none","PHYSICAL_TEST":"non_pt_other","LIVE":"none","LANSEXIONGDI_PARTNER":"none","E_PAI_PARTNER":"none","POSTURE":"none","SHUYOU_PARTNER":"none","LIVE_FAMILY":"none","NORMAL_FAMILY":"none","ZHONG_HE_PARTNER":"none","NORMAL":"in_effect","KEEPLAND":"none"}',
      paidStatus:'{"WEIGHT_LOSS_COACH":"none","POSTURE_TIMES":"none","PHYSICAL_TEST_LOW_PRICE_COURSE":"none","PHYSICAL_TEST":"none","LIVE":"none","LANSEXIONGDI_PARTNER":"none","E_PAI_PARTNER":"none","POSTURE":"none","SHUYOU_PARTNER":"none","LIVE_FAMILY":"none","NORMAL_FAMILY":"none","ZHONG_HE_PARTNER":"none","NORMAL":"paid","KEEPLAND":"none"}',
      primeStatus:"in_effect",
      memberInfo:{status:1,gmtExpire:4102444799000,autoRenew:true}
    }
  },
  "/kprime/v1/auth": {
    ok:true, errorCode:0, text:null, moreInfo:null,
    data:{memberType:"YEAR_CARD",membershipType:"YEAR_CARD",autoRenew:true,status:1,statusTrack:"in_effect",paidStatus:1,paidStatusTrack:"paid",gmtCurrentTypeExpire:4102444799000,gmtExpire:4102444799000,totalEffectiveDays:9999,stockFlag:false}
  },
  "/kprime/v2/home/complete/tab/exp": {
    ok:true, errorCode:0, text:null, moreInfo:null,
    data:{tabSales:true,showOtherTabExp:true,memberInfo:{status:1,gmtExpire:4102444799000,autoRenew:true}}
  },
  "/nuocha/training/settings/summary": {
    ok:true, errorCode:0, text:"",
    data:{settingsSummaryViewList:[],hasPaid:true}
  },
  "/nuocha/plans/": {
    ok:true, errorCode:0, text:"",
    data:{status:true,text:"",schema:""}
  },
  "/guide-webapp/v1/popup/getPopUp": {errorCode:0,text:"",data:null},
  "/guide-webapp/v3/motivate/page": {ok:true,errorCode:0,text:"",data:null},
  "/guide-webapp/v1/combogoal/info": {errorCode:0,text:"",data:null},
  "/kprime/v1/member/privilege": {errorCode:0,text:"",data:true},
  "/suit/v5/inJoin": {ok:true,data:true,errorCode:0,text:""},
  "/suit/v5/replace/window": {ok:true,data:true,errorCode:0,text:""}
};

// ================== 把整个响应文本中的会员字段全换了 ==================
function unlockBody(body) {
  return body
    // 会员身份
    .replace(/"memberType":"NORMAL"/g, '"memberType":"YEAR_CARD"')
    .replace(/"memberType":"TRIAL"/g, '"memberType":"YEAR_CARD"')
    .replace(/"memberType":"FREE"/g, '"memberType":"YEAR_CARD"')
    // 状态码
    .replace(/"status":3/g, '"status":1')
    .replace(/"status":2/g, '"status":1')
    // 状态文本
    .replace(/"statusTrack":"expired"/g, '"statusTrack":"in_effect"')
    .replace(/"primeStatus":"expired"/g, '"primeStatus":"in_effect"')
    .replace(/"primeStatus":"none"/g, '"primeStatus":"in_effect"')
    .replace(/"membership_status":"expired"/g, '"membership_status":"active"')
    .replace(/"memberStatus":3/g, '"memberStatus":1')
    .replace(/"memberStatus":2/g, '"memberStatus":1')
    .replace(/"memberStatus":0/g, '"memberStatus":1')
    // 自动续费
    .replace(/"autoRenew":false/g, '"autoRenew":true')
    .replace(/"autoRenew":null/g, '"autoRenew":true')
    // 付费标记
    .replace(/"hasPaid":false/g, '"hasPaid":true')
    .replace(/"free":false/g, '"free":true')
    .replace(/"limitFree":false/g, '"limitFree":true')
    .replace(/"isVip":false/g, '"isVip":true')
    .replace(/"member":false/g, '"member":true')
    .replace(/"downLoadAll":false/g, '"downLoadAll":true')
    .replace(/"startEnable":false/g, '"startEnable":true')
    // 权限开关
    .replace(/"userLiveMemberStatus":false/g, '"userLiveMemberStatus":true')
    .replace(/"canWatchLive":false/g, '"canWatchLive":true')
    .replace(/"userMemberAutoRenew":false/g, '"userMemberAutoRenew":true')
    .replace(/"userUseLiveMemberRights":false/g, '"userUseLiveMemberRights":true')
    .replace(/"restrictedNow":true/g, '"restrictedNow":false')
    .replace(/"membershipOnly":true/g, '"membershipOnly":false')
    .replace(/"preview":true/g, '"preview":false')
    // 限制归零
    .replace(/"limitCount":[1-9]\d*/g, '"limitCount":0')
    .replace(/"videoTime":[1-9]\d*/g, '"videoTime":0')
    // 到期时间
    .replace(/"gmtExpire":null/g, '"gmtExpire":4102444799000')
    .replace(/"gmtExpire":1[0-9]{12}/g, '"gmtExpire":4102444799000')
    .replace(/"gmtCurrentTypeExpire":1[0-9]{12}/g, '"gmtCurrentTypeExpire":4102444799000')
    .replace(/"gmtPaidTypeExpire":1[0-9]{12}/g, '"gmtPaidTypeExpire":4102444799000')
    .replace(/"userLiveMemberExpireTime":\d{1,12}/g, '"userLiveMemberExpireTime":4102444799000')
    // 文案
    .replace(/"headCopy":"[^"]*"/g, '"headCopy":"尊贵的会员，欢迎回来"')
    .replace(/"buttonText":"[^"]*"/g, '"buttonText":""')
    .replace(/"userName":"[^"]*"/g, '"userName":"VIP"')
    .replace(/"limitFreeType":"[^"]*"/g, '"limitFreeType":""')
    // 错误码
    .replace(/"errorCode":[1-9]\d*/g, '"errorCode":0')
    // data/status假→真（会员权益验证）
    .replace(/"data":false/g, '"data":true')
    .replace(/"status":false/g, '"status":true');
}

let url = $request.url;
let body = $response.body;

// 1. 完全伪造的核心接口
if (url.indexOf("/kprime/v2/infoForClient") !== -1) {
  $done({ body: JSON.stringify(fakeFull["/kprime/v2/infoForClient"]) });
  return;
}
if (url.indexOf("/kprime/v1/auth") !== -1) {
  $done({ body: JSON.stringify(fakeFull["/kprime/v1/auth"]) });
  return;
}
if (url.indexOf("/kprime/v2/home/complete/tab/exp") !== -1) {
  $done({ body: JSON.stringify(fakeFull["/kprime/v2/home/complete/tab/exp"]) });
  return;
}
if (url.indexOf("/nuocha/training/settings/summary") !== -1) {
  $done({ body: JSON.stringify(fakeFull["/nuocha/training/settings/summary"]) });
  return;
}
if (url.indexOf("/nuocha/plans/") !== -1) {
  $done({ body: JSON.stringify(fakeFull["/nuocha/plans/"]) });
  return;
}
if (url.indexOf("/guide-webapp/v1/popup") !== -1) {
  $done({ body: JSON.stringify(fakeFull["/guide-webapp/v1/popup/getPopUp"]) });
  return;
}
if (url.indexOf("/guide-webapp/v3/motivate/page") !== -1) {
  $done({ body: JSON.stringify(fakeFull["/guide-webapp/v3/motivate/page"]) });
  return;
}
if (url.indexOf("/guide-webapp/v1/combogoal") !== -1) {
  $done({ body: JSON.stringify(fakeFull["/guide-webapp/v1/combogoal/info"]) });
  return;
}
if (url.indexOf("/kprime/v1/member/privilege") !== -1) {
  $done({ body: JSON.stringify(fakeFull["/kprime/v1/member/privilege"]) });
  return;
}
if (url.indexOf("/suit/v5/inJoin") !== -1) {
  $done({ body: JSON.stringify(fakeFull["/suit/v5/inJoin"]) });
  return;
}
if (url.indexOf("/suit/v5/replace/window") !== -1) {
  $done({ body: JSON.stringify(fakeFull["/suit/v5/replace/window"]) });
  return;
}

// 2. 对 /kprime/v2/home/complete/tab 保留moduleItems（不做完整替换）
//    只替换status等字段（用正则）
// 3. 对 /kprime/v2/home/complete/native 同样保留原始结构

// 4. 所有其他kprime/nuocha/guide/suit接口都走暴力替换
if (body && url.indexOf("api.gotokeep.com") !== -1) {
  try {
    body = unlockBody(body);
  } catch(e) {
    console.log("Keep unlock error: " + e);
  }
}

$done({ body });
