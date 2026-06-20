/*
 * 🐟 鱼吃鱼 (大鱼/Dayu) — Quantumult X 破解脚本 v2
 */

const DIAMOND_COUNT = 99999;
const FISH_IDS = [11001, 11002, 11003, 11004, 11005, 11006, 11007, 11008, 11009, 11010, 11011, 11012];

const url = $request.url;
let body = JSON.parse($request.body || '{}');

try {
  if (url.includes('/api/user/update_user_resource')) {
    const now = Math.floor(Date.now() / 1000);
    if (body.update_resource && Array.isArray(body.update_resource)) {
      body.update_resource.forEach(r => {
        if (r.goods_key === "diamond_old" || r.id === 1001) {
          r.count = DIAMOND_COUNT;
        }
      });
    }
    body.iid = now;
  } else if (url.includes('/api/user/update_fish_fragment')) {
    const now = Math.floor(Date.now() / 1000);
    body.fish_tb = FISH_IDS.map(id => ({id, count: 1}));
    body.ts = now;
  } else if (url.includes('/api/user/update_user_goods')) {
    const now = Math.floor(Date.now() / 1000);
    body.update_goods = [{id: 1001, count: 999}];
    body.iid = now;
  } else {
    $done({});
  }
  
  // 保持原始 sign 和 time 不修改
  // 如果服务端强制校验 sign，这里会失败
  // 此时需要换策略：保留原始 time，让 sign 也保持不变
  
  $done({body: JSON.stringify(body)});
} catch (e) {
  $done({});
}
