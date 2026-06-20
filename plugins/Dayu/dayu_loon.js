/*
 * 🐟 鱼吃鱼 (大鱼/Dayu) — Loon 破解脚本
 * 
 * 脚本功能: 拦截并修改资源请求 (update_user_resource/update_user_goods/update_fish_fragment)
 * 
 * 配置: 见 dayu_loon.conf
 * 
 * 作者: Minis AI
 * 日期: 2026-06-21
 */

// ====== 用户配置区 ======
const CONFIG = {
  // 修改 resource 数值 (diamond_old = 钻石)
  resource: {
    enable: true,
    diamond_count: 999999,    // 钻石数量
    // 可添加更多 resource 类型
    // gold_count: 999999,    // 金币
  },
  
  // 修改 goods 数值
  goods: {
    enable: true,
    items: [
      {id: 1001, count: 999}
    ]
  },
  
  // 修改 fish fragment (鱼碎片/鱼种)
  fish: {
    enable: true,
    // fish_tb id 对应不同的鱼种
    fish_ids: [
      11001, 11002, 11003, 11004, 11005, 11006,
      11007, 11008, 11009, 11010, 11011, 11012
    ]
  }
};

// ====== MD5 工具函数 ======
// 注意: Loon 内置不支持 MD5，需要注入或使用 CryptoJS
// 这里使用 $task.fetch 加载 CryptoJS，或直接用 Loon 的 $crypto.md5

/**
 * 计算 MD5 签名
 * Loon 自带 $crypto.md5 方法
 */
function md5(str) {
  // Loon 自带方法
  if (typeof $crypto !== 'undefined' && $crypto.md5) {
    return $crypto.md5(str).toString();
  }
  // 备用: 用 $task 加载 crypto-js
  return null;
}

/**
 * 重新计算 sign 并更新请求头
 * sign = md5(request_body)
 */
function recalculateSign(request, body) {
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
  const newSign = md5(bodyStr);
  if (newSign) {
    request.headers['sign'] = newSign;
  }
  return request;
}

/**
 * 修改 update_user_resource 请求
 */
function modifyResourceRequest(request, body) {
  const uid = body.uid;
  const timestamp = Math.floor(Date.now());
  
  const updateResources = [];
  
  // 钻石
  if (CONFIG.resource.enable && CONFIG.resource.diamond_count) {
    updateResources.push({
      goods_key: "diamond_old",
      type: 999,
      id: 1001,
      count: CONFIG.resource.diamond_count
    });
  }
  
  if (updateResources.length === 0) return {request, body};
  
  body.update_resource = updateResources;
  body.iid = timestamp;
  
  request = recalculateSign(request, body);
  
  return {request, body};
}

/**
 * 修改 update_user_goods 请求
 */
function modifyGoodsRequest(request, body) {
  if (!CONFIG.goods.enable || CONFIG.goods.items.length === 0) {
    return {request, body};
  }
  
  const timestamp = Math.floor(Date.now());
  
  body.update_goods = CONFIG.goods.items;
  body.iid = timestamp;
  
  request = recalculateSign(request, body);
  
  return {request, body};
}

/**
 * 修改 update_fish_fragment 请求
 */
function modifyFishRequest(request, body) {
  if (!CONFIG.fish.enable || CONFIG.fish.fish_ids.length === 0) {
    return {request, body};
  }
  
  const timestamp = Math.floor(Date.now());
  
  body.fish_tb = CONFIG.fish.fish_ids.map(id => ({
    id: id,
    count: 1
  }));
  body.ts = timestamp;
  
  request = recalculateSign(request, body);
  
  return {request, body};
}

// ====== Loon 主入口 ======
/**
 * Loon Script 入口
 * 需要配置: 
 * [Script]
 * http-response ^https?://prod-dayu\.lanfeitech\.com/api/user/(update_user_resource|update_user_goods|update_fish_fragment) script-path=dayu_loon.js, requires-body=true, tag=鱼吃鱼-资源修改
 */
if (typeof $request !== 'undefined' && $request) {
  let body = JSON.parse($request.body || '{}');
  let request = $request;
  let result;
  
  const url = $request.url || '';
  
  if (url.includes('/api/user/update_user_resource')) {
    result = modifyResourceRequest(request, body);
  } else if (url.includes('/api/user/update_user_goods')) {
    result = modifyGoodsRequest(request, body);
  } else if (url.includes('/api/user/update_fish_fragment')) {
    result = modifyFishRequest(request, body);
  } else {
    result = {request, body};
  }
  
  // 更新请求体
  const newBody = JSON.stringify(result.body);
  result.request.body = newBody;
  
  if (typeof $done !== 'undefined') {
    $done({body: newBody, headers: result.request.headers});
  }
}
