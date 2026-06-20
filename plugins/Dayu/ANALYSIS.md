# 🐟 鱼吃鱼 (大鱼/Dayu) — 完整抓包分析报告

> **游戏名称**: 鱼吃鱼 (大鱼 Dayu/Bigfish)
> **微信 AppId**: `wxd705de6e4f88cc89`
> **引擎**: Unity WebGL (微信小游戏)
> **开发商**: 昆仑游戏/Kunpo/蓝飞 (lanfeitech.com)
> **Kunpo AppID**: `PlbrJWbC`
> **版本**: 1.0.298
> **抓包日期**: 2026-06-21

---

## 1️⃣ 游戏概况

鱼吃鱼是一款大鱼吃小鱼玩法的 Unity WebGL 微信小游戏，与"四季合合"同属昆仑游戏/Kunpo 旗下。

### 服务器架构

| 域名 | 用途 |
|------|------|
| `hw-cdn-dayu.lanfeitech.com` | CDN: UnityFS 资源包 (bundle文件) |
| **`prod-dayu.lanfeitech.com`** | **主游戏API服务器** |
| `game-admin.lanfeitech.com` | 积分墙/游戏中心 |
| `cdn-gamecenter.lanfeitech.com` | 游戏中心图标CDN |
| `receiver-kta.lanfeitech.com` | Thinking Analytics 数据统计 |

---

## 2️⃣ 完整API接口清单

### 2.1 认证 🙋

**POST `/api/user/auth`** — 微信登录认证

请求体:
```json
{
  "channel": 3,
  "device_id": "",
  "js_code": "0e3Zh90w3Ij6g73Wft2w3hCKTN2Zh903",
  "ver": "1.0.298",
  "ss_device_id": "48e7f9858a534a96bf47a06c3f9e8194",
  "params": {
    "channelId": "10906",
    "subChannelId": "0",
    "platForm": "ios",
    "traceId": "-1",
    "aid": "-1"
  }
}
```

响应体:
```json
{
  "code": 0,
  "msg": "OK",
  "data": {
    "token": "Bearer mctBl+z+...",
    "userid": "161344103",
    "uid": "6a36db722ec728c57f89faec",
    "sdkid": "o-uB-5Do9WPdHsTOVYFDDSmzQYsY",
    "reg_time": 1781980018,
    "special_type": 0,
    "white": 0,
    "ban_count": 0,
    "ban_status": 0,
    "last_logout_time": -1,
    "open_time": 1,
    "timestamp": 1781980018
  }
}
```

### 2.2 用户信息 👤

**POST `/api/user/get_user_info`** — 用户信息

请求体: `{"uid": "6a36db722ec728c57f89faec"}`

响应体:
```json
{
  "data": {
    "nickname": "玩家161344103",
    "head": "1",
    "rank_end_time": 1782057600,
    "fish_free_num": 0,
    "fish_fragments": [],
    "user_goods": [],
    "last_paytime": 0,
    "friend_settings": 1,
    "r1": 1,
    "uid": "6a36db722ec728c57f89faec",
    "userid": "161344103"
  },
  "code": 0,
  "msg": "OK"
}
```

### 2.3 资源修改 ⭐ (破解核心)

**POST `/api/user/update_user_resource`** — 更新用户资源

请求体:
```json
{
  "uid": "6a36db722ec728c57f89faec",
  "update_resource": [
    {
      "goods_key": "diamond_old",
      "type": 999,
      "id": 1001,
      "count": 0
    }
  ],
  "iid": 1781980018
}
```

响应: `{"code": 0, "data": {}, "msg": "OK"}`

**关键参数**:
- `goods_key`: "diamond_old" = 钻石
- `type`: 999 (特殊类型，可能是通用资源类型)
- `id`: 1001 (资源ID)
- `count`: 数量

**POST `/api/user/update_user_goods`** — 更新物品

请求体:
```json
{
  "uid": "6a36db722ec728c57f89faec",
  "iid": 1781980018,
  "update_goods": [{"id": 1001, "count": 0}],
  "ver": 1
}
```

**POST `/api/user/update_fish_fragment`** — 更新鱼碎片

请求体:
```json
{
  "uid": "6a36db722ec728c57f89faec",
  "fish_tb": [
    {"id": 11004, "count": 1},
    {"id": 11012, "count": 1}
  ],
  "ts": 1781980204
}
```

### 2.4 存档系统 💾

**POST `/api/archive/get`** — 获取存档

请求体:
```json
{
  "uid": "6a36db722ec728c57f89faec",
  "tb_names": ["archive", "fish", "gm", "gameactivity", "blind_box"]
}
```

响应: `{"code": 0, "msg":"OK", "data": {"archives": [], "ban_count": 0}}`

**POST `/api/archive/upload`** — 上传存档 (最频繁的请求)

存档表(tb_names):
| 名称 | 说明 |
|------|------|
| `archive` | 主存档 (Base64编码，二进制格式) ~1772字节 |
| `fish` | 鱼数据 (Base64编码) ~192字节 |
| `gm` | GM/调试数据 |
| `gameactivity` | 活动数据 (JSON明文) |
| `blind_box` | 盲盒数据 |

`archive` 和 `fish` 的数据是 Base64 编码的自定义二进制格式，开头无魔术字，疑似自定义序列化。

`gameactivity` 是明文JSON，示例:
```json
{"Datas":[{"ID":9007,"Turn":0,"Type":0,"Progress":1,"Reward":"","Data":"1781980018","CHR":[1,0,0,0,0,0,0],"dr7":[0,0,0,0,0,0,0]}]}
```

### 2.5 辅助接口

| 端点 | 功能 |
|------|------|
| `POST /api/api/timestamp` | 服务器时间戳 |
| `POST /api/order/load_shopping_list` | 商城列表 |
| `POST /api/order/hang_list` | 挂单列表 |
| `POST /api/mail/load` | 邮件列表 |
| `POST /api/mail/load_conf_mail` | 系统邮件 |
| `POST /api/help/list` | 求助列表 (含 fish_id) |
| `POST /api/help/help_log_list` | 求助记录 |
| `POST /api/revive/get_invit_count` | 复活邀请计数 |
| `POST /api/gift/get_gift_info` | 礼包信息 |
| `POST /api/gift/get_egg_prize` | 彩蛋奖励 |
| `POST /api/fight/check_last_stats_upload` | 检查上次战斗统计状态 |
| `POST /api/user/draw_fish_box` | 抽鱼盲盒 |

### 2.6 积分墙 / 游戏中心

域名: `game-admin.lanfeitech.com`

**签名机制** (独立于主API):
- `kp-token`: JWT token
- `kp-sign`: MD5 签名
- `kp-timestamp`: 时间戳
- `kp-appid`: `PlbrJWbC`
- **appsecret 硬编码**: `0e77ef0fc29ee99b04b6432e98684ae8`

**POST `/api/game/getToken`** — 获取JWT token

请求体:
```json
{
  "kunpo_appid": "PlbrJWbC",
  "id": "6a36db722ec728c57f89faec",
  "channelid": 3,
  "appid": "PlbrJWbC",
  "appsecret": "0e77ef0fc29ee99b04b6432e98684ae8",
  "time": 1781980018059
}
```

JWT Token (解码后):
```
Header: {"alg":"HS256"}
Payload: {"cnli":3,"jti":"d4f1498d-f2b4-4143-8372-b0f7269ec557","iss":"auth","sub":"6a36db722ec728c57f89faec","aud":["opensys"],"iat":1781980018,"exp":1781987218,"saud":"PlbrJWbC","azp":"opensys","typ":1}
```

**POST `/api/minigame/integral/get_list`** — 积分任务列表
**POST `/api/minigame/integral/get_list_task`** — 积分任务详情
**POST `/api/minigame/integral/get_state`** — 积分状态

---

## 3️⃣ 请求/响应头分析

### 请求头格式

```
:authority: prod-dayu.lanfeitech.com
:method: POST
:path: /api/user/update_user_resource
content-type: application/json
content-length: xxx
authorization: Bearer <JWT_token>
sign: <32位hex MD5签名>
time: <unix_timestamp_ms>
user-agent: Mozilla/5.0 (iPhone; ...) MicroMessenger/...
referer: https://servicewechat.com/wxd705de6e4f88cc89/188/page-frame.html
```

### 响应头格式

```
:status: 200
content-type: text/plain;charset=utf-8
sign: <32位hex MD5签名>
access-control-allow-origin: *
access-control-allow-headers: DNT,X-Mx-ReqToken,...,Authorization,time,sign
```

### 认证机制

1. **Authorization**: `Bearer <JWT_token>` (登录时获取，~2小时有效期)
2. **sign**: 请求体的 MD5 哈希值
3. **time**: Unix 时间戳 (毫秒)

---

## 4️⃣ 安全评估

| 评估项 | 评分 | 说明 |
|--------|------|------|
| 协议加密 | 🟢 **无** | 全部明文JSON，无任何加密 |
| 请求签名 | 🟡 MD5 | 可离线计算，无密钥混合 |
| 防篡改校验 | 🟢 **无** | 没有ClientCode/HMAC |
| 服务端校验 | 🟡 部分 | update接口接受客户端数值 |
| AppSecret暴露 | 🔴 **硬编码** | `0e77ef0fc29ee99b04b6432e98684ae8` |
| 存储加密 | 🟡 Base64 | archive数据base64编码，但内容自定义二进制 |

**总体评估: 极低安全级别** — 和四季合合形成鲜明对比

---

## 5️⃣ 破解路径详解

### 方案A: 直接修改资源 (推荐 ⭐)

直接拦截 `update_user_resource` 请求，将 `count` 改为大数值。

```
请求: POST /api/user/update_user_resource
修改: update_resource[0].count = 999999
```

### 方案B: 直接修改鱼碎片

拦截 `update_fish_fragment`，添加所有鱼种ID。

### 方案C: 存档破解 (需要逆向Unity WebGL JS)

- 反编译微信小程序 wxapkg
- 定位 Unity WebGL JS 中的存档序列化/反序列化函数
- 解密 archive/fish 的二进制格式
- 修改后重新编码上传

### 方案D: 积分墙利用

- 使用硬编码的 appsecret 调用积分墙API
- 可自行完成任务状态提交

---

## 6️⃣ 配置文件

### Loon 配置 (dayu_loon.conf)

```
[MITM]
hostname = prod-dayu.lanfeitech.com

[Script]
http-request ^https?://prod-dayu\.lanfeitech\.com/api/user/update_user_resource script-path=dayu_loon.js, requires-body=true
http-request ^https?://prod-dayu\.lanfeitech\.com/api/user/update_user_goods script-path=dayu_loon.js, requires-body=true
http-request ^https?://prod-dayu\.lanfeitech\.com/api/user/update_fish_fragment script-path=dayu_loon.js, requires-body=true
```

### Quantumult X 配置 (dayu_qx.conf)

```
[mitm]
hostname = prod-dayu.lanfeitech.com

[rewrite_local]
^https?://prod-dayu\.lanfeitech\.com/api/user/update_user_resource url script-request-body dayu_qx.js
^https?://prod-dayu\.lanfeitech\.com/api/user/update_user_goods url script-request-body dayu_qx.js
^https?://prod-dayu\.lanfeitech\.com/api/user/update_fish_fragment url script-request-body dayu_qx.js
```

---

## 7️⃣ 附: 与四季合合对比

| 对比项 | 四季合合 (Merge Mansion) | 鱼吃鱼 (Dayu) |
|--------|------------------------|---------------|
| 协议加密 | 自定义对称加密 (强) | **明文JSON** |
| 存档加密 | 同 | 自定义二进制 (同公司) |
| 服务端权威 | ✅ 完全 | ✅ 完全 |
| 客户端可改 | ❌ | **✅ 有update接口** |
| AppSecret | 未知 | **公开** |
| 破解难度 | ⭐⭐⭐⭐⭐ | **⭐⭐** |

---

> **免责声明**: 本报告仅供安全研究学习使用，请勿用于非法用途。修改他人游戏数据可能违反服务条款。
