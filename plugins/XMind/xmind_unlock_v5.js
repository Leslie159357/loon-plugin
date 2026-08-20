// Xmind Pro+ 解锁 v5 - 诊断 + 无条件伪造版
// 特性：
//  1. appstore/sub 无条件伪造成功体（不依赖原响应结构）
//  2. 每个命中都发系统通知（铁证脚本在跑）
//  3. user_sub_details 数组注入 + 状态标记
//  4. 所有改写响应带 X-Unlocked 头 + sign 标记
var VERSION = "XmindUnlock v5";

function log(m){ console.log("["+VERSION+"] "+m); }
function notify(t, s, b){ try{ $notification.post(t, s, b); }catch(e){} }

function main(){
  var url = $request.url;
  var method = ($request.method||'GET').toUpperCase();
  var host = (url.match(/^https?:\/\/([^\/]+)/i)||[])[1]||'';
  log(method + " " + url);

  if(!/(^|\.)xmind\.(com|cn)$/i.test(host)){ $done({}); return; }

  // ===== 无条件伪造 appstore/sub =====
  if(/\/_res\/appstore\/sub(\?|$)/.test(url)){
    var body = JSON.stringify({"_code":200,"plan":"ProPlus","isActive":true,"expireDate":4092599349,"status":"active","productId":"net.xmind.brownieapp.proplus.yearly","sign":"PROPLUS_UNLOCKED"});
    var hd = {'Content-Type':'application/json'};
    notify("Xmind v5 命中","appstore/sub 已伪造","✅ 脚本已执行");
    log("appstore/sub FORGED");
    $done({status:200, headers:hd, body:body});
    return;
  }

  if(!$response || typeof $response.body !== 'string' || !$response.body.length){ $done({}); return; }
  var parsed=null;
  try{ parsed=JSON.parse($response.body); }catch(e){ log("not json: "+$response.body.length+"b"); $done({}); return; }
  var result=parsed;

  var hit = false;
  if(/\/_res\/user_sub_details(\?|$)/.test(url)){
    if(result && typeof result==='object'){
      ["appstore","google","official_website","appStore"].forEach(function(ak){
        if(Array.isArray(result[ak])){
          result[ak].push({plan:"ProPlus",isActive:true,expireDate:4092599349,productId:"net.xmind.brownieapp.proplus.yearly",status:"active",sign:"PROPLUS_UNLOCKED"});
        }
      });
      if(result._code===undefined) result._code=200;
      result.sign="PROPLUS_UNLOCKED";
    }
    hit=true;
  } else if(/\/_api\/appstore\/active(\?|$)/.test(url)){
    if(result && typeof result==='object'){
      result.status="proplus"; result.subscriptionStatus="ACTIVE"; result.expireTime=4092599349; result.bindXmind=1;
      result.sign="PROPLUS_UNLOCKED";
    }
    hit=true;
  } else if(/\/_res\/devices(\?|$)/.test(url)){
    if(result && typeof result==='object' && result.license){
      result.license.status="ProPlus"; result.license.expireTime=4092599349; result.sign="PROPLUS_UNLOCKED";
    }
    hit=true;
  } else if(/\/_res\/session(\?|$)/.test(url)){
    result.sign="PROPLUS_UNLOCKED"; hit=true;
  }

  if(hit){
    var nb = JSON.stringify(result);
    var h2 = {};
    var rh = $response.headers||{};
    for(var k in rh){ if(Object.prototype.hasOwnProperty.call(rh,k)) h2[k]=rh[k]; }
    h2['Content-Type']='application/json';
    h2['X-Unlocked']='v5';
    notify("Xmind v5 命中", url.replace(/https?:\/\//,''), "✅ 已改写响应");
    log("REWRITTEN -> "+nb);
    $done({headers:h2, body:nb});
  } else {
    $done({});
  }
}

try{ main(); }catch(e){ log("err "+e.message); try{$done({});}catch(_){} }
