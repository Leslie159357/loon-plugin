// InkerSpeak Premium Unlock v1.6
// API: yinke.jinguizi07.cn - 全部明文JSON ✅ 无签名验证

const url = $request.url;
const method = $request.method;
const body = $response.body;

if (!url.includes('yinke.jinguizi07.cn')) {
  $done({ body });
  return;
}

let obj;
try { obj = JSON.parse(body); } catch(e) { $done({ body }); return; }

let modified = false;

function unlockVIP(arr) {
  if (!Array.isArray(arr)) return false;
  let c = 0;
  for (const item of arr) {
    if (item && typeof item === 'object' && item.isVip === true) {
      item.isVip = false; c++;
    }
  }
  if (c > 0) console.log('解锁 ' + c + ' 个VIP');
  return c > 0;
}

function setPremium(d) {
  if (!d || typeof d !== 'object') return false;
  d.memberType = 'premium';
  d.isMember = true;
  d.membershipEndDate = 4092599349000;
  d.membershipStartDate = Date.now();
  d.remainingTimeQuota = 999999;
  return true;
}

if (url.includes('/api/auth/apple-login')) {
  if (obj.data && setPremium(obj.data)) { modified = true; console.log('登录->premium'); }
}

if (url.includes('/api/user/user-info')) {
  if (obj.data && setPremium(obj.data)) { modified = true; console.log('user-info->premium'); }
}

if (url.includes('/api/story-series/')) {
  if (Array.isArray(obj.data)) { if (unlockVIP(obj.data)) modified = true; }
  if (obj.data && typeof obj.data === 'object') {
    for (const k of ['page', 'content', 'stories', 'items', 'list', 'records']) {
      if (Array.isArray(obj.data[k]) && unlockVIP(obj.data[k])) modified = true;
    }
  }
  if (modified) console.log('story-series: VIP已解锁');
}

if (url.includes('/api/distribution/summary')) {
  if (obj.data && typeof obj.data === 'object') {
    obj.data.flowCoins = 99999; modified = true; console.log('flowCoins->99999');
  }
}

if (url.includes('/api/distribution/exchange/membership')) {
  obj.code = 200; obj.success = true; obj.data = { flowCoins: 99999 }; obj.message = '操作成功';
  modified = true; console.log('exchange/membership->伪造');
}

$done({ body: JSON.stringify(obj) });
