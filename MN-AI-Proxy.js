// MN AI Proxy for Loon
// Intercept MarginNote AI requests → forward to OpenCode API

const proxyHost = "173.254.212.158";
const proxyPort = "58080";
const apiKey = "sk-p9eY4Rnr5UaOzB55GFKRZ3dqD6sBoRFt0u9XkM0EI9LNk2Yun6W6ox4AbfDUoX40";

// Read the original request
const url = $request.url;
const method = $request.method;
const headers = $request.headers;
const body = $request.body;

// Build target URL - replace host with our proxy
const targetUrl = "http://" + proxyHost + ":" + proxyPort + "/api/v3/chat/completions";

// Forward the request with new API key
const opts = {
  url: targetUrl,
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + apiKey,
    "User-Agent": "Mozilla/5.0 (compatible; MNProxy/1.0)"
  },
  body: body
};

$httpClient.post(opts, function(err, resp, data) {
  if (err) {
    console.log("MN Proxy error: " + JSON.stringify(err));
    $done({ status: 502 });
    return;
  }
  $done({ status: resp.status, headers: resp.headers, body: data });
});
