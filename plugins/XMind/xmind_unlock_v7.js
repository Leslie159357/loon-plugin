// Xmind Unlock v7 - 终极通知诊断版
// 动作: 只要 www.xmind.cn 任何请求过 Loon 脚本就弹通知（http-request + http-response 双阶段）
// 用途: 确认 Loon 是否在这个域名上真正执行脚本。弹通知 = 脚本跑了；不弹 = 插件没生效
var VERSION = "XmindUnlock v7";

function notify(t, s, b){ try{ $notification.post(t, s, b); }catch(e){} }
function log(m){ console.log("["+VERSION+"] "+m); }
function host(u){ var m = u.match(/^https?:\/\/([^\/]+)/i); return m ? m[1].toLowerCase() : ''; }

function main(){
  var url = $request.url || '';
  var method = ($request.method || 'GET').toUpperCase();
  var h = host(url);
  log(method + " " + url);

  // 无条件弹通知（只要脚本被调用）
  notify("Xmind v7 脚本已运行", method + " " + url, "host=" + h + " | 脚本执行成功");

  // 只处理 xmind 域名
  if(!/(^|\.)xmind\.(com|cn)$/i.test(h)){
    $done({});
    return;
  }

  // === http-request 阶段（无 $response）=> 直接放行 ===
  if(typeof $response === 'undefined' || $response === null){
    $done({});
    return;
  }

  // === http-response 阶段 ===
  var body = $response.body;
  if(typeof body !== 'string' || !body.length){
    // 无 body（如 304）=> 放行
    $done({});
    return;
  }

  var json = null;
  try{ json = JSON.parse(body); }catch(e){
    log("not json " + body.length);
    $done({});
    return;
  }

  var out = json;
  var hit = false;

  if(/user_sub_details/.test(url)){
    ["appstore","google","official_website","appStore"].forEach(function(ak){
      if(out && Array.isArray(out[ak])){
        out[ak].push({plan:"proplus",isActive:true,expireDate:4092599349,productId:"net.xmind.brownieapp.proplus.yearly",status:"active",sign:"PROPLUS_UNLOCKED"});
        hit = true;
      }
    });
    if(out && typeof out === 'object'){ if(out._code===undefined) out._code=200; out.sign="PROPLUS_UNLOCKED"; }
  } else if(/appstore\/active/.test(url)){
    if(out && typeof out === 'object'){ out.status="proplus"; out.subscriptionStatus="ACTIVE"; out.expireTime=4092599349; out.bindXmind=1; out.sign="PROPLUS_UNLOCKED"; }
    hit = true;
  } else if(/\/_res\/devices/.test(url)){
    if(out && out.license){ out.license.status="proplus"; out.license.expireTime=4092599349; out.sign="PROPLUS_UNLOCKED"; }
    hit = true;
  } else if(/appstore\/sub/.test(url)){
    out = {"_code":200,"plan":"proplus","isActive":true,"expireDate":4092599349,"status":"active","productId":"net.xmind.brownieapp.proplus.yearly","sign":"PROPLUS_UNLOCKED"};
    hit = true;
  }

  if(hit){
    var nb = JSON.stringify(out);
    var hd = {};
    var rh = $response.headers || {};
    for(var k in rh){ if(Object.prototype.hasOwnProperty.call(rh,k)) hd[k]=rh[k]; }
    hd['X-Unlocked']='v7';
    log("REWRITE -> " + nb);
    $done({headers:hd, body:nb});
  } else {
    $done({});
  }
}

try{ main(); }catch(e){ log("err " + e.message); try{$done({});}catch(_){} }
