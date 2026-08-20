// Xmind Pro+ 解锁 v3 - 真实抓包修正版
// 抓包确认(2026-08-20): 会员接口全在 www.xmind.cn，响应结构已知
//   GET  /_res/user_sub_details   → {"_code":200,"google":[],"appstore":[],"official_website":[]}
//   POST /_res/appstore/sub       → {"errorcode":"4003","_code":400}（服务端拒，需伪造成功体）
//   POST /_api/appstore/active    → {"status":"trial","subscriptionStatus":"UNKNOWN","expireTime":0,...}
//   POST /_res/devices            → {"license":{"status":"Trial","expireTime":0},...}
//   GET  /_res/session            → 会话
// v3 策略: 状态字段改成独特标记 PROPLUS 便于抓包确认脚本命中；绝对值可用
const VERSION = "XmindUnlock v3";

function log(msg) { console.log("[" + VERSION + "] " + msg); }
function getHost(u) { var m = u.match(/^https?:\/\/([^\/]+)/i); return m ? m[1] : ''; }

// 递归锁定（兜底，只改已知 key）
var BOOL = {"ispro":1,"isproplus":1,"isprofeature":1,"ispremium":1,"issubscribed":1,"isvip":1,"islifetime":1,"hasvalidlicense":1,"isactivated":1,"haspayed":1,"isactive":1,"isenabled":1,"ispurchasedallowed":1,"pro":1,"isplus":1,"haspaid":1};
var STR = {"plan":"propro","subscription":"proplus","subscriptionplan":"proplus","licensetype":"proplus","memberstatus":"proplus","membertype":"proplus"};
var NUM = {"credits":999999,"bindxmind":1,"limit":1};

function force(obj,d){ if(!obj||typeof obj!=='object'||d>30)return obj; var arr=Array.isArray(obj); var out=arr?[]:{}; for(var k in obj){ if(!Object.prototype.hasOwnProperty.call(obj,k))continue; var v=obj[k]; var lk=k.toLowerCase();
  if(typeof v==='boolean' && (BOOL[lk]!==undefined)){ v=true; }
  else if(typeof v==='object'){ v=force(v,d+1); }
  else if(typeof v==='string' && STR[lk]!==undefined){ v=STR[lk]; log("str "+k+": -> "+v); }
  else if(typeof v==='number' && NUM[lk]!==undefined){ v=NUM[lk]; }
  if(arr)out.push(v); else out[k]=v; } return out; }

function main(){
  var url = $request.url, method = ($request.method||'GET').toUpperCase();
  var host = getHost(url);
  log(method+" "+url);

  // 只处理 xmind 域名
  if(!/(^|\.)(xmind\.(com|cn)|xmind\.app)$/i.test(host)){ $done({}); return; }

  // POST /_res/appstore/sub → 直接伪造成功体（绕过服务端 4003）
  if(/\/_res\/appstore\/sub(\?|$)/.test(url)) {
    var body = JSON.stringify({"_code":200,"plan":"ProPlus","isActive":true,"expireDate":4092599349,"status":"active","productId":"net.xmind.brownieapp.proplus.yearly","sign":"PROPLUS_UNLOCKED"});
    var h = {}; var rh=$response&&$response.headers?$response.headers:{};
    h['Content-Type']='application/json';
    log("appstore/sub FAKE body");
    $done({status:200, headers:h, body:body});
    return;
  }

  if(!$response || typeof $response.body!=='string' || !$response.body.length){ $done({}); return; }
  var parsed=null; try{ parsed=JSON.parse($response.body); }catch(e){ log("not json"); $done({}); return; }
  var result=parsed;

  if(/\/_res\/user_sub_details(\?|$)/.test(url)) {
    // 数组注入 + 状态标记
    if(result && typeof result==='object'){
      ["appstore","google","official_website","appStore"].forEach(function(ak){
        if(Array.isArray(result[ak])){
          result[ak].push({plan:"ProPlus",isActive:true,expireDate:4092599349,productId:"net.xmind.brownieapp.proplus.yearly",status:"active",sign:"PROPLUS_UNLOCKED"});
          log("inject "+ak);
        }
      });
      // 顶层 _code 保持
      if(result._code===undefined){ result._code=200; }
      result.sign="PROPLUS_UNLOCKED";
    }
  } else if(/\/_api\/appstore\/active(\?|$)/.test(url)) {
    if(result && typeof result==='object'){
      result.status="proplus"; result.subscriptionStatus="ACTIVE"; result.expireTime=4092599349; result.bindXmind=1;
      result.sign="PROPLUS_UNLOCKED";
      log("appstore/active -> proplus/ACTIVE");
    }
  } else if(/\/_res\/devices(\?|$)/.test(url)) {
    if(result && typeof result==='object' && result.license){
      result.license.status="ProPlus"; result.license.expireTime=4092599349;
      result.sign="PROPLUS_UNLOCKED";
      log("devices license -> ProPlus");
    }
  } else if(/\/_res\/session(\?|$)/.test(url)) {
    result.sign="PROPLUS_UNLOCKED";
  } else {
    result = force(result,0);
  }

  var nb = JSON.stringify(result);
  var h2 = {}; var rh2 = $response.headers||{};
  for(var kk in rh2){ if(Object.prototype.hasOwnProperty.call(rh2,kk)) h2[kk]=rh2[kk]; }
  h2['Content-Type']='application/json';
  if(h2['Content-Length']) h2['Content-Length']=String(nb.length);
  log("rewritten -> "+nb);
  $done({headers:h2, body:nb});
}

try{ main(); }catch(e){ log("err "+e.message); $done({}); }
