/*
 * Keep Premium Unlock v1.3.2
 * 功能：解锁Keep会员付费课程、跟练、训练计划、直播课
 * App版本：9.0.20
 *
 * 核心原则：只匹配必要接口，不给suit/加全量匹配（避免误伤）
 *
 * [rewrite_local]
 * # Keep Premium Unlock
 * ^https?:\/\/api\.gotokeep\.com\/(kprime|nuocha|guide-webapp) url script-response-body https://raw.githubusercontent.com/Leslie159357/Loon-Plugins/main/plugins/Keep/keep.js
 * 新增精确路径（在脚本中用indexOf匹配，不走全量正则）：
 * /kprime/v1/member/privilege, /kprime/v4/suit/sales/entrance
 * /suit/v5/inJoin, /suit/v5/replace/window
 *
 * [mitm]
 * hostname = api.gotokeep.com
 */

// ================== 完全伪造的响应 ==================
const fakeResponses = {

  "/kprime/v2/infoForClient": {
    ok: true, errorCode: 0, text: null, moreInfo: null,
    data: {
      memberDTOList: [{
        memberType: "YEAR_CARD", membershipType: "YEAR_CARD",
        autoRenew: true, status: 1, statusTrack: "in_effect",
        paidStatus: 1, paidStatusTrack: "paid",
        gmtCurrentTypeExpire: 4102444799000, gmtExpire: 4102444799000,
        totalEffectiveDays: 9999, stockFlag: false
      }],
      status: JSON.stringify({
        WEIGHT_LOSS_COACH: "none", POSTURE_TIMES: "none",
        PHYSICAL_TEST_LOW_PRICE_COURSE: "none", PHYSICAL_TEST: "non_pt_other",
        LIVE: "none", LANSEXIONGDI_PARTNER: "none", E_PAI_PARTNER: "none",
        POSTURE: "none", SHUYOU_PARTNER: "none", LIVE_FAMILY: "none",
        NORMAL_FAMILY: "none", ZHONG_HE_PARTNER: "none",
        NORMAL: "in_effect", KEEPLAND: "none"
      }),
      paidStatus: JSON.stringify({
        WEIGHT_LOSS_COACH: "none", POSTURE_TIMES: "none",
        PHYSICAL_TEST_LOW_PRICE_COURSE: "none", PHYSICAL_TEST: "none",
        LIVE: "none", LANSEXIONGDI_PARTNER: "none", E_PAI_PARTNER: "none",
        POSTURE: "none", SHUYOU_PARTNER: "none", LIVE_FAMILY: "none",
        NORMAL_FAMILY: "none", ZHONG_HE_PARTNER: "none",
        NORMAL: "paid", KEEPLAND: "none"
      }),
      primeStatus: "in_effect",
      memberInfo: { status: 1, gmtExpire: 4102444799000, autoRenew: true }
    }
  },

  "/kprime/v1/auth": {
    ok: true, errorCode: 0, text: null, moreInfo: null,
    data: {
      memberType: "YEAR_CARD", membershipType: "YEAR_CARD",
      autoRenew: true, status: 1, statusTrack: "in_effect",
      paidStatus: 1, paidStatusTrack: "paid",
      gmtCurrentTypeExpire: 4102444799000, gmtExpire: 4102444799000,
      totalEffectiveDays: 9999, stockFlag: false
    }
  },

  "/kprime/v2/home/complete/tab": {
    ok: true, errorCode: 0, text: null, moreInfo: null,
    data: {
      tab: "normal",
      memberInfo: { status: 1, gmtExpire: 4102444799000, autoRenew: true },
      headCopy: "尊贵的会员，欢迎回来",
      checkTheAgreement: true, moduleItems: []
    }
  },

  "/kprime/v2/home/complete/tab/exp": {
    ok: true, errorCode: 0, text: null, moreInfo: null,
    data: {
      tabSales: true, showOtherTabExp: true,
      memberInfo: { status: 1, gmtExpire: 4102444799000, autoRenew: true }
    }
  },

  "/nuocha/training/settings/summary": {
    ok: true, errorCode: 0, text: "",
    data: { settingsSummaryViewList: [], hasPaid: true }
  },

  "/nuocha/plans/": {
    ok: true, errorCode: 0, text: "",
    data: { status: true, text: "", schema: "" }
  },

  "/guide-webapp/v1/popup/getPopUp": {
    errorCode: 0, text: "", data: null
  },

  "/guide-webapp/v3/motivate/page": {
    ok: true, errorCode: 0, text: "", data: null
  },

  "/guide-webapp/v1/combogoal/info": {
    errorCode: 0, text: "", data: null
  },

  // 训练计划会员权益查询
  "/kprime/v1/member/privilege": {
    errorCode: 0, text: "", data: true
  },

  // 训练计划购买入口 - 不做完整fake，走正则就行

  // 训练计划加入权限
  "/suit/v5/inJoin": {
    ok: true, data: true, errorCode: 0, text: ""
  },

  // 训练计划替换窗口
  "/suit/v5/replace/window": {
    ok: true, data: true, errorCode: 0, text: ""
  }
};

// ================== 精确正则替换 ==================
// 只对 kprime/nuocha/guide 接口做替换
const regexRules = [
  { pattern: /"memberType":"(\w)*"/g, replacement: '"memberType":"YEAR_CARD"' },
  { pattern: /"status":3/g, replacement: '"status":1' },
  { pattern: /"statusTrack":"expired"/g, replacement: '"statusTrack":"in_effect"' },
  { pattern: /"primeStatus":"expired"/g, replacement: '"primeStatus":"in_effect"' },
  { pattern: /"autoRenew":false/g, replacement: '"autoRenew":true' },
  { pattern: /"autoRenew":null/g, replacement: '"autoRenew":true' },
  { pattern: /"hasPaid":false/g, replacement: '"hasPaid":true' },
  { pattern: /"free":false/g, replacement: '"free":true' },
  { pattern: /"limitFree":false/g, replacement: '"limitFree":true' },
  { pattern: /"isVip":false/g, replacement: '"isVip":true' },
  { pattern: /"member":false/g, replacement: '"member":true' },
  { pattern: /"userLiveMemberStatus":false/g, replacement: '"userLiveMemberStatus":true' },
  { pattern: /"canWatchLive":false/g, replacement: '"canWatchLive":true' },
  { pattern: /"limitCount":\d{1,3}/g, replacement: '"limitCount":0' },
  { pattern: /"videoTime":\d{2,}/g, replacement: '"videoTime":0' },
  { pattern: /"downLoadAll":false/g, replacement: '"downLoadAll":true' },
  { pattern: /"preview":true/g, replacement: '"preview":false' },
  { pattern: /"startEnable":false/g, replacement: '"startEnable":true' },
  { pattern: /"restrictedNow":true/g, replacement: '"restrictedNow":false' },
  { pattern: /"membershipOnly":true/g, replacement: '"membershipOnly":false' },
  { pattern: /"gmtExpire":null/g, replacement: '"gmtExpire":4102444799000' },
  { pattern: /"headCopy":"[^"]*"/g, replacement: '"headCopy":"尊贵的会员，欢迎回来"' },
  { pattern: /"buttonText":"[^"]*"/g, replacement: '"buttonText":""' },
  { pattern: /"errorCode":[1-9]\d*/g, replacement: '"errorCode":0' },
  { pattern: /"data":false/g, replacement: '"data":true' },
  { pattern: /"status":false/g, replacement: '"status":true' },
];

// ================== 主逻辑 ==================
let url = $request.url;
let body = $response.body;

// 1. 先检查完全伪造（包括 suit/v5/ 等精确路径）
for (let key in fakeResponses) {
  if (url.indexOf(key) !== -1) {
    $done({ body: JSON.stringify(fakeResponses[key]) });
    return;
  }
}

// 2. 正则替换（仅限 kprime/nuocha/guide，不动 suit/）
if (body && /api\.gotokeep\.com\/(kprime|nuocha|guide)/.test(url)) {
  try {
    for (let rule of regexRules) {
      body = body.replace(rule.pattern, rule.replacement);
    }
  } catch (e) {
    console.log("Keep unlock regex error: " + e);
  }
}

$done({ body });
