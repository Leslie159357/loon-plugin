// ==UserScript==
// @name         BaiCiZhan Premium Unlock
// @version      1.0.0
// @description  百词斩Pro会员解锁
// @author       Leslie
// @license      MIT
// ==/UserScript==

var url = $request.url;
var body = $response.body;
var status = $response.status;

// ========== 会员信息页面 ==========
if (url.indexOf('/api/strategy/get_member_info_page') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj.data) {
        obj.data.payed = true;
        if (obj.data.userVipInfo === null) {
          obj.data.userVipInfo = {
            "memberType": 16,
            "memberTypeName": "Pro年度会员",
            "startTime": 1779885528000,
            "endTime": 4102444800000,
            "autoRenewal": 1,
            "level": 2,
            "status": 1,
            "origin": 1
          };
        }
        obj.data.getMonthCreditReward = true;
        obj.data.creditNum = 99999;
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
      console.log('baicizhan: JSON parse error - ' + e);
      $done({});
    }
  } else {
    $done({});
  }
  return;
}

// ========== 商城 - 订单信息 ==========
if (url.indexOf('/api/mall/proxy/virtual-currency/apple/get_order_info') !== -1) {
  // 保持原响应，App需要真实Apple IAP信息才能发起支付
  $done({});
  return;
}

// ========== 商城 - 更新优惠记录 ==========
if (url.indexOf('/api/mall/proxy/virtual-currency/apple/update_ios_user_discount_record') !== -1) {
  // 保持，让App认为优惠已更新
  $done({});
  return;
}

// ========== 商城 - 用户优惠列表 ==========
if (url.indexOf('/api/mall/proxy/virtual-currency/apple/get_user_ios_promotion_id_list') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj.data) {
        // 延长所有优惠到可用状态
        // 保持原样，这是可见的优惠列表
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

// ========== get_user_study_config ==========
// 学习配置
if (url.indexOf('/rpc/user_study/get_user_study_config') !== -1) {
  $done({});  // 保持原样，Thrift协议不可改
  return;
}

$done({});
