# Cake (me.mycake) 会员解锁插件

Cake AI 英语学习 6.8.1 —— 后端 API 判定型 app（RN + Hermes + NitroIAP/StoreKit2 + 自家后端）。

## 判定链（逆向 + 抓包确认）

- IAP：OpenIAP + NitroIAP（react-native-nitro-iap，JSI 桥）→ **ObjC 层无 hook 点**，dylib 路线不可行
- **真实 API 域名（Loon 抓包确认）**：
  - `api.mycake.me`（旧接口 nginx：/app/start、/heart、/main/learning/summary/v2、/snack/*）→ **明文 JSON**
  - `api.cakeapp.me`（/gw/ 网关，**AWS API Gateway → 响应 gzip 压缩**：/gw/v2/main/today、/gw/user/dashboard、/gw/subscription/*、/gw/path/main、/gw/heart/use 等）
- **会员状态权威字段 = `/app/start` 响应 `extra.membership`**：`NONE` / `BASIC` / `PLUS` / `FREE_TRIAL` → 伪造 `PLUS`
- **内容锁定字段**（各内容接口逐项下发，服务器按用户状态实时判定）：
  - `membershipOnly` / `isMembershipOnly` / `restrictedNow` / `restrictedAfterFreeTrial` / `membershipOnlyPlaylist` / `membershipOnlySentence`（sentence/unit/step 级）
- 其它：`/tutorbot/ticket/policy`（AI 对话票数）、`/heart` + `/gw/heart/use`（爱心：服务器权威扣减，扣到 0 返回 `{"result":"FAILURE"}`）

## ⚠️ 关键坑（v2.2 修复）

**api.cakeapp.me 走 AWS API Gateway，app 默认 `Accept-Encoding: gzip` → 响应全部 gzip 压缩 → Loon http-response 脚本拿到的 body 是二进制 → JSON.parse 失败 → 伪造全部静默失效**（表现为：只有 api.mycake.me 明文接口的 999 显示生效）。

**解决**：`force_plain.js`（http-request 脚本）把 `Accept-Encoding` 改为 `identity`，强制服务器返回明文 JSON（已验证服务器行为）。

## v2.2 伪造规则（保守：只改已存在字段值，不新增字段）

| 字段 | 操作 |
|---|---|
| `membership` = NONE/BASIC/FREE_TRIAL | → `PLUS` |
| `membershipOnly` / `isMembershipOnly` / `restrictedNow` / `restrictedAfterFreeTrial` / `membershipOnlyPlaylist` / `membershipOnlySentence` = true | → `false`（解锁内容） |
| `membershipTickets` / `familyMembershipTickets` / `freeTrialTickets` / `familyFreeTrialTickets` | → `999` |
| `/heart` 类接口 `count` / `maximumCount` / `adHeartCount` | → `999` |
| `/heart` 类接口 `{"result":"FAILURE"}`（服务器扣到 0） | → `SUCCESS` + `data.count=999`（爱心用不完） |

所有 JSON 响应通配处理（非 JSON 自动跳过），脚本日志记录真实响应（`[Cake] RAW`）与伪造动作（`[Cake] MEMBERSHIP/UNLOCK/FAKED/HEART-FAILURE`）。

## 使用方法（远程版）

1. Loon → 插件 → 添加：
   - `https://raw.githubusercontent.com/Leslie159357/loon-plugin/main/plugins/Cake/Cake.plugin`
   - 备用（jsdelivr）：`https://testingcf.jsdelivr.net/gh/Leslie159357/loon-plugin@main/plugins/Cake/Cake.plugin`
2. 开启插件，信任 MITM 证书
3. 打开 Cake app，登录（Apple/Google 账号）→ 进会员页 + 播放会员专属内容
4. 查看 Loon → 设置 → 脚本日志确认 `[Cake]` 行

## 使用方法（本地版，大陆网络推荐）

1. 下载 `Cake_loon_local.zip`（Cake/plugin.properties + cake.js + force_plain.js，script-path 全部相对路径，零网络依赖）
2. 解压到 `文件App → 我的 iPhone → Loon → Plugin/Cake/`（无 Plugin 目录就新建）
3. 完全退出 Loon 重开 → 插件列表出现 Cake Plus Unlocker → 开启

## 版本历史

- v1：误用 Hermes 字符串池推断域名（api.mycake.plus），无效
- v2：抓包确认真实域名（api.mycake.me + api.cakeapp.me）+ membership=PLUS + 内容解锁
- v2.1：补 membershipOnlyPlaylist/membershipOnlySentence；script-path 固定 commit hash（避免 jsdelivr @main 缓存旧脚本）
- **v2.2：force_plain.js 强制明文响应（破解 gzip 坑）+ heart FAILURE→SUCCESS 伪造**
