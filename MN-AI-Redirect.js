// MN AI Redirect - Loon script
// Intercept MarginNote AI requests and redirect to OpenCode API

const proxyUrl = "http://173.254.212.158:58080/api/v3/chat/completions";
const myKey = "sk-p9eY4Rnr5UaOzB55GFKRZ3dqD6sBoRFt0u9XkM0EI9LNk2Yun6W6ox4AbfDUoX40";

// Read the original request body
let body = $request.body || "";

// Create a new request to the proxy
const req = {
  url: proxyUrl,
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + myKey,
    "User-Agent": "Mozilla/5.0 (compatible; MNProxy/1.0)"
  },
  body: body
};

// Use Loon's $task.fetch API
$task.fetch(req).then(resp => {
  $done({
    status: resp.status,
    headers: resp.headers,
    body: resp.body
  });
}).catch(err => {
  console.log("MN Proxy Error: " + JSON.stringify(err));
  $done({status: 502});
});
