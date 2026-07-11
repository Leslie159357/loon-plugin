// MN AI Redirect - marginote AI → OpenCode
const proxyAddr = "173.254.212.158:58080";
const targetURL = "http://" + proxyAddr + "/api/v3/chat/completions";

$httpClient.post(targetURL, $request.body, function(error, response, data) {
  if (error) {
    console.log("MN Proxy Error: " + error);
    $done({status: 502});
    return;
  }
  $done({status: response.status, headers: response.headers, body: data});
});
