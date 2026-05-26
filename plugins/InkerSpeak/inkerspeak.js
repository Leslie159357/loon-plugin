// InkerSpeak (引客英语 / 造句说) Premium Unlock v1.4
// API: yinke.jinguizi07.cn - 全部明文JSON ✅ 无签名验证

const url = $request.url;
const method = $request.method;
const body = $response.body;

if (!url.includes('yinke.jinguizi07.cn')) {
  $done({ body });
  return;
}

let obj;
try {
  obj = JSON.parse(body);
} catch(e) {
  $done({ body });
  return;
}

let modified = false;

// helper: unlock isVip in array
function unlockVIPinArray(arr) {
  if (!Array.isArray(arr)) return false;
  let count = 0;
  for (const item of arr) {
    if (item && typeof item === 'object' && item.isVip === true) {
      item.isVip = false;
      count++;
    }
  }
  if (count > 0) console.log(`解锁 ${count} 个VIP项目`);
  return count > 0;
}

// helper: set premium fields
function setPremium(d) {
  if (!d || typeof d !== 'object') return false;
  d.memberType = 'premium';
  d.isMember = true;
  d.membershipEndDate = 4092599349000;
  d.membershipStartDate = Date.now();
  d.remainingTimeQuota = 999999;
  return true;
}

// 1. Apple登录 → premium
if (url.includes('/api/auth/apple-login')) {
  if (obj.data) {
    setPremium(obj.data);
    modified = true;
    console.log('登录 → premium');
  }
}

// 2. user-info → premium
if (url.includes('/api/user/user-info')) {
  if (obj.data) {
    setPremium(obj.data);
    modified = true;
    console.log('user-info → premium');
  }
}

// 3. story-series 所有接口 (card, browsing-history等)
if (url.includes('/api/story-series/')) {
  // data是数组 (card, browsing-history)
  if (Array.isArray(obj.data)) {
    if (unlockVIPinArray(obj.data)) modified = true;
  }
  // data对象里嵌套数组
  if (obj.data && typeof obj.data === 'object') {
    for (const key of ['page', 'content', 'stories', 'items', 'list', 'records']) {
      if (Array.isArray(obj.data[key])) {
        if (unlockVIPinArray(obj.data[key])) modified = true;
      }
    }
  }
}

// 4. distribution/summary → 金币
if (url.includes('/api/distribution/summary')) {
  if (obj.data && typeof obj.data === 'object') {
    obj.data.flowCoins = 99999;
    modified = true;
    console.log('flowCoins → 99999');
  }
}

// 5. distribution/exchange/membership → 流币足够
if (url.includes('/api/distribution/exchange/membership')) {
  if (!obj.success) {
    obj.code = 200;
    obj.success = true;
    obj.data = { flowCoins: 99999 };
    obj.message = '操作成功';
    modified = true;
    console.log('exchange/membership → 伪造成功');
  }
}

// 6. video-segments → 内容无VIP限制 (确认没有isVip字段)
// 但可以确保page.content正常返回

$done({ body: JSON.stringify(obj) });
