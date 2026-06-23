# FocusFlight 订阅破解

## App
- FocusFlight（极飞航班追踪器）
- Bundle ID: `net.cementpla.FocusFlights`
- v5.36.0+

## 解锁内容
- ✅ Pro
- ✅ Premium
- ✅ Plus
- ✅ All Access
- ✅ 所有订阅产品显示为已购买（永久）

## 原理
劫持 RevenueCat API `api.revenuecat.com/v1/subscribers/{id}` 的响应，返回伪造的全量权益数据。App 使用 RevenueCat SDK 且未做 SSL Pinning。

## 文件说明
| 文件 | 用途 |
|------|------|
| `FocusFlight_RevenueCat.plugin` | Loon 插件（主推荐） |
| `FocusFlight_RC.js` | 核心劫持脚本 |
| `FocusFlight_qx.conf` | Quantumult X 引用配置 |
| `FocusFlight_sg.sgmodule` | Surge 模块 |

## 安装（Loon）
1. 将 `FocusFlight_RC.js` 放入 Loon 的 `Scripts` 目录
2. 导入 `FocusFlight_RevenueCat.plugin`
3. 开启 MITM，hostname 已自动添加 `api.revenuecat.com`
4. 安装并信任 CA 证书
5. 打开 FocusFlight → 订阅页面应显示已解锁
