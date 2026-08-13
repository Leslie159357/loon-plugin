/*
DejaVocab Unlock v3.1 (dejavocab.cn 域名修复版)
解锁 VIP、语感网络、无限额度
修复: 域名 dejavocab.com -> dejavocab.cn（app 实际请求域名）
新增: verify-receipt / quota 接口伪造
作者: @Minis
版本: 3.1
日期: 2026-08-14
*/

const url = $request.url;
const body = $response.body;

try {
  let obj = JSON.parse(body);

  if (url.includes("/api/subscription/status/") || url.includes("/api/subscription/verify-receipt/")) {
    obj.is_premium = true;
    obj.subscription_type = "lifetime_ultra";
    obj.quota_limit = 999999;
    obj.quota_remaining = 999999;
    obj.end_date = "2099-12-31T23:59:59Z";
    obj.apple_product_id = "com.dejavocab.app.lifetime_ultra";
    obj.lifetime_member_number = "VIP-00001";
    obj.quota_info = { used: 0, total: 999999 };
    // 兼容可能的嵌套结构
    if (obj.data && typeof obj.data === "object") {
      obj.data.is_premium = true;
      obj.data.subscription_type = "lifetime_ultra";
    }
    if (obj.subscription && typeof obj.subscription === "object") {
      obj.subscription.type = "lifetime_ultra";
      obj.subscription.is_active = true;
    }
  }
  else if (url.includes("quota")) {
    obj.is_premium = true;
    obj.quota_limit = 999999;
    obj.quota_remaining = 999999;
    obj.monthly_quota = 999999;
    obj.monthly_quota_used = 0;
    obj.remaining_quota = 999999;
    obj.subscription_type = "lifetime_ultra";
    if (obj.quota_info && typeof obj.quota_info === "object") {
      obj.quota_info.used = 0;
      obj.quota_info.total = 999999;
      obj.quota_info.limit = 999999;
      obj.quota_info.remaining = 999999;
    }
    if (obj.data && typeof obj.data === "object") {
      obj.data.quota_remaining = 999999;
      obj.data.quota_limit = 999999;
    }
  }
  else if (url.includes("/api/user-profile/") || url.includes("/api/account/")) {
    obj.is_paid = true;
    obj.is_premium = true;
    obj.subscription_type = "ultra";
    obj.subscription_display = "Ultra";
  }
  else if (url.includes("/api/colbert/")) {
    obj.feature_locked = false;
    obj.is_complete = true;
    obj.indexed_phrases = 9999;
    obj.success = true;
    obj.error = "";
    obj.message = "Index built successfully";
  }
  else if (url.includes("/api/user-phrases/")) {
    obj.feature_locked = false;
    obj.similar_phrases_locked = false;
  }

  $done({ body: JSON.stringify(obj) });

} catch(e) {
  $done({ body: body });
}
