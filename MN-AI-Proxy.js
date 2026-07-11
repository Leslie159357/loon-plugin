// MN AI Proxy v5 - let Loon redirect the request to our VPS
const vps = "173.254.212.158:443";
const apiKey = "sk-p9eY4Rnr5UaOzB55GFKRZ3dqD6sBoRFt0u9XkM0EI9LNk2Yun6W6ox4AbfDUoX40";
var url = $request.url || "";
var path = url.includes("?") ? url.substring(url.indexOf("/", 8)) : url.substring(url.indexOf("/", 8));
$done({ url: "http://" + vps + path, headers: { "Host": vps, "Authorization": "Bearer " + apiKey, "User-Agent": "Mozilla/5.0", "Content-Type": "application/json" } });
