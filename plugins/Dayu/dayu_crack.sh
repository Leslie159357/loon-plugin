#!/bin/sh
# 🐟 鱼吃鱼 (Dayu) 破解脚本 - for iSH Shell
# 用法: 
#   1. 在微信里打开鱼吃鱼
#   2. 运行本脚本，输入抓包工具中看到的auth响应里的token
#   3. 脚本自动发送修改请求

echo "=== 🐟 鱼吃鱼 资源修改器 ==="

# 输入token
echo "请从抓包中复制新token:"
read -r TOKEN

if [ -z "$TOKEN" ]; then
  echo "❌ token不能为空"
  exit 1
fi

FULL_TOKEN="Bearer $TOKEN"
UID="6a36db722ec728c57f89faec"
USERID="161344103"
NOW=$(date +%s)

echo ""
echo "使用 UID: $UID"
echo ""

# ====== 修改函数 ======
modify_resource() {
  local count=$1
  local body="{\"uid\":\"$UID\",\"update_resource\":[{\"goods_key\":\"diamond_old\",\"type\":999,\"id\":1001,\"count\":$count}],\"iid\":$NOW}"
  
  # 计算 sign (需要JS环境)
  echo "需安装 nodejs 计算 sign..."
  echo "body: $body"
}

echo "⚠️ 此游戏需要正确的 sign 签名才能修改"
echo ""
echo "解决方案:"
echo "1. 安装 nodejs: apk add nodejs"
echo "2. 写一个脚本来模拟Unity WebGL的签名算法"
echo "   或直接反编译 WASM 获取签名函数"
echo ""
echo "当前已知sign算法不在JS中, 在WebAssembly(WASM)中"
echo "需要从 wasm 反编译出签名函数"

echo ""
echo "备用方案 - 手动执行原始抓包重放:"
echo "curl -X POST https://prod-dayu.lanfeitech.com/api/user/update_user_resource \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'authorization: Bearer <TOKEN>' \\"
echo "  -H 'sign: <需要正确计算的MD5>' \\"
echo "  -H 'time: <timestamp>' \\"
echo "  -d '{\"uid\":\"$UID\",\"update_resource\":[{\"goods_key\":\"diamond_old\",\"type\":999,\"id\":1001,\"count\":999999}],\"iid\":$NOW}'"
