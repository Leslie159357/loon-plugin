// InkerSpeak (引客英语 / 造句说) Premium Unlock v1.0
// API: yinke.jinguizi07.cn
// 全部明文JSON，无签名验证 ✅

const url = $request.url;
const method = $request.method;
const body = $response.body;

// Only handle yinke API
if (!url.includes('yinke.jinguizi07.cn')) {
  $done({ body });
  return;
}

let obj = JSON.parse(body);
let modified = false;

// 1. Login: memberType trial → premium, 延长到2099年
if (url.includes('/api/auth/apple-login') && method === 'POST') {
  if (obj.data?.memberType) {
    obj.data.memberType = 'premium';
    obj.data.isMember = true;
    obj.data.membershipEndDate = 4092599349000; // 2099年
    obj.data.membershipStartDate = Date.now();
    modified = true;
    console.log('InkerSpeak: 登录 → premium');
  }
}

// 2. user-info: trial → premium, remainingTimeQuota → 999999
if (url.includes('/api/user/user-info')) {
  if (obj.data?.memberType) {
    obj.data.memberType = 'premium';
    obj.data.isMember = true;
    obj.data.membershipEndDate = 4092599349000; // 2099年
    obj.data.membershipStartDate = Date.now();
    obj.data.remainingTimeQuota = 999999;
    modified = true;
    console.log('InkerSpeak: user-info → premium');
  }
}

// 3. story-series card: isVip true → false (解锁全部内容)
if (url.includes('/api/story-series/card/') || url.includes('/api/story-series/')) {
  const data = obj.data;
  if (Array.isArray(data)) {
    let count = 0;
    for (const item of data) {
      if (item.isVip === true) {
        item.isVip = false;
        count++;
      }
    }
    if (count > 0) {
      modified = true;
      console.log(`InkerSpeak: 解锁 ${count} 个VIP内容`);
    }
  } else if (data && typeof data === 'object') {
    // Also check nested data
    const items = data.page?.content || data.content || data.stories || data.items;
    if (Array.isArray(items)) {
      let count = 0;
      for (const item of items) {
        if (item.isVip === true) {
          item.isVip = false;
          count++;
        }
      }
      if (count > 0) {
        modified = true;
        console.log(`InkerSpeak: 解锁 ${count} 个VIP内容(嵌套)`);
      }
    }
  }
}

// 4. distribution/summary - unlock flow coins or premium features
if (url.includes('/api/distribution/summary')) {
  if (obj.data) {
    obj.data.flowCoins = 99999;
    modified = true;
    console.log('InkerSpeak: 设置flowCoins=99999');
  }
}

// 5. learning-tips - 可能包含VIP限制
if (url.includes('/api/learning-tips/')) {
  // 如果learning-tips有VIP限制，在这里解锁
  if (obj.data && typeof obj.data === 'object') {
    // 保持原样，学习提示通常不限制
  }
}

$done({ body: JSON.stringify(obj) });
