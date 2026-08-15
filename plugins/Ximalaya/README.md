# 喜马拉雅 iOS 9.5.1 会员解锁（Loon）

基于 **2026-08-15 真实抓包**（app 9.5.1）逆向的会员判定链定制。v2 全面重做——旧版 v1.1 的 `mobile-user/my/vip` 接口在 9.5.1 已不存在，全部换成当前真实接口。

## 文件
| 文件 | 说明 |
|---|---|
| `XimalayaUnlock.plugin` | Loon 插件（9 条解锁规则 + 去广告 + MITM） |
| `xmly_unlock.js` | 解锁脚本（放 Loon/Scripts） |
| `sync_listen_time.sh` | ⭐ 听书福利时长刷量工具（见下文） |
| `README.md` | 本文档 |

## 安装
1. `xmly_unlock.js` 放 Loon 的 Scripts 目录（`Loon/Scripts/`）
2. `XimalayaUnlock.plugin` 放 Loon 的 Plugin 目录（`Loon/Plugin/`），Loon → 插件 → 启用
3. 确认 MITM 证书已安装信任、HTTPS 解密开启
4. 杀掉喜马拉雅重开

## 解锁内容（9.5.1 判定链）

### ① 会员状态展示（伪造 isVip/vipStatus）
| 接口 | 伪造 |
|---|---|
| `mobwsa/mobile-user/v2/homePage` | `data.isVip:true`、`vipStatus:4`、`vipInfo.isVip:true` |
| `mwsa/vip/check/user/{uid}` | `data.isVip:true`（真实响应 `{"code":200,"data":{"isVip":false}}`） |
| `mwsa/business-vip-center-mobile-web/user/vip-info/v1/{uid}` | `vips[].vip:true` |
| `business-vip-presale-mobile-web/user/basicInfo` | `vipInfos.{105,125,189,205,213}.vipStatus → 4`（105=VIP/189=SVIP/205=白金VIP/213=儿童SVIP/125=儿童VIP） |

### ② 播放/列表权限字段（UI 层判定）
| 接口 | 伪造 |
|---|---|
| `mobile-playpage/track/v4/baseInfo` | `trackInfo.isPaid→false`、`isFree→true`、`isVipFree→true`、`vipFreeType→0`、`hqNeedVip→false`（不动 isAuthorized） |
| `mobile/v1/album/track`（专辑曲目） | `list[].isPaid→false`、`isFree→true`、`isVipFree→true` |
| `mobile/playlist/album/new`（播放列表） | `data[].isPaid→false`、`isFree→true` |
| `mobile-album/album/plant/grass` | `baseAlbum.isPaid→false` |

### ③ 功能解锁
| 接口 | 伪造 |
|---|---|
| `mobile-playpage/playpage/track/qualityAndEffect` | `trackQualities[]: needVip→false, canChoose→true, enjoying→true, hasQuota→true`（超高音质 96kbps） |

### ④ 去广告
好友横幅 / xdcs+xuid 上报 / adse.adsehera.ad-incentive 广告域名 / umeng 统计 / 签到活动弹窗 / 专辑价格弹窗 / 底部会员购买弹窗（`business-sale-promotion-guide-mobile-web/popup/info`，抓包 45 次）

## ⭐ 听书福利时长刷量（syncListenTime 漏洞）

**2026-08-15 实测确认**：`ad-incentive.ximalaya.com/incentive-sync/ting/welfare/syncListenTime` 上报接口存在签名校验缺陷：

- **signature 只验证格式不验证内容**——复用任意已捕获的合法签名即可通过
- **requestId 用新 UUID 即绕过幂等**——每次上报都被接受
- **duration 参数无上限校验**——实测单次 +86400 秒（24h）成功，balance 无限增长
- 实测：balance 71 → 133,588 秒（37 小时），无单次/每日上限

**用法**：
```bash
# 1. 编辑脚本填入你的 cookie（从 Loon 抓包 ad-incentive 请求复制）
# 2. 运行（每次 +86400 秒）
./sync_listen_time.sh
# 3. 打开喜马拉雅 → 福利中心 → 听书福利 查看时长
```

⚠️ **风险**：刷量行为可能触发喜马拉雅风控（异常检测/时长清零/封禁），请适度使用（刷到够用即停），不要高频狂刷。

## ⚠️ 诚实边界（播放 URL 服务器签发）

播放链 = `baseInfo → playUrlInfos[].url`（AES 加密密文，客户端密钥解密）。未授权 track 服务器返回空数组，MITM 无法伪造播放地址：
- ✅ 已购专辑 / 免费音频：正常播放
- ❌ VIP 免费专辑 / 未购付费音频：UI 解锁但播放仍被服务器拦截
- **听书福利时长若可兑换免费听 → 则是合法播放通道**（服务器真授权），配合刷量工具可实现真解锁（待实测确认兑换链路）

## 测试
`stub_test.js` — node stub 用抓包真实响应跑脚本，10/10 通过（homePage/vipCheck/vipInfo/basicInfo/baseInfo×2/albumTrack/playlist/quality/grass）
