// MN AI Proxy v5 - redirect request to VPS
const vps = "173.254.212.158:443";
const key = "sk-p9eY4Rnr5UaOzB55GFKRZ3dqD6sBoRFt0u9XkM0EI9LNk2Yun6W6ox4AbfDUoX40";

var url = $request.url || "";
// Replace host with VPS IP
var newUrl = url.replace(/^https:\/\/([^\/]+)/i, "http://" + vps);

$done({
  url: newUrl,
  headers: {
    "Host": vps,
    "Authorization": "Bearer " + key,
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json"
  }
});
