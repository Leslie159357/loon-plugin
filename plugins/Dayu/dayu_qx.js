/*
 * 🐟 鱼吃鱼 (大鱼/Dayu) — Quantumult X 破解脚本
 * 
 * Quantumult X 使用 $task API + MITM
 * 通过 rewrite 拦截并修改请求
 */

// ====== 用户配置区 ======
const CONFIG = {
  // 修改 resource 数值 (钻石)
  resource: {
    enable: true,
    diamond_count: 999999,
  },
  
  // 修改 goods 数值
  goods: {
    enable: true,
    items: [
      {id: 1001, count: 999}
    ]
  },
  
  // 修改 fish fragment (鱼碎片)
  fish: {
    enable: true,
    fish_ids: [
      11001, 11002, 11003, 11004, 11005, 11006,
      11007, 11008, 11009, 11010, 11011, 11012
    ]
  }
};

// ====== MD5 工具 ======
// Quantumult X 可通过 CryptoJS 库计算 MD5
// 或者用 $task.fetch 请求自己的计算接口
// 这里因 QX 不支持 $crypto，我们使用内联的 MD5 实现

function md5(str) {
  // 简单的 MD5 实现 — 用 $task 加载 crypto-js 或使用原生
  // QX 需要额外支持，但多数 Loon 脚本作者直接使用 $cryptoAPI
  // 
  // 备用方案: 在配置中跳过 sign 校验（如果服务端不强制校验sign）
  // 或者用下面的方式
  return null; // 需要自行实现或使用 QX 的 crypto 库
}

function recalculateSign(headers, bodyStr) {
  const newSign = md5(bodyStr);
  if (newSign) {
    headers['sign'] = newSign;
  }
  return headers;
}

// ====== 请求修改逻辑 ======

function modifyUpdateResource(body) {
  const timestamp = Math.floor(Date.now() / 1000);
  
  body.update_resource = [{
    goods_key: "diamond_old",
    type: 999,
    id: 1001,
    count: CONFIG.resource.diamond_count
  }];
  body.iid = timestamp;
  
  return body;
}

function modifyUpdateGoods(body) {
  const timestamp = Math.floor(Date.now() / 1000);
  
  body.update_goods = CONFIG.goods.items;
  body.iid = timestamp;
  
  return body;
}

function modifyUpdateFish(body) {
  const timestamp = Math.floor(Date.now() / 1000);
  
  body.fish_tb = CONFIG.fish.fish_ids.map(id => ({
    id: id,
    count: 1
  }));
  body.ts = timestamp;
  
  return body;
}

// ====== Quantumult X 入口 ======

const url = $request.url;
let body = JSON.parse($request.body || '{}');

if (url.includes('/api/user/update_user_resource') && CONFIG.resource.enable) {
  body = modifyUpdateResource(body);
} else if (url.includes('/api/user/update_user_goods') && CONFIG.goods.enable) {
  body = modifyUpdateGoods(body);
} else if (url.includes('/api/user/update_fish_fragment') && CONFIG.fish.enable) {
  body = modifyUpdateFish(body);
} else {
  $done({});
}

const newBody = JSON.stringify(body);

// 重新计算 sign
let headers = {...$request.headers};
headers = recalculateSign(headers, newBody);

$done({body: newBody, headers: headers});
