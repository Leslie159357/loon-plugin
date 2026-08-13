# Echo Loop 订阅解锁

## App

**Echo Loop** — 科学高效的 AI 英语听说训练 App
Bundle ID: `top.echo-loop` · v1.0.24+

## 解锁内容

✅ Premium（AI 翻译、AI 词典、AI 句子解析、AI 意群划分）
✅ 无限 AI 学习额度
✅ 全部付费功能

## 原理（v1.0.29 起）

判定链（源码确认，[echo-loop/Echo-Loop](https://github.com/echo-loop/Echo-Loop) 开源）：

- **唯一权威源 = 后端 `GET /api/entitlements`**（服务端合并 RevenueCat + Paddle 权益），响应 `{ isPremium, entitlementIds, productId, expiresAtMs, willRenew, source, purchaseType }`，2xx 即权威直接覆盖本地缓存
- RevenueCat 只负责购买流程，**不参与会员判定**（实测伪造 RC 缓存/事件全部无效）
- 本地缓存（Keychain secure_storage）仅离线兜底
- ⚠️ **匿名用户直接判 free**（`userId==null → Entitlement.free`）→ **必须先在 app 内登录账号**

插件双路劫持：
1. `echoloop_backend.js` — 伪造后端 `/api/entitlements` 响应为 premium（主方案）
2. `EchoLoop_RC.js` — RC 劫持（老版本兼容，保留）

## 文件说明

| 文件 | 用途 |
|------|------|
| `echoloop_backend.js` | 后端 `/api/entitlements` 响应伪造（新版主方案） |
| `EchoLoop_RC.js` | RC 劫持（老版本兼容） |
| `EchoLoop.plugin` | Loon 插件（双路，主推荐） |
| `EchoLoop_qx.conf` | Quantumult X 引用配置 |
| `EchoLoop_sg.sgmodule` | Surge 模块 |

## 安装（Loon）

1. 将 `echoloop_backend.js` + `EchoLoop_RC.js` 放入 Loon 的 `Scripts` 目录
2. 导入 `EchoLoop.plugin`
3. 开启 MITM，hostname 已自动添加 `api.revenuecat.com, www.echo-loop.top`
4. 安装并信任 CA 证书
5. **登录 Echo Loop 账号**（匿名用户不走后端判定，直接 free）
6. 打开 Echo Loop → 全部功能已解锁 ✅

## 安装（Quantumult X）

1. 将 `EchoLoop_RC.js` 放入 `Scripts` 目录
2. 复制 `EchoLoop_qx.conf` 内容到配置文件中
3. 开启 MITM，安装 CA 证书

## 安装（Surge）

1. 导入 `EchoLoop_sg.sgmodule`
2. 开启 MITM，安装 CA 证书

## 下载

[App Store](https://apps.apple.com/app/id6760324074)
