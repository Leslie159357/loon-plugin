/*
DejaVocab Unlock v3
解锁 VIP、语感网络、无限额度
修复: user-phrases/{id} similar_phrases_locked 未修改的问题
作者: @Minis
版本: 3.0
日期: 2026-05-24
*/

const url = $request.url;
const body = $response.body;

try {
  let obj = JSON.parse(body);

  if (url.includes("/api/subscription/status/")) {
    obj.is_premium = true;
    obj.subscription_type = "lifetime_ultra";
    obj.quota_limit = 999999;
    obj.quota_remaining = 999999;
    obj.end_date = "2099-12-31T23:59:59Z";
    obj.apple_product_id = "com.dejavocab.app.ultra_lifetime";
    obj.lifetime_member_number = "VIP-00001";
    obj.quota_info = { used: 0, total: 999999 };
  } 
  else if (url.includes("/api/user-profile/")) {
    obj.is_paid = true;
    obj.subscription_type = "ultra";
    obj.subscription_display = "Ultra";
  }
  else if (url.includes("/api/colbert/index-status/")) {
    obj.feature_locked = false;
    obj.is_complete = true;
    obj.indexed_phrases = 9999;
  }
  else if (url.includes("/api/colbert/build-index/")) {
    obj.feature_locked = false;
    obj.success = true;
    obj.error = "";
    obj.message = "Index built successfully";
  }
  else if (url.includes("/api/user-phrases/")) {
    // 统一处理所有 user-phrases 路径: 列表、详情、semantic-search
    obj.feature_locked = false;
    obj.similar_phrases_locked = false;
  }

  $done({ body: JSON.stringify(obj) });

} catch(e) {
  $done({ body: body });
}
