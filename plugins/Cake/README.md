# Cake (me.mycake) 会员解锁插件

Cake AI 英语学习 6.8.1 —— 后端 API 判定型 app（RN + Hermes + NitroIAP/StoreKit2 + 自家后端）。

## 判定链（逆向结论）

- IAP：OpenIAP + NitroIAP（react-native-nitro-iap，JSI 桥）→ **ObjC 层无 hook 点**，dylib 路线不可行
- 后端 API base：`https://d162pjbd816bzl.cloudfront.net/v18_prod`（CloudFront CDN，可能 CNAME 自 api.mycake.plus）
- 订阅接口：
  - `GET /v1/subscriptions/status/` ← UI 会员状态主来源
  - `GET /v1/subscriptions/entitlements/`
  - `POST /subscription/verifyReceipt`（App Store 收据验证）
  - `GET /subscription/config`、`POST /subscription/connect`、`/subscription/finishPurchase`
  - `GET /v2/main/subscription`
- JS 端状态字段（Hermes HBC 字符串池提取）：`isMembershipUser` / `isSubscribed` / `isMembershipFreeTrial` / `isMembershipSuspendedNow` / `membershipEndDate` / `hasMembership` / `isMembershipOnly` / `activeSubscriptions`
- 本地缓存：`getMembershipCache` / `clearMembership`（启动读取后由后端刷新）

## 使用方法

1. Loon → 插件 → 添加（本目录）→ 开启
2. 打开 Cake app，登录后进入会员页
3. **查看脚本日志**（Loon → 设置 → 脚本日志）：
   - `[Cake] RESP <url>` = 命中的接口
   - `[Cake] RAW <json>` = 真实响应（若没解锁，把 RAW 内容发我，我会精调字段）
   - `[Cake] FIX/HEUR/FAKED` = 已伪造的字段
4. 解锁成功 = 会员页显示 Plus / 功能解锁

## 迭代说明

v1 为"记录 + 试探伪造"版：只改 JSON 中**已存在**的布尔/日期字段（不新增字段，避免 Codable 解码破坏），启发式匹配 membership/subscription/premium 等关键词。

若 UI 未解锁，需要真实响应格式来精准伪造 —— 把脚本日志里 `[Cake] RAW` 行发回即可。
