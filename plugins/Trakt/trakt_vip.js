// Trakt VIP 解锁 - 响应伪造脚本
// 拦截 api.trakt.tv 用户资料响应,伪造 vip 字段
// 判定链: 服务器用户资料 vip:true → 客户端同步 UserDefaults userSettingIsVIP → isVIP
// 端点: GET /users/me (用户资料), GET /users/me/settings (设置)
// 说明: Trakt 的 isVIP 从本地 UserDefaults 读,该值由服务器用户资料同步而来,
//       伪造服务器响应即让同步值变为 true,实现解锁。

// 需要伪造的字段 (User 模型 JSON keys):
//   vip: true / vip_ep: true / vip_years: 大数值 / vip_cover_image: 图片URL

const VERSION = "1.0.0";
const TAG = "TraktVIP";

function log(msg) {
    if (typeof $notification !== "undefined") { /* noop */ }
}

// 深拷贝修改:在 JSON 中设置 vip 相关字段
function forgeVip(obj) {
    if (!obj || typeof obj !== "object") return obj;

    // 顶层用户对象: {vip: false, vip_ep: false, ...}
    if ("vip" in obj || "vip_ep" in obj || "username" in obj) {
        if (obj.vip === false || obj.vip === 0 || obj.vip === undefined) {
            obj.vip = true;
        }
        if (obj.vip_ep === false || obj.vip_ep === undefined) {
            obj.vip_ep = true;
        }
        if (typeof obj.vip_years !== "number" || obj.vip_years < 10) {
            obj.vip_years = 99;
        }
        if (!obj.vip_cover_image) {
            obj.vip_cover_image = "https://walter.trakt.tv/images/vip/2025/large.jpg";
        }
        // 旧版字段
        if (obj.vipOg === false || obj.vipOg === undefined) obj.vipOg = true;
    }

    // 嵌套 user 字段 (如 settings 响应里的 user 对象)
    if (obj.user && typeof obj.user === "object") forgeVip(obj.user);

    // 通用:递归遍历一层常用容器
    for (const k of ["data", "account", "profile"]) {
        if (obj[k] && typeof obj[k] === "object") forgeVip(obj[k]);
    }
    return obj;
}

let body = $response.body;
if (body && body.length > 0) {
    try {
        let json = JSON.parse(body);
        forgeVip(json);
        body = JSON.stringify(json);
    } catch (e) {
        // 非 JSON 直通
    }
}

$done({ body });
