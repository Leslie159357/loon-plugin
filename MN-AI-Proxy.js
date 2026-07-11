// MN AI Proxy for Loon
// Intercept MarginNote AI → forward to OpenCode API

const proxyHost = "173.254.212.158";
const proxyPort = "58080";
const apiKey = "sk-p9eY4Rnr5UaOzB55GFKRZ3dqD6sBoRFt0u9XkM0EI9LNk2Yun6W6ox4AbfDUoX40";

// Read body from $request.body (string in Loon scripts)
var bodyStr = typeof $request.body === "string" ? $request.body : JSON.stringify($request.body || {});

// Change stream:true to stream:false for non-streaming response
try {
  var bodyObj = JSON.parse(bodyStr);
  if (bodyObj.stream === true) {
    bodyObj.stream = false;
  }
  bodyStr = JSON.stringify(bodyObj);
} catch(e) {
  // If parsing fails, use original body
  console.log("MN Proxy: body parse error, using original");
}

// Build target URL - send to our proxy
var targetUrl = "http://" + proxyHost + ":" + proxyPort + "/api/v3/chat/completions";

console.log("MN Proxy: forwarding " + bodyStr.length + " bytes");

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
    console.log("MN Proxy error: " + JSON.stringify(err));
    $done({ status: 502 });
    return;
  }
  $done({
    status: resp.status || 200,
    headers: resp.headers || {},
    body: data || ""
  });
});
