/*
 * 🐟 鱼吃鱼 (大鱼/Dayu) — Loon 破解脚本 v2
 * 
 * 原理: 拦截 update_user_resource / update_user_goods / update_fish_fragment
 * 的**响应**而不是请求，记录日志。然后尝试修改请求体。
 * 
 * 如果服务端不强制验证 sign，直接修改 body 也能成功。
 * 如果强制验证，则需改用 "在请求发出前注入原始抓包数据" 的方式。
 */

// 配置: 修改数值
const DIAMOND_COUNT = 99999;
const FISH_IDS = [11001, 11002, 11003, 11004, 11005, 11006, 11007, 11008, 11009, 11010, 11011, 11012];

// Loon 日志
function log(tag, msg) {
  if (typeof $console !== 'undefined' && $console.log) {
    $console.log(`[${tag}] ${msg}`);
  }
  if (typeof $notification !== 'undefined' && $notification.post) {
    $notification.post(tag, '', msg);
  }
}

/**
 * 修改 update_user_resource 请求体
 * body: {"uid":"...","update_resource":[{"goods_key":"diamond_old","type":999,"id":1001,"count":0}],"iid":...}
 */
function modifyResourceBody(body) {
  const obj = JSON.parse(body);
  const now = Math.floor(Date.now() / 1000);
  
  if (obj.update_resource && Array.isArray(obj.update_resource)) {
    // 修改所有资源的count
    obj.update_resource.forEach(r => {
      if (r.goods_key === "diamond_old" || r.id === 1001) {
        r.count = DIAMOND_COUNT;
        log('修改', `钻石: ${DIAMOND_COUNT}`);
      }
    });
  }
  
  obj.iid = now;
  return JSON.stringify(obj);
}

/**
 * 修改 update_fish_fragment 请求体  
 * body: {"uid":"...","fish_tb":[{"id":11004,"count":1}],"ts":...}
 */
function modifyFishBody(body) {
  const obj = JSON.parse(body);
  const now = Math.floor(Date.now() / 1000);
  
  obj.fish_tb = FISH_IDS.map(id => ({id, count: 1}));
  obj.ts = now;
  
  log('修改', `鱼碎片: ${FISH_IDS.length}种`);
  return JSON.stringify(obj);
}

// ====== 入口 ======
if (typeof $request !== 'undefined' && $request) {
  const url = $request.url || '';
  let body = $request.body || '';
  
  try {
    if (url.includes('/api/user/update_user_resource')) {
      const newBody = modifyResourceBody(body);
      log('鱼吃鱼', '资源请求已修改');
      $done({body: newBody});
    } else if (url.includes('/api/user/update_fish_fragment')) {
      const newBody = modifyFishBody(body);
      log('鱼吃鱼', '鱼碎片请求已修改');
      $done({body: newBody});
    } else if (url.includes('/api/user/update_user_goods')) {
      const obj = JSON.parse(body);
      const now = Math.floor(Date.now() / 1000);
      obj.update_goods = [{id: 1001, count: 999}];
      obj.iid = now;
      log('鱼吃鱼', '物品请求已修改');
      $done({body: JSON.stringify(obj)});
    } else {
      $done({});
    }
  } catch (e) {
    log('鱼吃鱼错误', e.message);
    $done({});
  }
}
