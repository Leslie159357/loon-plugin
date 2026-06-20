// 猫屎咖啡 (Cat Poop Coffee) - MITM 数据修改脚本
// 微信小程序 AppId: wx02f4bd4c2c4522a9
// 服务器域名: minigames.liuzhaoling.com
// 数据接口: POST /userData/upsertUserData
// 
// 支持: Quantumult X / Loon / Surge / Stash
//
// 使用说明:
// 1. 在代理工具中开启 MITM，添加域名 minigames.liuzhaoling.com
// 2. 安装并信任根证书
// 3. 将此脚本配置为 script-request-body（请求体改写）
// 4. 重新打开小程序即可

// 注意：这个游戏的数据是客户端算好完整存档后整体上传到服务器。
// 服务器仅作存储，不做校验。
// 所以只要修改上传请求中的 data 字段，服务器就会存放大版的数据。
// 但更关键的是——游戏主数据存在微信本地存储，所以本地直接改才是最彻底的。

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

  // ===== 入口 =====
  var url = $request.url;
  var body = $request.body || '';

  // 只拦截 upsertUserData
  if (url.indexOf('/userData/upsertUserData') === -1) {
    $done({});
    return;
  }

  try {
    var obj = JSON.parse(body);
    if (obj.data && typeof obj.data === 'string') {
      var dataObj = JSON.parse(obj.data);
      if (dataObj.localData) {
        dataObj.localData = modifyLocalData(dataObj.localData);
        obj.data = JSON.stringify(dataObj);
        console.log('[猫屎咖啡] 资源已修改 ✓');
        $done({body: JSON.stringify(obj)});
      } else {
        $done({});
      }
    } else {
      $done({});
    }
  } catch (e) {
    console.log('[猫屎咖啡] 解析失败: ' + e.message);
    $done({});
  }
})();
