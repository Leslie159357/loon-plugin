# 🐟 鱼吃鱼 (大鱼/Dayu) — 抓包分析

## 结论: 目前无法通过 MITM 修改资源

经过三轮抓包分析，结论如下：

## 为什么脚本无效

1. **所有 `update_user_resource/goods/fish_fragment` 请求强制校验 `sign`**
2. `sign` 算法在 Unity WebGL 的 **WebAssembly** 中编译实现（非 JS）
3. 服务端返回 `{"code":10000,"msg":"签名错误"}` 拒绝修改
4. 积分墙接口 `integral/update_process` 有独立签名（`kp-sign`），appsecret 虽硬编码但算法未知

## 破解难点

| 环节 | 状态 |
|------|------|
| 请求加密 | ✅ 无 — 明文JSON |
| 服务端校验 | ❌ 强制校验sign |
| sign算法 | ❌ 在WASM中，无JS源码 |
| 积分墙appsecret | ✅ 公开 `0e77ef0fc29ee99b04b6432e98684ae8` |
| 积分墙签名 | ❌ 算法未知 |
| Token有效期 | ⏳ 2小时 |

## 可能的破解路径（需要进一步逆向）

### 路径1: 反编译 WebAssembly
- 从 wxapkg 中提取 `webgl.wasm.code.unityweb.wasm.br`（~5MB）
- 用 wasm-decompile / wasm2c 反编译
- 找到 sign 计算函数
- 在 Loon/QX 脚本中实现相同算法

### 路径2: 越狱 + Frida Hook
- 在越狱 iOS 上运行鱼吃鱼
- 用 Frida Hook WebAssembly 的 sign 函数
- 实时拦截并修改 sign 参数

### 路径3: 积分墙利用
- 破解 `kp-sign` 签名算法（独立于主API）
- 通过 `update_process` 接口刷积分
- 积分兑换钻石/道具

## 抓包数据总结

服务器: `prod-dayu.lanfeitech.com` / `game-admin.lanfeitech.com`
用户UID: `6a36db722ec728c57f89faec`
最新token在抓包中每次登录不同

## 文件说明

| 文件 | 说明 |
|------|------|
| `dayu.plugin` | Loon 插件 (目前无效，保留供参考) |
| `Dayu.conf` | QX 配置 (目前无效，保留供参考) |
| `dayu_loon.js` | Loon 脚本 |
| `dayu_qx.js` | QX 脚本 |
| `ANALYSIS.md` | 完整分析报告 |
