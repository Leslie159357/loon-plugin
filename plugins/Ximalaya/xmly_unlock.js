// 喜马拉雅 iOS 9.5.1 会员解锁（基于真实抓包 2026-08-15）
// 覆盖：会员状态(首页/VIP检查/VIP中心/basicInfo) + 播放权限字段 + 音质解锁
// 边界：播放 URL 由服务器 AES 签发，无法伪造——付费/VIP免费音频实际播放不受影响
// 用法：配合 XimalayaUnlock.plugin，或手动加 [Script] + [MITM]

// ============ 工具函数 ============
function log(msg) {
  if (typeof $task !== 'undefined' && $environment && $environment.params && $environment.params.log) {
    console.log('[喜马拉雅] ' + msg);
  }
}

function tryParse(body) {
  try { return JSON.parse(body); } catch (e) { return null; }
}

// ============ 各接口处理 ============

// 1. 个人页/首页 mobile-user/v2/homePage —— isVip/vipStatus/vipInfo
function handleHomePage(body) {
  var j = tryParse(body);
  if (!j || !j.data) return null;
  var d = j.data;
  d.isVip = true;
  if (typeof d.vipStatus !== 'undefined') d.vipStatus = 4;
  if (d.vipInfo) d.vipInfo.isVip = true;
  return JSON.stringify(j);
}

// 2. vip/check/user/{uid} —— {"code":200,"data":{"isVip":false}}
function handleVipCheck(body) {
  var j = tryParse(body);
  if (!j || !j.data) return null;
  if (typeof j.data.isVip !== 'undefined') j.data.isVip = true;
  return JSON.stringify(j);
}

// 3. vip-info/v1/{uid} —— {"data":{"vips":[{"vipType":1,"vip":false}]}}
function handleVipInfo(body) {
  var j = tryParse(body);
  if (!j || !j.data || !j.data.vips) return null;
  j.data.vips.forEach(function (v) { if (v && typeof v.vip !== 'undefined') v.vip = true; });
  return JSON.stringify(j);
}

// 4. user/basicInfo —— vipInfos.{105,125,189,205,213}.vipStatus -> 4(已开通)
function handleBasicInfo(body) {
  var j = tryParse(body);
  if (!j || !j.data || !j.data.vipInfos) return null;
  var infos = j.data.vipInfos;
  for (var k in infos) {
    if (infos[k] && typeof infos[k].vipStatus !== 'undefined') {
      infos[k].vipStatus = 4;
      infos[k].isAutoRenew = true;
    }
  }
  return JSON.stringify(j);
}

// 5. baseInfo —— 播放权限字段：isPaid->false / isFree->true / isVipFree->true / vipFreeType->0 / hqNeedVip->false
//    注意：不动 isAuthorized（保持服务器真实值，避免播放器异常）
function handleBaseInfo(body) {
  var j = tryParse(body);
  if (!j) return null;
  var ti = j.trackBaseVO && j.trackBaseVO.trackInfo;
  if (ti) {
    ti.isPaid = false;
    ti.isFree = true;
    if (typeof ti.isVipFree !== 'undefined') ti.isVipFree = true;
    if (typeof ti.vipFreeType !== 'undefined') ti.vipFreeType = 0;
    if (typeof ti.hqNeedVip !== 'undefined') ti.hqNeedVip = false;
  }
  var ai = j.trackBaseVO && j.trackBaseVO.authorizedInfo;
  if (ai && typeof ai.hqNeedVip !== 'undefined') ai.hqNeedVip = false;
  // 专辑信息字段
  var al = j.trackBaseVO && j.trackBaseVO.albumInfo;
  if (al) {
    al.isPaid = false;
    if (typeof al.isVipFree !== 'undefined') al.isVipFree = true;
    if (typeof al.vipFreeType !== 'undefined') al.vipFreeType = 0;
  }
  return JSON.stringify(j);
}

// 6. album/track（专辑曲目列表）—— list[].isPaid->false / isFree->true / isVipFree->true
function handleAlbumTrack(body) {
  var j = tryParse(body);
  if (!j || !j.data || !j.data.list) return null;
  j.data.list.forEach(function (t) {
    if (!t) return;
    t.isPaid = false;
    t.isFree = true;
    if (typeof t.isVipFree !== 'undefined') t.isVipFree = true;
    if (typeof t.vipFreeType !== 'undefined') t.vipFreeType = 0;
  });
  return JSON.stringify(j);
}

// 7. playlist/album/new —— data[].isPaid->false / isFree->true
function handlePlaylist(body) {
  var j = tryParse(body);
  if (!j || !j.data) return null;
  var arr = Array.isArray(j.data) ? j.data : (j.data.list || null);
  if (!arr) return null;
  arr.forEach(function (t) {
    if (!t) return;
    t.isPaid = false;
    t.isFree = true;
    if (typeof t.isVipFree !== 'undefined') t.isVipFree = true;
  });
  return JSON.stringify(j);
}

// 8. qualityAndEffect —— 音质全解锁
function handleQuality(body) {
  var j = tryParse(body);
  if (!j || !j.data || !j.data.trackQualityVoInfo) return null;
  var qs = j.data.trackQualityVoInfo.trackQualities;
  if (!qs) return null;
  qs.forEach(function (q) {
    if (!q) return;
    q.needVip = false;
    q.canChoose = true;
    q.enjoying = true;
    q.hasQuota = true;
  });
  return JSON.stringify(j);
}

// 9. plant/grass 等专辑类 —— baseAlbum 字段
function handleGrass(body) {
  var j = tryParse(body);
  if (!j || !j.data) return null;
  var al = j.data.album && j.data.album.baseAlbum;
  if (al) {
    al.isPaid = false;
    if (typeof al.isFree !== 'undefined') al.isFree = true;
  }
  var al2 = j.data.baseAlbum;
  if (al2) {
    al2.isPaid = false;
    if (typeof al2.isFree !== 'undefined') al2.isFree = true;
  }
  return JSON.stringify(j);
}

// ============ 主入口 ============
function main() {
  var url = $request.url;
  var body = $response.body;
  if (!body) { $done({}); return; }

  var out = null;
  var tag = '';

  if (/\/mobile-user\/v2\/homePage/.test(url)) {
    out = handleHomePage(body); tag = 'homePage';
  } else if (/\/vip\/check\/user\//.test(url)) {
    out = handleVipCheck(body); tag = 'vipCheck';
  } else if (/\/business-vip-center-mobile-web\/user\/vip-info\/v1\//.test(url)) {
    out = handleVipInfo(body); tag = 'vipInfo';
  } else if (/\/business-vip-presale-mobile-web\/user\/basicInfo/.test(url)) {
    out = handleBasicInfo(body); tag = 'basicInfo';
  } else if (/\/mobile-playpage\/track\/v4\/baseInfo/.test(url)) {
    out = handleBaseInfo(body); tag = 'baseInfo';
  } else if (/\/mobile\/v1\/album\/track/.test(url)) {
    out = handleAlbumTrack(body); tag = 'albumTrack';
  } else if (/\/mobile\/playlist\/album\/new/.test(url)) {
    out = handlePlaylist(body); tag = 'playlist';
  } else if (/\/mobile-playpage\/playpage\/track\/qualityAndEffect/.test(url)) {
    out = handleQuality(body); tag = 'quality';
  } else if (/\/mobile-album\/album\/plant\/grass/.test(url)) {
    out = handleGrass(body); tag = 'grass';
  } else {
    $done({}); return;
  }

  if (out) {
    log(tag + ' 已解锁 (' + url.replace(/\?.*/, '') + ')');
    var headers = Object.assign({}, $response.headers);
    headers['Content-Length'] = String(out.length);
    $done({ body: out, headers: headers });
  } else {
    log(tag + ' 响应无法解析，直通 (' + url.replace(/\?.*/, '') + ')');
    $done({});
  }
}

main();
