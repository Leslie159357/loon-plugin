// 懒人听书 VIP 解锁脚本（v3 - 最高VIP版本）
// 用法：配合 Loon 插件使用
// 所有VIP字段全部改最高版本
// 更新日期：2026-05-24

const url = $request.url;
let body = $response.body;

if (typeof body === "string" && body.length > 0) {
  try {
    let obj = JSON.parse(body);
    const farFuture = 4102329600000;

    // ══════════════════════════════════════
    // 接口1：ClientGetUserInfo.action
    // ══════════════════════════════════════
    if (url.includes("ClientGetUserInfo.action")) {
      obj.feeType = 2;                     // 2=高级会员(SVIP)
      obj.vipType = 2;                     // 2=SVIP
      obj.vipBenefits = 7;                 // 全部权益
      obj.memberSectionCount = 999999;
      obj.vipExpireTime = farFuture;
      obj.vipBuyExpireTime = farFuture;
      obj.vipExpireTimeNonExperience = farFuture;
      obj.needAdvertNum = 0;
      obj.needAdvertSum = 0;
      obj.canUnlockNum = 9999;
      obj.canUnlockSectionNum = 9999;
      obj.subscribe = 1;
      obj.subscribeStatus = 1;
      $done({ body: JSON.stringify(obj) });
      return;
    }

    // ══════════════════════════════════════
    // 接口2：/ajax/getUserInfo
    // ══════════════════════════════════════
    if (url.includes("/ajax/getUserInfo")) {
      obj.feeType = 2;
      obj.vipType = 2;
      obj.vipBenefits = 7;
      obj.memberSectionCount = 999999;
      obj.vipExpireTime = farFuture;
      obj.vipBuyExpireTime = farFuture;
      obj.vipExpireTimeNonExperience = farFuture;
      obj.needAdvertNum = 0;
      obj.needAdvertSum = 0;
      obj.canUnlockNum = 9999;
      obj.canUnlockSectionNum = 9999;
      obj.subscribe = 1;
      obj.subscribeStatus = 1;
      $done({ body: JSON.stringify(obj) });
      return;
    }

    // ══════════════════════════════════════
    // 接口3：user/vipInfo（核心VIP判断）
    // ══════════════════════════════════════
    if (url.includes("user/vipInfo")) {
      if (obj.data) {
        obj.data.vipUser = true;
        obj.data.vipRightsLevel = 3;
        obj.data.vipLevel = 7;
        obj.data.vipLevelName = "超级SVIP";
        obj.data.expireTime = farFuture;
        obj.data.payExpireTime = farFuture;
        obj.data.freeExpireTime = farFuture;
        obj.data.experienceExpireTime = farFuture;
        obj.data.experienceCardExpireTime = farFuture;
        obj.data.subscribeStatus = 1;
        obj.data.minVipPrice = 0;
        obj.data.minPriceVipSuite = null;
        obj.data.musicVip = {"musicHit": true, "musicVipExpireTime": farFuture};
      }
      $done({ body: JSON.stringify(obj) });
      return;
    }

    // ══════════════════════════════════════
    // 接口4：getListenPath — 播放路径伪造
    // ══════════════════════════════════════
    if (url.includes("getListenPath")) {
      if (obj.status === 26) {
        const params = new URL(url).searchParams;
        const resId = params.get('resId') || "0";
        const entityId = params.get('entityId') || "0";
        const section = params.get('section') || "1";
        obj.apiStatus = 0;
        obj.status = 0;
        obj.msg = "";
        obj.data = {
          "trackId": parseInt(entityId + section),
          "resId": resId,
          "section": parseInt(section),
          "path": "",
          "quality": 1, "effect": 0, "usingSdk": 0,
          "pathMeta": "15::" + (parseInt(entityId) + parseInt(section)),
          "serverTime": Date.now(), "expiredTime": 86400000,
          "mimeType": "audio/mp4", "fileSize": 0, "md5Code": "",
          "fileLength": 0, "loudnessSwitch": 0, "lra": 0, "peak": 0, "gain": 0,
          "bitrate": "48000", "ekey": "", "seedId": "",
          "extInfo": JSON.stringify({"is_freemode":0,"is_vip":1}),
          "bizCode": 0
        };
      } else if (obj.data && obj.data.extInfo) {
        let ext = typeof obj.data.extInfo === "string" ? JSON.parse(obj.data.extInfo) : obj.data.extInfo;
        ext.is_vip = 1; ext.is_freemode = 0;
        obj.data.extInfo = JSON.stringify(ext);
      }
      $done({ body: JSON.stringify(obj) });
      return;
    }

    // ══════════════════════════════════════
    // 接口5：getAiLrcPath
    // ══════════════════════════════════════
    if (url.includes("getAiLrcPath")) {
      if (obj.status === 26) {
        obj.apiStatus = 0; obj.status = 0; obj.msg = "";
        obj.data = {"lrcPath": "", "aiLrcRelateData": null, "lrcContent": ""};
      }
      $done({ body: JSON.stringify(obj) });
      return;
    }

    // ══════════════════════════════════════
    // 接口6：getUserProfileInfo
    // ══════════════════════════════════════
    if (url.includes("getUserProfileInfo")) {
      if (obj.data) {
        obj.data.isVipUser = 1;
        obj.data.isExperienceCard = 1;
        obj.data.vipLevel = 7;
        obj.data.vipLevelName = "超级SVIP";
        obj.data.vipFlags = 127;
      }
      $done({ body: JSON.stringify(obj) });
      return;
    }

    // ══════════════════════════════════════
    // 接口7：vip/suite/recommend
    // ══════════════════════════════════════
    if (url.includes("vip/suite/recommend")) {
      if (obj.data) {
        obj.data.vipEnterSuiteRecommend = {"showVipLogo":0,"showStyle":0,"title":"","subTitle":"","button":"","jumpType":0,"vipSuite":null};
        obj.data.minibarTextList = [];
      }
      $done({ body: JSON.stringify(obj) });
      return;
    }

    // ══════════════════════════════════════
    // 接口8：getFreeModeInfo
    // ══════════════════════════════════════
    if (url.includes("getFreeModeInfo")) {
      if (obj.data) {
        obj.data.enable = 1;
        obj.data.freeModeInfo = {"continueUnlockTimes":9999,"availableTime":999999,"availableTimeCanConsume":1,"todayUsedCount":0,"todayMaxCount":9999,"giftTime":99999,"unlockTotalTime":999999,"timingMethod":1,"filterVipDiscounts":1};
      }
      $done({ body: JSON.stringify(obj) });
      return;
    }

    // ══════════════════════════════════════
    // 接口9：getGlobalFreeModeInfo
    // ══════════════════════════════════════
    if (url.includes("getGlobalFreeModeInfo")) {
      if (obj.data && obj.data.freeModeInfo) {
        obj.data.enable = 1;
        obj.data.freeModeInfo.availableTime = 999999;
        obj.data.freeModeInfo.unlockTotalTime = 999999;
        obj.data.freeModeInfo.todayMaxCount = 9999;
        obj.data.freeModeInfo.continueUnlockTimes = 9999;
        obj.data.freeModeInfo.giftTime = 99999;
        obj.data.freeModeInfo.todayUsedCount = 0;
        obj.data.freeModeInfo.availableTimeCanConsume = 1;
        if (obj.data.freeModeInfo.bubbles) {
          for (let b of obj.data.freeModeInfo.bubbles) { b.used = 0; b.giftTime = 99999; }
        }
        if (obj.data.vipPopup) obj.data.vipPopup.show = 0;
      }
      $done({ body: JSON.stringify(obj) });
      return;
    }

    // ══════════════════════════════════════
    // 接口10：birthdayPrivilege
    // ══════════════════════════════════════
    if (url.includes("birthdayPrivilege")) {
      if (obj.data) { obj.data.vipRightsLevel = 3; obj.data.hasBirthday = true; }
      $done({ body: JSON.stringify(obj) });
      return;
    }

  } catch (e) {
    console.log("lrts error: " + e);
  }
}

$done({});
