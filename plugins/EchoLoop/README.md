# Echo Loop 订阅解锁

## App

**Echo Loop** — 科学高效的 AI 英语听说训练 App
Bundle ID: `top.echo-loop` · v1.0.24+

## 解锁内容

✅ Premium（AI 翻译、AI 词典、AI 句子解析、AI 意群划分）
✅ 无限 AI 学习额度
✅ 全部付费功能

## 原理

劫持 RevenueCat API `api.revenuecat.com/v1/subscribers/{id}` 响应，返回伪造的 `premium` entitlement（`is_active: true`）。App 使用 RevenueCat SDK 且 **未做 SSL Pinning**（`NSAllowsArbitraryLoads = true`），MITM 开箱即用。

> 该 App 源码完全开源（[echo-loop/Echo-Loop](https://github.com/echo-loop/Echo-Loop)），Entitlement identifier 已验证为 `premium`。

## 文件说明

| 文件 | 用途 |
|------|------|
| `EchoLoop_RC.js` | 核心劫持脚本（http-request 直接返回伪造数据） |
| `EchoLoop.plugin` | Loon 插件（主推荐） |
| `EchoLoop_qx.conf` | Quantumult X 引用配置 |
| `EchoLoop_sg.sgmodule` | Surge 模块 |

## 安装（Loon）

1. 将 `EchoLoop_RC.js` 放入 Loon 的 `Scripts` 目录
2. 导入 `EchoLoop.plugin`
3. 开启 MITM，hostname 已自动添加 `api.revenuecat.com`
4. 安装并信任 CA 证书
5. 打开 Echo Loop → 全部功能已解锁 ✅

## 安装（Quantumult X）

1. 将 `EchoLoop_RC.js` 放入 `Scripts` 目录
2. 复制 `EchoLoop_qx.conf` 内容到配置文件中
3. 开启 MITM，安装 CA 证书

## 安装（Surge）

1. 导入 `EchoLoop_sg.sgmodule`
2. 开启 MITM，安装 CA 证书

## 下载

[App Store](https://apps.apple.com/app/id6760324074)
