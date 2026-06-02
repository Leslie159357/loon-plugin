// ==UserScript==
// @name         SuiBianXue VIP Unlock
// @version      1.0.0
// @description  随便学VIP会员解锁 + 无限试炼
// @author       Leslie159357
// @license      MIT
// ==/UserScript==

var url = $request.url;
var body = $response.body;

// ========== GET /server/api/v2/me ==========
// 修改 vipExpireAtMs、trialRemaining、dailyRemaining
if (url.indexOf('/server/api/v2/me') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj.user) {
        // 设置VIP过期时间为2120年
        obj.user.vipExpireAtMs = 4730400000000;
        // 无限试炼
        obj.trialRemaining = 99999;
        obj.dailyRemaining = 99999;
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
