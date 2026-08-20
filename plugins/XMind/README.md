# XMind Pro+ Unlock (v2)

Xmind iOS (net.xmind.brownieapp) 会员解锁. 基于 v26.05.01100 (build 2756) 逆向 + 早期抓包修正.

## 原理
纯 Swift app + 后端判定会员 → Loon MITM 伪造会员响应。
针对端点注入 Pro 订阅，覆盖 `www.xmind.cn` / `app.xmind.com` / `app.xmind.cn`（地区分流）。

## 端点
| 端点 | 处理 |
|---|---|
| `/_res/user_sub_details` | 向 google/appstore/official_website 数组注入活跃 Pro 订阅 |
| `/_api/appstore/active` | `status→pro`, `subscriptionStatus→ACTIVE`, `expireTime→4092599349` |
| `/_res/appstore/sub` | 直接伪造成功响应（绕过 receipt) |
| `/_res/devices` | `license.status→Pro`, `expireTime→4092599349` |
| `/_res/session` | 通用锁定兜底 |
| 其他 /_res/ /_api/ /store/ | 通用递归改写（isPro*/isPremium→true 等） |

## 文件
- `Xmind_Pro_Unlock.plugin` — Loon 插件
- `xmind_unlock.js` — 改写脚本

## 使用
1. Loon → 插件 → 导入 `Xmind_Pro_Unlock.plugin`
2. 信任 CA 证书 + 开启 MitM
3. 重启 Xmind，检查 Pro 功能

## 边界
- 本地 Pro 门禁（主题/样式/导出）大概率解锁
- Xmind AI (Copilot) 走独立 `/api/xai/*` 后端，推理服务端权威，AI 内容可能仍需后端
