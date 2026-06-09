// ==UserScript==
// @name         XMind Pro Unlock
// @namespace    https://github.com/Leslie159357/Loon-Plugins
// @version      1.0.0
// @description  XMind 思维导图 - 解锁 Pro/Subscription 会员
// @author       Leslie
// @icon         https://www.xmind.cn/favicon.ico
// @mitm         app.xmind.cn, app.xmind.com
// ==/UserScript==

// XMind subscription API endpoints:
//   /_res/appstore/sub        — 获取当前订阅状态
//   /_res/user_sub_details    — 用户订阅详情
//   /_api/appstore/active     — 激活的订阅信息
//   /_res/appstore/products   — 产品列表（商店页面）

const urlPattern = /^https:\/\/app\.xmind\.(cn|com)\//;

function modifySubscriptionResponse(body) {
    try {
        let obj = JSON.parse(body);
        
        // Generic recursive modifier - set all boolean/status fields to pro
        modifyJsonForPro(obj);
        
        return JSON.stringify(obj);
    } catch (e) {
        // If not JSON, return as-is
        return body;
    }
}

function modifyJsonForPro(obj) {
    if (obj === null || obj === undefined) return;
    
    if (Array.isArray(obj)) {
        obj.forEach(item => modifyJsonForPro(item));
        return;
    }
    
    if (typeof obj !== 'object') return;
    
    // Process all keys
    for (const key of Object.keys(obj)) {
        const val = obj[key];
        
        // Recursively process nested objects
        if (typeof val === 'object' && val !== null) {
            modifyJsonForPro(val);
        }
        
        // Key-based modifications
        const lowerKey = key.toLowerCase();
        
        // Boolean VIP/pro status fields
        if (typeof val === 'boolean') {
            if (lowerKey.includes('active') || 
                lowerKey.includes('pro') || 
                lowerKey.includes('vip') || 
                lowerKey.includes('premium') || 
                lowerKey.includes('member') || 
                lowerKey.includes('entitle') || 
                lowerKey.includes('subscription') || 
                lowerKey.includes('trial') ||
                lowerKey.includes('purchased') ||
                lowerKey.includes('valid') ||
                lowerKey.includes('unlock') ||
                lowerKey.includes('plus')) {
                obj[key] = true;
            }
        }
        
        // Number/string status fields
        if (key === 'status' || key === 'level' || key === 'plan') {
            if (val === 0 || val === 'none' || val === 'free' || val === 'basic') {
                obj[key] = (typeof val === 'number') ? 2 : 'premium';
            }
        }
        
        // Product plan
        if (key === 'planName' || key === 'plan_name' || key === 'productPlan' || key === 'product_plan') {
            obj[key] = 'Pro/Premium Plan';
        }
        
        // Expiration - set to far future
        if (lowerKey.includes('expire') || lowerKey.includes('expir') || lowerKey.includes('end') || lowerKey.includes('enddate') || lowerKey.includes('end_date')) {
            if (typeof val === 'number' || !isNaN(Number(val))) {
                obj[key] = 9999999999; // Far future timestamp
            }
        }
        
        // Dates
        if (lowerKey.includes('date') && typeof val === 'string' && val.includes('20')) {
            obj[key] = '2099-12-31T23:59:59Z';
        }
    }
}

$task.fetch({
    url: $request.url,
    method: $request.method,
    headers: $request.headers,
    body: $request.body
}).then(response => {
    let body = response.body;
    let url = $request.url;
    
    // Intercept subscription-related endpoints
    if (url.includes('/_res/appstore/sub') || 
        url.includes('/_res/user_sub_details') || 
        url.includes('/_api/appstore/active') ||
        url.includes('/_res/appstore/products')) {
        
        body = modifySubscriptionResponse(body);
        console.log(`XMind: Modified response for ${url}`);
    }
    
    $done({ status: response.statusCode, headers: response.headers, body: body });
}, reason => {
    $done({ status: 200, headers: {}, body: '{}' });
});
