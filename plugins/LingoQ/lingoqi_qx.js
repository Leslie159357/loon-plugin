// LingoQ VIP Unlock - MITM Script
// QX & Loon 通用
// 基于 IPA v2.2.0 (build 2026051501) 静态分析
// Bundle ID: com.lingoq.ios.lingeqi

// =============================================
// 配置区 - 如需修改可在此调整
// =============================================

// 强制 VIP 字段值
const VIP_CONFIG = {
    // 订阅/会员状态
    isVip: true,
    is_vip: true,
    vip: true,
    vipStatus: 1,
    vip_status: 1,
    memberStatus: 1,
    member_status: 1,
    membershipStatus: 1,
    membership_status: 1,
    isMember: true,
    is_member: true,
    isPremium: true,
    is_premium: true,
    isPro: true,
    is_pro: true,
    isSubscriber: true,
    is_subscriber: true,
    subscriber: true,
    subscriptionStatus: "active",
    subscription_status: "active",
    status: "active",
    
    // 到期时间 (2099-12-31)
    expireDate: "2099-12-31T23:59:59Z",
    expire_date: "2099-12-31T23:59:59Z",
    expiryDate: "2099-12-31T23:59:59Z",
    expiry_date: "2099-12-31T23:59:59Z",
    expirationDate: "2099-12-31T23:59:59Z",
    expiration_date: "2099-12-31T23:59:59Z",
    vipExpireDate: "2099-12-31T23:59:59Z",
    vip_expire_date: "2099-12-31T23:59:59Z",
    vipEndDate: "2099-12-31T23:59:59Z",
    vip_end_date: "2099-12-31T23:59:59Z",
    
    // 时间戳
    expireTimestamp: 4102444799,
    expire_timestamp: 4102444799,
    expiryTimestamp: 4102444799,
    expiry_timestamp: 4102444799,
    vipEndTimestamp: 4102444799,
    vip_end_timestamp: 4102444799,
    vipEndUts: 4102444799000,
    vip_end_uts: 4102444799000,
    
    // 付费状态
    hasPurchased: true,
    has_purchased: true,
    hasBought: true,
    has_bought: true,
    isPaid: true,
    is_paid: true,
    paid: true,
    payed: true,
    purchased: true,
    
    // 商品相关
    isFree: true,
    is_free: true,
    price: 0,
    priceOrigin: 0,
    price_origin: 0,
    originalPrice: 0,
    original_price: 0,
    
    // 其他
    isTrial: false,
    is_trial: false,
    isExpired: false,
    is_expired: false,
    isCancelled: false,
    is_cancelled: false,
    autoRenew: true,
    auto_renew: true,
    canTrial: false,
    can_trial: false,
    trialPeriod: false,
    trial_period: false,
    
    // 数量类 - 无限
    balance: 999999,
    credit: 999999,
    credits: 999999,
    coin: 999999,
    coins: 999999,
    gems: 999999,
    diamond: 999999,
    diamonds: 999999,
    points: 999999,
    score: 999999,
    trophy: 999999,
    trophy_num: 999999,
    flower: 999999,
    heart: 999999,
    energy: 999999,
    star: 999999,
    stars: 999999,
};

// VIP相关Key名（递归匹配用）
const VIP_KEYS = [
    'vip', 'member', 'subscription', 'premium', 'pro', 'subscriber',
    'paid', 'payed', 'purchased', 'bought',
    'expire', 'expiry', 'expiration',
    'trial', 'auto_renew', 'autoRenew',
    'is_free', 'isFree',
    'balance', 'credit', 'coin', 'gem', 'diamond', 'trophy',
    'flower', 'heart', 'energy', 'star', 'point', 'score',
    'entitlement', 'entitle',
    'privilege', 'right',
    'apple_order', 'appleOrder',
    'receipt', 'verify',
    'codeRedemption', 'redemption',
];

// 需要拦截的路径关键词
const TARGET_PATHS = [
    'checkUserIsVipUrl', 'checkUserAppleOrder', 'verifyAppleReceipt',
    'goods/vip/ios', 'vip/subscribe', 'vip/actions/balance',
    'vip/rightsAndInterests', 'codeRedemption',
    'user/info', 'user/detail', 'user/profile',
    'member', 'subscription', 'subscribe',
];

// =============================================
// 核心逻辑
// =============================================

function shouldIntercept(url) {
    // 对 gate.lingoq.com 的所有请求都拦截
    // 默认拦截所有请求（由 hostname 过滤）
    return true;
}

function recursiveModify(obj, path = '') {
    if (obj === null || obj === undefined || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            obj[i] = recursiveModify(obj[i], path + '[' + i + ']');
        }
        return obj;
    }
    
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        const val = obj[key];
        const currentPath = path ? path + '.' + key : key;
        const keyLower = key.toLowerCase();
        
        // 检查是否匹配VIP配置
        if (VIP_CONFIG.hasOwnProperty(key)) {
            console.log('[LingoQ] ✅ 修改: ' + currentPath + ' = ' + JSON.stringify(VIP_CONFIG[key]));
            obj[key] = VIP_CONFIG[key];
            continue;
        }
        
        // 数字 0/1 布尔类字段泛匹配
        if (val === false || val === 0) {
            for (const vipKey of VIP_KEYS) {
                if (keyLower.includes(vipKey.toLowerCase())) {
                    if (typeof val === 'boolean') {
                        console.log('[LingoQ] ✅ 泛匹配布尔: ' + currentPath + ' = true');
                        obj[key] = true;
                    } else if (typeof val === 'number') {
                        console.log('[LingoQ] ✅ 泛匹配数字: ' + currentPath + ' = 1');
                        obj[key] = 1;
                    }
                    break;
                }
            }
        }
        
        // 数字 0 泛匹配余额类
        if (val === 0 && typeof val === 'number') {
            for (const balKey of ['balance', 'credit', 'coin', 'gem', 'diamond', 'trophy', 'flower', 'heart', 'energy', 'star', 'point', 'score']) {
                if (keyLower.includes(balKey)) {
                    console.log('[LingoQ] ✅ 泛匹配余额: ' + currentPath + ' = 999999');
                    obj[key] = 999999;
                    break;
                }
            }
        }
        
        // 递归遍历对象
        if (typeof val === 'object') {
            obj[key] = recursiveModify(val, currentPath);
        }
    }
    return obj;
}

// QX hook: 响应拦截
if (typeof $response !== 'undefined' && $response.body) {
    try {
        let body = JSON.parse($response.body);
        if (typeof body === 'object') {
            const url = $request.url || '';
            console.log('[LingoQ] 拦截: ' + url);
            if (!shouldIntercept(url)) {
                $done({});
                return;
            }
            body = recursiveModify(body);
            $done({ body: JSON.stringify(body) });
        } else {
            $done({});
        }
    } catch (e) {
        console.log('[LingoQ] JSON解析失败: ' + e);
        $done({});
    }
} else {
    $done({});
}
