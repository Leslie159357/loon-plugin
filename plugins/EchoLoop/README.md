# EchoLoop Premium 解锁（Loon 插件）

解锁 EchoLoop（英语学习 app，bundle id: `top.echo-loop`）的 Premium 功能：音频转写、逐句翻译、AI 句子分析、查词、发音评估。

## 原理

EchoLoop 是 Flutter app，付费判定**完全在后端 API**（`www.echo-loop.top`，dio 直连）：

- RevenueCat（App Store 内购）只负责购买流程，**不参与会员判定**——已实测伪造 RevenueCat 缓存/事件/customerInfo 全部无效
- 客户端无本地 entitlement 缓存（UserDefaults / SQLite / 文件均无）
- 判定源：`/api/entitlements`、`/api/v1/client/config` 等后端接口

因此唯一的解锁路径是 **Loon MITM 伪造后端响应**（dio 走 dart:io socket，但 TLS 信任系统 CA，Loon TUN + MITM 可解密）。

## 安装

1. Loon → 插件 → 添加插件：https://raw.githubusercontent.com/Leslie159357/loon-plugin/main/plugins/EchoLoop/EchoLoop.plugin
2. Loon → 设置 → MitM：确认 `www.echo-loop.top` 已加入 hostname（插件自动 %APPEND%），安装并**完全信任** CA 证书（设置 → 通用 → 关于本机 → 证书信任设置）
3. 打开 EchoLoop，Premium 功能应解锁

## 抓包（如果未生效）

当前脚本是**通用注入**（entitlements.active/all 注入 premium + 布尔字段强制 true），后端真实响应结构尚未确认。若未生效：

1. Loon → 请求记录，筛选 `echo-loop.top`
2. 复制含 `entitlement / config / plan / premium` 的请求与响应
3. 反馈到仓库 issue，按真实结构精调注入逻辑

## 已知侦察记录

| 层 | 结论 |
|---|---|
| RevenueCat 插件层（purchases_flutter 5.x） | 伪造 `Purchases-CustomerInfoUpdated` 事件 10+ 次成功，无效 |
| RevenueCat 本地缓存（UserDefaults） | 伪造 `com.revenuecat.userdefaults.purchaserInfo.*` 为 premium JSON，SDK 接受，无效 |
| NSUserDefaults / sqflite / 文件 | 无 entitlement 缓存 |
| 后端 API | **唯一判定源** |

## 文件

- `EchoLoop.plugin` — Loon 插件
- `echoloop.js` — 响应注入脚本
