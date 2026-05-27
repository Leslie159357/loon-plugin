// ==UserScript==
// @name         BaiCiZhan Premium Unlock
// @version      1.1.0
// @description  百词斩Pro会员解锁 - 过期时间改2099+铜板改99999
// @author       Leslie
// @license      MIT
// ==/UserScript==

var url = $request.url;
var body = $response.body;

// ========== 会员信息页面 ==========
if (url.indexOf('/api/strategy/get_member_info_page') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj.data) {
        // 改付费状态
        obj.data.payed = true;
        
        // 改会员信息 - 无论null还是已有都改
        if (obj.data.userVipInfo === null) {
          obj.data.userVipInfo = {
            "entitlementKey": "bcz.app.vip.v1",
            "memberLevel": 2,
            "expireTime": 4102444800000,
            "maxValue": 99999,
            "currentValue": 99999,
            "nextRecoveryTime": null,
            "nextRecoveryAmount": null,
            "recoveryInterval": null
          };
        } else {
          obj.data.userVipInfo.expireTime = 4102444800000;
          obj.data.userVipInfo.memberLevel = 2;
          obj.data.userVipInfo.maxValue = 99999;
          obj.data.userVipInfo.currentValue = 99999;
        }
        
        // 改铜板
        obj.data.creditNum = 99999;
        obj.data.getMonthCreditReward = true;
        obj.data.getTodayReward = true;
        obj.data.todayRewardList = [{"type": 1, "value": 100, "desc": "Pro会员每日积分奖励"}];
        
        // 所有商品价格改为0
        if (obj.data.memberSaleInfoList) {
          for (var i = 0; i < obj.data.memberSaleInfoList.length; i++) {
            var item = obj.data.memberSaleInfoList[i];
            item.price = 0;
            item.originPrice = 0;
            item.autoRenewal = 0;
            if (item.tag) {
              var tags = item.tag.split(',,');
              if (tags.length >= 2) {
                tags[1] = "已解锁";
              }
              item.tag = tags.join(',,');
            }
          }
        }
      }
      $done({body: JSON.stringify(obj)});
    } catch (e) {
      $done({});
    }
  } else {
    $done({});
  }
  return;
}

$done({});
