# LingoQiOS VIP Unlock
> 基于 IPA v2.2.0 (build 2026051501) 静态分析

## App 信息
- **名称**: LingoQ (LingoQiOS)
- **Bundle ID**: com.lingoq.ios.lingeqi
- **架构**: 纯 ObjC ✅
- **版本**: 2.2.0
- **付费**: 自有 HTTP API + StoreKit2
- **ATS**: NSAllowsArbitraryLoads = true ✅ (无SSL Pinning)

## 核心 API 域名
- `gate.lingoq.com` — 主要业务API
- `gate-dev.lingoq.com` — 开发环境
- `oss.lingoq.com` — 资源CDN
- `api.stkouyu.com` — 口语评测

## 关键 API 路径
| 路径 | 说明 |
|------|------|
| `checkUserIsVipUrl` | VIP 状态检查（具体路径需抓包确认） |
| `orders/checkUserAppleOrder` | 检查 Apple 订单 |
| `orders/verifyAppleReceipt` | 验证 Apple 收据 |
| `orders/codeRedemption` | 兑换码 |
| `goods/vip/ios` | VIP 商品列表 |
| `vip/subscribe` | 订阅 VIP |
| `vip/actions/balance` | VIP 余额 |
| `vip/rightsAndInterests` | VIP 权益 |

## 关键类与方法
| 类名 | 用途 |
|------|------|
| LGQSubscriptionManager | 订阅管理器 |
| LGQPayManager | 支付管理器 |
| LGQPurchaseManager | 购买管理器 |
| LGQPayProductModel | 商品模型 |
| LGQDetailsPayController | 支付页面 |
| LGQApplePayPopView | Apple Pay 弹窗 |
| LGQApplePayLifelongPopView | 终身会员弹窗 |
| LGQFreeGetVipController | 免费获取VIP |

**VIP 属性**: `isVip` / `setIsVip:` (ObjC 属性)
**方法**: `checkSubscriptionStatusWithCompletion:`

## 破解方式：MITM 插件

### QX 模块
```
https://raw.githubusercontent.com/Leslie159357/Loon-Plugins/main/plugins/LingoQ/lingoqi_qx.sgmodule
```

### Loon 插件
```
https://raw.githubusercontent.com/Leslie159357/Loon-Plugins/main/plugins/LingoQ/lingoqi.plugin
```

### MITM 域名
`gate.lingoq.com, gate-dev.lingoq.com, api.stkouyu.com`

### 使用方法
1. 安装模块/插件
2. 确保 MitM 已开启，域名已添加
3. 杀掉 App 重新打开

## 已知限制
- 部分 API 路径是运行时拼接的，需要抓包确认完整路径
- 需要实际抓包验证响应 JSON 结构
- MITM 无法修改本地缓存和 UserDefaults
