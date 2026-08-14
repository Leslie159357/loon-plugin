# Cake (me.mycake) 会员解锁插件

Cake AI 英语学习 6.8.1 —— 后端 API 判定型 app（RN + Hermes + NitroIAP/StoreKit2 + 自家后端）。

## 判定链（逆向 + 抓包确认）

- IAP：OpenIAP + NitroIAP（react-native-nitro-iap，JSI 桥）→ **ObjC 层无 hook 点**，dylib 路线不可行
- **真实 API 域名（Loon 抓包确认）**：
  - `api.mycake.me`（旧接口：/app/start、/heart、/main/learning/summary/v2、/snack/*）
  - `api.cakeapp.me`（/gw/ 网关：/gw/v2/main/today、/gw/user/dashboard、/gw/subscription/*、/gw/path/main 等）
- **会员状态权威字段 = `/app/start` 响应 `extra.membership`**：`NONE` / `BASIC` / `PLUS` / `FREE_TRIAL` → 伪造 `PLUS`
- **内容锁定字段**（各内容接口逐项下发，服务器按用户状态实时判定）：
  - `membershipOnly` / `isMembershipOnly` / `restrictedNow` / `restrictedAfterFreeTrial`（sentence/unit/step 级）
- 其它：`/tutorbot/ticket/policy`（AI 对话票数）、`/heart`（爱心数量）

## v2 伪造规则（保守：只改已存在字段值，不新增字段）

| 字段 | 操作 |
|---|---|
| `membership` = NONE/BASIC/FREE_TRIAL | → `PLUS` |
| `membershipOnly` / `isMembershipOnly` / `restrictedNow` / `restrictedAfterFreeTrial` = true | → `false`（解锁内容） |
| `membershipTickets` / `familyMembershipTickets` / `freeTrialTickets` / `familyFreeTrialTickets` | → `999` |
| `/heart` 的 `count` / `maximumCount` / `adHeartCount` | → `999` |

所有 JSON 响应通配处理（非 JSON 自动跳过），脚本日志记录真实响应（`[Cake] RAW`）与伪造动作（`[Cake] MEMBERSHIP/UNLOCK/FAKED`）。

## 使用方法

1. Loon → 插件 → 添加本插件（URL 见下）→ 开启，信任 MITM 证书
2. 打开 Cake app，登录（Apple/Google 账号）→ 进会员页 + 播放会员专属内容
3. 查看 Loon → 设置 → 脚本日志确认 `[Cake]` 行
4. 若某功能仍锁定：把对应接口的 `[Cake] RAW` 日志发回，迭代补规则

## 安装 URL

```
https://raw.githubusercontent.com/Leslie159357/loon-plugin/main/plugins/Cake/Cake.plugin
```

备用（jsdelivr）：
```
https://testingcf.jsdelivr.net/gh/Leslie159357/loon-plugin@main/plugins/Cake/Cake.plugin
```
