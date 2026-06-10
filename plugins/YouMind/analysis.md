# YouMind (v2.1.7) 破解分析报告

## 基本信息

| 项目 | 值 |
|------|-----|
| 名称 | YouMind |
| Bundle ID | com.mindbicycle.YouMind |
| 版本 | 2.1.7 (build 1) |
| iOS 最低 | 18.0 |
| 架构 | React Native (Expo SDK 55) + Hermes 引擎 |
| 开发路径 | `/Users/liuziwei/Desktop/youmind/youmind-mobile/apps/mobile/` |
| IPA 大小 | ~54MB |
| 主二进制 | ~24MB (arm64) |
| ATS | NSAllowsArbitraryLoads = **false**, NSAllowsLocalNetworking = true |
| 付费 SDK | **自有付费墙**（无 RevenueCat/Superwall） |
| 分析工具 | Sentry + PostHog |

## API 架构

App 通过 `clawhub.ai` 作为业务网关进行所有 API 请求。

### 核心 API 域名
- **clawhub.ai** — 主要业务 API
- **cdn.gooo.ai** — 资源 CDN
- **cdn.hello-lucy.com** — 备用 CDN

### 关键 API 接口

#### 会员/订阅
| 路径 | 用途 |
|------|------|
| `/api/v1/getCurrentUser` | 获取当前用户信息（含会员状态） |
| `/api/v1/subscription/verifyTransaction` | 验证 App Store 订阅收据 |
| `/api/v1/user/patchUserName` | 更新用户名 |
| `/api/v1/user/patchUserAvatar` | 更新头像 |
| `/api/v1/user/deleteCurrentUser` | 删除账户 |

#### 积分系统
| 路径 | 用途 |
|------|------|
| `/api/v1/credit/getCreditAccount` | 获取积分账户 |
| `/api/v1/credit/getTotalBonusRedeem` | 获取积分奖励 |

## VIP/Pro 字段

付费相关关键字段:
- `isPro`, `isPremium`, `isSubscribed`, `hasSubscription`
- `tier`, `plan`, `status` (active/trial/expired)
- `expiresAt`, `expirationDate`, `credits`, `balance`

### Paywall 事件
- youmindPaywallShown
- youmindPaywallPurchaseSucceeded/Failed
- youmindPaywallRestoreSucceeded/Failed/Tapped
- youmindPaywallDismissed

## 破解方案

### ✅ MITM 插件方案（推荐）
React Native App，API 通过标准 HTTP(S)，MITM 可拦截并修改所有 API 响应。

**MITM 域名：** `clawhub.ai`

**拦截策略：**
1. `/api/v1/getCurrentUser` → 会员状态改为 active/pro
2. `/api/v1/subscription/verifyTransaction` → 返回成功
3. `/api/v1/credit/*` → 积分余额改为 99999
4. 递归泛匹配所有 VIP/Pro 字段

## 文件清单
- `youmind_qx.js` — 核心拦截脚本
- `youmind_qx.sgmodule` — QX 模块
- `youmind.plugin` — Loon 插件
- `youmind.stpl` — Stash 配置
- `README.md` — 使用说明
