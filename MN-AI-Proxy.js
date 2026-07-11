// MN AI Proxy for Loon
// Intercept MarginNote AI → forward to OpenCode API (non-streaming)

const proxyHost = "173.254.212.158";
const proxyPort = "58080";
const apiKey = "sk-p9eY4Rnr5UaOzB55GFKRZ3dqD6sBoRFt0u9XkM0EI9LNk2Yun6W6ox4AbfDUoX40";

// Parse and modify request body to use non-streaming
var bodyStr = $request.body || "{}";
try {
  var bodyObj = JSON.parse(bodyStr);
  bodyObj.stream = false;  // Force non-streaming for compatibility
  bodyStr = JSON.stringify(bodyObj);
} catch(e) {}

const targetUrl = "http://" + proxyHost + ":" + proxyPort + "/api/v3/chat/completions";

$httpClient.post({
  url: targetUrl,
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + apiKey,
    "User-Agent": "Mozilla/5.0"
  },
  body: bodyStr
}, function(err, resp, data) {
  if (err) {
    console.log("MN Proxy Error: " + JSON.stringify(err));
    $done({ status: 502 });
    return;
  }
  $done({
    status: resp.status || 200,
    headers: resp.headers || {},
    body: data || ""
  });
});
