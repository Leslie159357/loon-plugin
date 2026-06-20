// 猫屎咖啡 (Cat Poop Coffee) - MITM 数据修改脚本
// 微信小程序 AppId: wx02f4bd4c2c4522a9
// 服务器域名: minigames.liuzhaoling.com
// 数据接口: POST /userData/upsertUserData
//
// 支持: Quantumult X (script-request-body) / Loon (http-request) / Surge (http-request)
//
// Quantumult X 配置:
// [rewrite_local]
// ^https:\/\/minigames\.liuzhaoling\.com\/userData\/upsertUserData url script-request-body catpoop.js
//
// [MITM]
// hostname = minigames.liuzhaoling.com
//
// Loon 配置:
// [Script]
// http-request ^https?:\/\/minigames\.liuzhaoling\.com\/userData\/upsertUserData script-path=catpoop.js, timeout=10, tag=猫屎咖啡
//
// [MITM]
// hostname = %APPEND% minigames.liuzhaoling.com

(function() {
  // ===== 要修改的资源数值 =====
  var RESOURCES = {
    '_money': 99999999,           // 金币
    '_diamond': 99999,            // 钻石
    '_bean': 99999,               // 豆子
    '_guo': 99999,                // 果冻/果酱
    '_fish': 99999,               // 鱼
    'tili': 999,                  // 体力
    'shopFishLeftCount': 999,     // 钓鱼剩余次数
    'zhuanPanLeftCount': 999,     // 转盘剩余次数
    'flyGiftLeftCount': 999,      // 飞行礼包剩余次数
    'orderAdLeftCount': 999,      // 订单广告剩余次数
    'tiliAdLeftCount': 999,       // 体力广告剩余次数
    'catRewadAdLeftCount': 999,   // 猫奖励广告剩余次数
    'todayShareCount': 999,       // 今日分享次数
    'maxBuildCount': 99,          // 最大建造数
    'maxYanJIuCount': 99,         // 最大研究数
    'ADDoubleCount': 999,         // 广告翻倍次数
    'ADDoubleLeftCount': 999,     // 广告翻倍剩余
    'allEarn': 9999999            // 总收益
  };

  // ===== 修改本地数据 =====
  function modifyLocalData(localData) {
    if (!localData) return localData;
    for (var key in RESOURCES) {
      if (localData.hasOwnProperty(key)) {
        localData[key] = RESOURCES[key];
      }
    }
    // 去广告
    localData['isRemoveAd'] = true;
    // 免费钻石
    localData['hasShopFreeDiamond'] = true;
    return localData;
  }

  // ===== 处理 body =====
  function processBody(body) {
    try {
      var obj = JSON.parse(body);
      if (obj.data && typeof obj.data === 'string') {
        var dataObj = JSON.parse(obj.data);
        if (dataObj.localData) {
          dataObj.localData = modifyLocalData(dataObj.localData);
          obj.data = JSON.stringify(dataObj);
          console.log('[猫屎咖啡] 资源已修改 ✓');
          return JSON.stringify(obj);
        }
      }
    } catch (e) {
      console.log('[猫屎咖啡] 解析失败: ' + e.message);
    }
    return body;
  }

  // ===== 入口: 兼容 QX / Loon / Surge =====
  var url = $request.url;
  var body = $request.body || $request.bodyBytes || '';

  if (url.indexOf('/userData/upsertUserData') === -1) {
    $done({});
    return;
  }

  var modifiedBody = processBody(body);
  $done({body: modifiedBody});
})();
