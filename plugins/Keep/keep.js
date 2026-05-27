/**
 * Keep Premium Unlock v2.0
 * App: Keep (com.gotokeep.keep) v9.0.20
 * 
 * 综合方案：JSON解析 + 字符串替换双保险
 * 拦截 api.gotokeep.com + kit.gotokeep.com 全路径
 * 
 * v2.0: 参考社区方案，扩充kit/athena/nuocha/gerudo路径拦截
 *       同时保留精确JSON替换避免误伤
 */

const body = $response.body;
const url = $request.url;

// ========== 字符串批量替换（全字段覆盖） ==========
let modified = body;

// 会员状态相关 — 通用无差别替换所有已知字段
modified = modified.replace(/"memberStatus":\d+/g, '"memberStatus":1');
modified = modified.replace(/"status":\w+/g, '"status":1');    // 所有status→1（包括未知字段）
modified = modified.replace(/"buttonText":".*?"/g, '"buttonText":""');
modified = modified.replace(/"hasPaid":\w+/g, '"hasPaid":true');
modified = modified.replace(/"downLoadAll":\w+/g, '"downLoadAll":true');
modified = modified.replace(/"videoTime":\d+/g, '"videoTime":0');
modified = modified.replace(/"startEnable":\w+/g, '"startEnable":true');
modified = modified.replace(/"preview":\w+/g, '"preview":false');
modified = modified.replace(/"limitFree":\w+/g, '"limitFree":true');
modified = modified.replace(/"limitCount":\d/g, '"limitCount":0');
modified = modified.replace(/"limitFreeType":"\w+/g, '"limitFreeType":""');
modified = modified.replace(/"free":\w+/g, '"free":true');
modified = modified.replace(/"member":\w+/g, '"member":true');
modified = modified.replace(/":false/g, '":true');          // 所有:false→:true

// 直播会员
modified = modified.replace(/"userLiveMemberStatus":\w+/g, '"userLiveMemberStatus":1');
modified = modified.replace(/"canWatchLive":\w+/g, '"canWatchLive":true');
modified = modified.replace(/"userMemberAutoRenew":\w+/g, '"userMemberAutoRenew":true');
modified = modified.replace(/"userUseLiveMemberRights":\w+/g, '"userUseLiveMemberRights":true');
modified = modified.replace(/"userLiveMemberExpireTime":\d/g, '"userLiveMemberExpireTime":0');

// 状态码
modified = modified.replace(/"errorCode":\d+/g, '"errorCode":0');
modified = modified.replace(/"code":\d+/g, '"code":200');
modified = modified.replace(/"username":".*?"/g, '"username":"VIP"');

// ========== 精确JSON字段替换（针对已知kprime接口） ==========
try {
    let obj = JSON.parse(modified);

    // /kprime/v1/auth
    if (obj && obj.data && obj.data.memberType && url.includes('/kprime/v1/auth')) {
        obj.data.memberType = "SENIOR";
        obj.data.membershipType = "ANNUAL_CARD";
        obj.data.status = 1;
        obj.data.statusTrack = "active";
        obj.data.paidStatus = 1;
        obj.data.paidStatusTrack = "paid";
        obj.data.autoRenew = true;
        obj.data.gmtExpire = 4070908800000;
        obj.data.gmtCurrentTypeExpire = 4070908800000;
        obj.data.gmtPaidTypeExpire = 4070908800000;
        obj.data.totalEffectiveDays = 99999;
        obj.data.currentEffectiveDays = 99999;
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // /kprime/v2/infoForClient
    if (url.includes('/kprime/v2/infoForClient')) {
        obj.data.primeStatus = "active";
        if (Array.isArray(obj.data.memberDTOList)) {
            obj.data.memberDTOList.forEach(m => {
                m.memberType = "SENIOR";
                m.membershipType = "ANNUAL_CARD";
                m.status = 1;
                m.statusTrack = "active";
                m.paidStatus = 1;
                m.paidStatusTrack = "paid";
                m.autoRenew = true;
                m.gmtExpire = 4070908800000;
            });
        }
        if (typeof obj.data.status === "string") {
            try {
                let s = JSON.parse(obj.data.status);
                for (let k in s) { if (s[k] === "expired") s[k] = "active"; }
                obj.data.status = JSON.stringify(s);
            } catch(e) {}
        }
        if (typeof obj.data.paidStatus === "string") {
            try {
                let s = JSON.parse(obj.data.paidStatus);
                for (let k in s) { if (s[k] === "none") s[k] = "paid"; }
                obj.data.paidStatus = JSON.stringify(s);
            } catch(e) {}
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // /kprime/v2/home/complete/tab
    if (url.includes('/kprime/v2/home/complete/tab') && !url.includes('/tab/exp')) {
        if (obj.data && obj.data.memberInfo) {
            obj.data.memberInfo.status = 1;
            obj.data.memberInfo.gmtExpire = 4070908800000;
        }
        if (obj.data) {
            obj.data.headCopy = "尊贵的 Keep 会员";
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // /agamotto-webapp/v1/coach/role/user
    if (url.includes('/agamotto-webapp/v1/coach/role/user')) {
        if (obj.data) obj.data.memberExclusive = true;
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // /kprime/v1/member/privilege
    if (url.includes('/kprime/v1/member/privilege')) {
        if (obj.data !== undefined) obj.data = true;
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // /kprime/v4/suit/sales/entrance
    if (url.includes('/kprime/v4/suit/sales/entrance')) {
        if (obj.data && obj.data.memberEntrance) {
            obj.data.memberEntrance.prime = true;
            obj.data.memberEntrance.memberStatus = 1;
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // /arke-webapp/v2/suit/smart/customize/preview
    if (url.includes('/arke-webapp/v2/suit/smart/customize/preview')) {
        if (obj.data) {
            if (obj.data.eventTrackInfo) {
                obj.data.eventTrackInfo.primeStatus = "active";
                obj.data.eventTrackInfo.isFree = 1;
            }
            if (obj.data.config) obj.data.config.memberStatus = 1;
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // 其他接口：走字符串替换结果
    $done({ body: modified });

} catch (e) {
    // JSON解析失败，用字符串替换结果
    $done({ body: modified });
}
