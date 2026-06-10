# YouMind (com.mindbicycle.YouMind) MITM Script v2.0

## 基于实际抓包数据修正
App 实际 API 域名是 **hello-lucy.com**（**不是** clawhub.ai）

## 安装链接
**QX 模块:**
```
https://raw.githubusercontent.com/Leslie159357/Loon-Plugins/refs/heads/master/plugins/YouMind/youmind_qx.sgmodule
```
**Loon 插件:**
```
https://raw.githubusercontent.com/Leslie159357/Loon-Plugins/refs/heads/master/plugins/YouMind/youmind.plugin
```

## MITM 域名
`hello-lucy.com`

## 抓包验证的接口
| 接口 | 修改内容 |
|------|---------|
| `/api/v1/getCurrentUser` | `space.status: "trialing" → "active"`，`trialExpiresAt → 2099` |
| `/api/v1/credit/getCreditAccount` | `productTier: "free" → "pro"`, `subTier: 1 → 999`, 积分余额→999999 |
| `/api/v1/subscription/findSubscription` | 强制返回有效订阅 |

## 使用说明
1. 安装模块/插件
2. 开启 MitM，确保 `hello-lucy.com` 在 MITM 主机名列表
3. **杀掉 App → 重新打开**（清除本地缓存）

## v1.0 → v2.0 变更
- ✅ 修复域名：`clawhub.ai` → `hello-lucy.com`
- ✅ 基于实际抓包 JSON 结构精准匹配字段
- ✅ 新增 `subscription/findSubscription` 接口处理
- ✅ 新增 `hasEverHadSubscription` 字段强制 true
- ✅ 新增 `productTier` 强制 pro
- ✅ 修复时间戳字段匹配
