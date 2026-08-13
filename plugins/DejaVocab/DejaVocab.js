/*
DejaVocab Unlock v4 (语法分析转发版)
- subscription/status 伪造 lifetime_ultra + 无限额度
- quota 接口伪造
- ★ 语法分析: 403 接口转发到免费 AI 接口 (ai/streaming/deja) + SSE 流转 JSON
作者: @Minis
版本: 4.0
日期: 2026-08-14
*/

const url = $request.url;
const method = $request.method;

// ============ http-request: 语法分析请求转发到 AI 接口 ============
if (method === 'POST' && url.includes('/api/grammar-analysis/')) {
  try {
    let body = JSON.parse($request.body || '{}');
    // AI 接口需要 word 参数：从句子提取第一个英文单词
    let m = (body.sentence || '').match(/[A-Za-z]+/);
    if (m) body.word = m[0];
    if (!body.native_language) body.native_language = 'zh';
    $done({
      url: 'https://dejavocab.cn/api/ai/streaming/deja/?from=grammar',
      headers: Object.assign({}, $request.headers, {
        'Content-Type': 'application/json',
        'X-DV-Forward': 'grammar'
      }),
      body: JSON.stringify(body)
    });
    return;
  } catch (e) {
    $done({});
    return;
  }
}

// ============ http-response: AI 转发响应 -> 语法分析 JSON ============
if (url.includes('/api/ai/streaming/deja/') && (url.includes('from=grammar') || ($request.headers && $request.headers['X-DV-Forward'] === 'grammar'))) {
  try {
    // 解析 SSE 流: data: {"content": "..."}
    let text = '';
    const lines = ($response.body || '').split('\n');
    for (const line of lines) {
      const m = line.match(/^data: (\{.*\})$/);
      if (m) {
        try {
          const obj = JSON.parse(m[1]);
          if (obj.content) text += obj.content;
        } catch (e) {}
      }
    }
    // 构造语法分析响应（结构化字段留空，文本用真实 AI 内容）
    const result = {
      success: true,
      analysisText: text,
      interpretedSyntax: text,
      grammarPoints: [],
      subjects: [],
      subject: null,
      subject_type: null,
      predicate: null,
      sentence_type: null,
      existingAnalysis: false,
      originalAnalysis: null
    };
    $done({ body: JSON.stringify(result) });
    return;
  } catch (e) {
    $done({ body: $response.body });
    return;
  }
}

// ============ http-response: 原有伪造逻辑 ============
try {
  let obj = JSON.parse($response.body);

  if (url.includes('/api/subscription/status/')) {
    obj.is_premium = true;
    obj.subscription_type = 'lifetime_ultra';
    obj.quota_limit = 999999;
    obj.quota_remaining = 999999;
    obj.end_date = '2099-12-31T23:59:59Z';
    obj.apple_product_id = 'com.dejavocab.app.lifetime_ultra';
    obj.lifetime_member_number = 'VIP-00001';
    obj.quota_info = { used: 0, total: 999999 };
    if (obj.data && typeof obj.data === 'object') {
      obj.data.is_premium = true;
      obj.data.subscription_type = 'lifetime_ultra';
    }
  }
  else if (url.includes('quota')) {
    obj.quota_used = 0;
    obj.quota_remaining = 999999;
    obj.monthly_quota_used = 0;
    obj.remaining_quota = 999999;
    if (obj.quota_info && typeof obj.quota_info === 'object') {
      obj.quota_info.used = 0;
      obj.quota_info.total = 999999;
    }
  }
  else if (url.includes('/api/rolling-translation/') || url.includes('/api/rolling-phrase-extraction/')) {
    // 翻译/短语响应的 quota_used 归零（UI 显示不涨）
    obj.quota_used = 0;
    if (obj.data && typeof obj.data === 'object') obj.data.quota_used = 0;
  }
  else if (url.includes('/api/user-profile/') || url.includes('/api/account/')) {
    obj.is_paid = true;
    obj.is_premium = true;
    obj.subscription_type = 'ultra';
  }
  else if (url.includes('/api/colbert/')) {
    obj.feature_locked = false;
    obj.is_complete = true;
    obj.indexed_phrases = 9999;
    obj.success = true;
    obj.error = '';
  }
  else if (url.includes('/api/user-phrases/')) {
    obj.feature_locked = false;
    obj.similar_phrases_locked = false;
  }

  $done({ body: JSON.stringify(obj) });

} catch(e) {
  $done({ body: $response.body });
}
