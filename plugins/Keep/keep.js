/*
 * Keep Premium Unlock v1.0
 * 功能：解锁Keep会员付费课程、跟练、训练计划、直播课
 * App版本：8.7.20+ / 9.0.20
 * 
 * 覆盖的核心接口：
 * 1. /kprime/v2/infoForClient — 会员身份核心（完整伪造）
 * 2. /kprime/v1/auth — 会员鉴权（完整伪造）
 * 3. /kprime/v2/home/complete/tab — 会员页面信息（完整伪造）
 * 4. /nuocha/training/settings/summary — 训练设置（完整伪造）
 * 5. /guide-webapp/v1/popup/getPopUp — 弹窗控制（完整伪造）
 * 6. 所有其他kprime/*、nuocha/*、athena/*接口 — 正则替换关键字段
 * 
 * 脚本原理：
 * - 对核心会员接口，返回完全伪造的JSON（activation状态）
 * - 对其他kprime/nuocha/athena/guide/pencil接口，用正则替换关键字段
 * 
 * [rewrite_local]
 * # Keep Premium Unlock
 * ^https?:\/\/api\.gotokeep\.com\/(kprime|athena|nuocha|guide-webapp|pencil-webapp) url script-response-body https://raw.githubusercontent.com/Leslie159357/Loon-Plugins/main/plugins/Keep/keep.js
 * 
 * [mitm]
 * hostname = api.gotokeep.com
 */

// ================== 完全伪造的响应 ==================
// 这些接口完整替换整个响应，确保100%生效
const fakeFullResponses = [
  {
    // 会员信息核心 - 所有会员状态聚合
    pattern: "/kprime/v2/infoForClient",
    body: {
      ok: true,
      errorCode: 0,
      text: null,
      moreInfo: null,
      data: {
        memberDTOList: [{
          memberType: "YEAR_CARD",
          membershipType: "YEAR_CARD",
          autoRenew: true,
          status: 1,
          statusTrack: "in_effect",
          paidStatus: 1,
          paidStatusTrack: "paid",
          gmtEffective: 1706623416000,
          gmtCurrentTypeExpire: 4102444799000,
          gmtPaidTypeExpire: 4102444799000,
          gmtExpire: 4102444799000,
          totalEffectiveDays: 9999,
          currentEffectiveDays: 365,
          stockFlag: false
        }],
        status: JSON.stringify({
          WEIGHT_LOSS_COACH: "none",
          POSTURE_TIMES: "none",
          PHYSICAL_TEST_LOW_PRICE_COURSE: "none",
          PHYSICAL_TEST: "non_pt_other",
          LIVE: "none",
          LANSEXIONGDI_PARTNER: "none",
          E_PAI_PARTNER: "none",
          POSTURE: "none",
          SHUYOU_PARTNER: "none",
          LIVE_FAMILY: "none",
          NORMAL_FAMILY: "none",
          ZHONG_HE_PARTNER: "none",
          NORMAL: "in_effect",
          KEEPLAND: "none"
        }),
        paidStatus: JSON.stringify({
          WEIGHT_LOSS_COACH: "none",
          POSTURE_TIMES: "none",
          PHYSICAL_TEST_LOW_PRICE_COURSE: "none",
          PHYSICAL_TEST: "none",
          LIVE: "none",
          LANSEXIONGDI_PARTNER: "none",
          E_PAI_PARTNER: "none",
          POSTURE: "none",
          SHUYOU_PARTNER: "none",
          LIVE_FAMILY: "none",
          NORMAL_FAMILY: "none",
          ZHONG_HE_PARTNER: "none",
          NORMAL: "paid",
          KEEPLAND: "none"
        }),
        primeStatus: "in_effect"
      }
    }
  },
  {
    // 会员鉴权
    pattern: "/kprime/v1/auth",
    body: {
      ok: true,
      errorCode: 0,
      text: null,
      moreInfo: null,
      data: {
        memberType: "YEAR_CARD",
        membershipType: "YEAR_CARD",
        autoRenew: true,
        status: 1,
        statusTrack: "in_effect",
        paidStatus: 1,
        paidStatusTrack: "paid",
        gmtCurrentTypeExpire: 4102444799000,
        gmtExpire: 4102444799000,
        totalEffectiveDays: 9999,
        stockFlag: false
      }
    }
  },
  {
    // 会员页面
    pattern: "/kprime/v2/home/complete/tab",
    body: {
      ok: true,
      errorCode: 0,
      text: null,
      moreInfo: null,
      data: {
        tab: "normal",
        memberInfo: {
          status: 1,
          gmtExpire: 4102444799000,
          autoRenew: true
        },
        headCopy: "尊贵的会员，欢迎回来",
        checkTheAgreement: true,
        moduleItems: []
      }
    }
  },
  {
    // 训练设置摘要
    pattern: "/nuocha/training/settings/summary",
    body: {
      ok: true,
      errorCode: 0,
      text: "",
      data: {
        settingsSummaryViewList: [],
        hasPaid: true
      }
    }
  },
  {
    // 弹窗 - 直接返回空（避免弹购买弹窗）
    pattern: "/guide-webapp/v1/popup/getPopUp",
    body: {
      errorCode: 0,
      text: "",
      data: null
    }
  }
];

// ================== 正则替换规则 ==================
// 对于其他所有接口，进行精确的正则替换
const replacementRules = [
  // === 会员身份 ===
  { from: /"memberType":"NORMAL"/g, to: '"memberType":"YEAR_CARD"' },
  { from: /"memberType":"TRIAL"/g, to: '"memberType":"YEAR_CARD"' },
  { from: /"memberType":"FREE"/g, to: '"memberType":"YEAR_CARD"' },
  
  // === 会员状态码 ===
  // status: 3 = expired, 2 = about_to_expire, 1 = active
  { from: /"status":3/g, to: '"status":1' },
  { from: /"status":2/g, to: '"status":1' },
  
  // === 会员状态文本 ===
  { from: /"statusTrack":"expired"/g, to: '"statusTrack":"in_effect"' },
  { from: /"statusTrack":"trial"/g, to: '"statusTrack":"in_effect"' },
  
  // === prime/会员状态 ===
  { from: /"primeStatus":"expired"/g, to: '"primeStatus":"in_effect"' },
  { from: /"primeStatus":"trial"/g, to: '"primeStatus":"in_effect"' },
  { from: /"primeStatus":"none"/g, to: '"primeStatus":"in_effect"' },
  
  // === 直播课权限 ===
  { from: /"userLiveMemberStatus":false/g, to: '"userLiveMemberStatus":true' },
  { from: /"userLiveMemberStatus":0/g, to: '"userLiveMemberStatus":1' },
  { from: /"canWatchLive":false/g, to: '"canWatchLive":true' },
  { from: /"userMemberAutoRenew":false/g, to: '"userMemberAutoRenew":true' },
  { from: /"userUseLiveMemberRights":false/g, to: '"userUseLiveMemberRights":true' },
  { from: /"userLiveMemberExpireTime":\d{1,12}/g, to: '"userLiveMemberExpireTime":4102444799000' },
  
  // === 自动续费 ===
  { from: /"autoRenew":false/g, to: '"autoRenew":true' },
  
  // === 付费相关 ===
  { from: /"hasPaid":false/g, to: '"hasPaid":true' },
  { from: /"free":false/g, to: '"free":true' },
  { from: /"limitFree":false/g, to: '"limitFree":true' },
  { from: /"isVip":false/g, to: '"isVip":true' },
  { from: /"member":false/g, to: '"member":true' },
  { from: /"member":0(?=[,\s}])/g, to: '"member":1' },
  
  // === 限制计数归零 ===
  { from: /"limitCount":"[^"]*"/g, to: '"limitCount":"0"' },
  { from: /"limitCount":[1-9]\d*/g, to: '"limitCount":0' },
  { from: /"videoTime":[1-9]\d*/g, to: '"videoTime":0' },
  
  // === 功能解锁 ===
  { from: /"downLoadAll":false/g, to: '"downLoadAll":true' },
  { from: /"preview":true/g, to: '"preview":false' },
  { from: /"startEnable":false/g, to: '"startEnable":true' },
  
  // === 会员到期时间扩展到2099年 ===
  { from: /"gmtExpire":1[0-9]{12}/g, to: '"gmtExpire":4102444799000' },
  { from: /"gmtCurrentTypeExpire":1[0-9]{12}/g, to: '"gmtCurrentTypeExpire":4102444799000' },
  { from: /"gmtPaidTypeExpire":1[0-9]{12}/g, to: '"gmtPaidTypeExpire":4102444799000' },
  
  // === 错误码归零 ===
  { from: /"errorCode":[1-9]\d*/g, to: '"errorCode":0' },
  
  // === limitFreeType 置空 ===
  { from: /"limitFreeType":"[^"]*"/g, to: '"limitFreeType":""' },
  
  // === buttonText 置空（购买按钮） ===
  { from: /"buttonText":"[^"]*"/g, to: '"buttonText":""' },
  
  // === 用户名改为VIP ===
  { from: /"userName":"[^"]*"/g, to: '"userName":"VIP"' },
  
  // === 会员标签字段 ===
  { from: /"labelType":"[^"]*"/g, to: '"labelType":"VIP"' },
  
  // === 跟练/课程中的会员限制 ===
  { from: /"restrictedNow":true/g, to: '"restrictedNow":false' },
  { from: /"membershipOnly":true/g, to: '"membershipOnly":false' },
];

// ================== 主逻辑 ==================
let url = $request.url;
let body = $response.body;

// 1. 先检查是否匹配到完整伪造的接口
for (let fake of fakeFullResponses) {
  if (url.indexOf(fake.pattern) !== -1) {
    $done({ body: JSON.stringify(fake.body) });
    return;
  }
}

// 2. 应用正则替换（仅对kprime/nuocha/athena/guide/pencil接口）
if (/api\.gotokeep\.com\/(kprime|athena|nuocha|guide|pencil)/.test(url)) {
  try {
    for (let rule of replacementRules) {
      body = body.replace(rule.from, rule.to);
    }
  } catch (e) {
    console.log("Keep unlock regex error: " + e);
  }
}

$done({ body });
