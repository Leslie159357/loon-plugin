// ==Plugin==
// @name        多邻国 v10 最终版
// @desc        日历全打卡1000天🔥 + 安全盾修复 + 连胜1000天
// @version     10.0
// @author      Minis
// ==/Plugin==

const G = 999999, TB = 999, FZ = 999, XPC = 99;

function modReq(b) {
  try {
    let o = JSON.parse(b);
    if (!o.requests) return b;
    o.requests.forEach(r => {
      if (r.method === 'POST' && r.url && r.url.includes('shop-items')) {
        let b2 = JSON.parse(r.body);
        b2.isFree = true; b2.gems = 0;
        r.body = JSON.stringify(b2);
      }
    });
    return JSON.stringify(o);
  } catch(e) { return b; }
}

function modUser(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return false;
  let m = false;
  if (typeof d.gems === 'number') { d.gems = G; m = true; }
  if (d.gemsConfig && typeof d.gemsConfig.gems === 'number') { d.gemsConfig.gems = G; m = true; }
  if (d.trackingProperties && typeof d.trackingProperties.gems === 'number') { d.trackingProperties.gems = G; m = true; }

  if (d.subscriberLevel && d.subscriberLevel !== 'PREMIUM') { d.subscriberLevel = 'PREMIUM'; m = true; }

  if (!d.subscriptionFeatures || !Array.isArray(d.subscriptionFeatures)) { d.subscriptionFeatures = []; m = true; }
  ['NO_NETWORK_ADS','UNLIMITED_HEARTS','LEGENDARY_LEVEL','MISTAKES_INBOX',
   'MASTERY_QUIZ','EXPLAIN_MY_ANSWER','LICENSED_SONGS','CAN_ADD_SECONDARY_MEMBERS',
   'DUOLINGO_MAX','ROLE_PLAY','VIDEO_CALL','ADVANCED_MATH'].forEach(f => {
    if (!d.subscriptionFeatures.includes(f)) d.subscriptionFeatures.push(f);
  }); m = true;

  if (d.purchasableFeatures && Array.isArray(d.purchasableFeatures)) {
    ['CAN_PURCHASE_IAP','CAN_PURCHASE_SUBSCRIPTION','CAN_PURCHASE_MAX','CAN_PURCHASE_APPLE_GIFT_SUBSCRIPTION'].forEach(f => {
      if (!d.purchasableFeatures.includes(f)) d.purchasableFeatures.push(f);
    }); m = true;
  }

  if (d.subscriptionConfigs && Array.isArray(d.subscriptionConfigs)) {
    if (!d.subscriptionConfigs.some(s => String(s.productId||'').includes('Max'))) {
      d.subscriptionConfigs.push({
        productId: 'com.duolingo.DuolingoMobile.subscription.Max.Monthly.v2',
        itemType: 'max_subscription', isInBillingRetryPeriod: false,
        isInGracePeriod: false, isFreeTrialPeriod: false,
        expirationTimestamp: 4102415999000, receiptSource: 10
      }); m = true;
    }
  }

  if (d.health) { d.health.unlimitedHeartsAvailable = true; m = true; }
  if (d.energyConfig) { d.energyConfig.maxEnergy = 9999; d.energyConfig.energy = 9999; m = true; }

  if (d.timerBoostConfig) {
    d.timerBoostConfig.timerBoosts = TB;
    d.timerBoostConfig.hasFreeTimerBoost = true;
    d.timerBoostConfig.hasPurchasedTimerBoost = true;
    d.timerBoostConfig.timePerBoost = 7200; m = true;
  }

  if (d.trackingProperties) {
    d.trackingProperties.num_item_streak_freeze = FZ;
    d.trackingProperties.num_item_streak_freeze_total = FZ;
    d.trackingProperties.has_item_streak_freeze = true;
    d.trackingProperties.streak = 1000;
    d.trackingProperties.has_item_weekend_amulet = true;
    d.trackingProperties.has_item_streak_wager = true; m = true;
  }

  if (d.streakData) {
    d.streakData.length = 1000;
    d.streakData.currentStreak = 1000;
    d.streakData.updatedTimestamp = Math.floor(Date.now() / 1000); m = true;
  }

  if (d.rewardCardsInventory) {
    Object.keys(d.rewardCardsInventory).forEach(k => { d.rewardCardsInventory[k] = XPC; }); m = true;
  }

  d.xpBoostMultiplier = 5.0; m = true;
  if (typeof d.totalXp === 'number' && d.totalXp < 999999) { d.totalXp = 999999; m = true; }

  if (d.shopItems && Array.isArray(d.shopItems)) {
    d.shopItems.forEach(item => {
      if (item.price && item.currencyType === 'XGM') item.price = 0;
      if (item.id === 'xp_boost_stackable') { item.remainingEffectDurationInSeconds = 86400; item.quantity = 999; }
    });
    if (!d.shopItems.some(s => s.id === 'xp_boost_stackable')) {
      d.shopItems.push({id:'xp_boost_stackable', purchaseDate:Math.floor(Date.now()/1000), purchasePrice:0, remainingEffectDurationInSeconds:86400, quantity:999});
    }
    m = true;
  }

  if (d.advertisableFeatures && Array.isArray(d.advertisableFeatures)) {
    ['NO_NETWORK_ADS','UNLIMITED_HEARTS','LEGENDARY_LEVEL','MISTAKES_INBOX',
     'MASTERY_QUIZ','EXPLAIN_MY_ANSWER','LICENSED_SONGS','CAN_ADD_SECONDARY_MEMBERS',
     'DUOLINGO_MAX','VIDEO_CALL','ROLE_PLAY','ADVANCED_MATH'].forEach(f => {
      if (!d.advertisableFeatures.includes(f)) d.advertisableFeatures.push(f);
    }); m = true;
  }
  return m;
}

function modBatch(b) {
  try {
    let o = JSON.parse(b);
    if (!o.responses) return b;
    for (let r of o.responses) {
      if (r.status === 400 && r.body === '') { r.status = 200; r.body = '{}'; continue; }
      if (r.status !== 200 || typeof r.body !== 'string') continue;
      try { let d = JSON.parse(r.body); if (modUser(d)) r.body = JSON.stringify(d); } catch(e) {}
    }
    return JSON.stringify(o);
  } catch(e) { return b; }
}

function standalone(url, b) {
  try {
    let d = JSON.parse(b);
    if (typeof d !== 'object' || d === null) return b;

    // === streak独立 ===
    if (d.streakData) {
      d.streakData.currentStreak = {length:1000, lastExtendedDate:'2099-12-31', endDate:'2099-12-31', startDate:'2026-01-01'};
      d.streakData.previousStreak = {length:1000, lastExtendedDate:'2099-12-31', endDate:'2099-12-31', startDate:'2026-01-01'};
      d.streakData.longestStreak = {length:1000, endDate:'2099-12-31', achieveDate:'2099-01-01', startDate:'2026-01-01'};
      return JSON.stringify(d);
    }

    // === xp_summaries（日历）- 用1000天🔥覆盖本地缓存 ===
    if (d.summaries && Array.isArray(d.summaries)) {
      // 改成1000天全部打卡🔥
      const summaries = [];
      const now = Math.floor(Date.now() / 1000);
      for (let day = 0; day < 1000; day++) {
        const date = now - day * 86400;
        // 每天0点对齐
        const dateStart = date - (date % 86400);
        summaries.push({
          gainedXp: 500 + Math.floor(Math.random() * 200),
          frozen: false,
          streakExtended: true,
          date: dateStart,
          userId: '716692732',
          repaired: true,
          dailyGoalXp: 10,
          numSessions: 5,
          totalSessionTime: 600,
          shielded: false
        });
      }
      d.summaries = summaries;
      modUser(d);
      return JSON.stringify(d);
    }

    // === streak-shields（安全盾）===
    if (d.streakShields || url.includes('streak-shield')) {
      d.streakShields = d.streakShields || [];
      if (d.streakShields.length === 0) {
        // 如果没有安全盾，新建一个到2099年
        d.streakShields.push({
          userId: '716692732',
          startDate: {year:2026, month:1, day:1},
          endDate: {year:2099, month:12, day:31}
        });
      } else {
        d.streakShields.forEach(s => {
          s.endDate = {year:2099, month:12, day:31};
          s.startDate = {year:2026, month:1, day:1};
        });
      }
      modUser(d);
      return JSON.stringify(d);
    }

    // === perfect-streak-week ===
    if (d.countTotalPerfectStreakWeeks !== undefined) {
      d.countTotalPerfectStreakWeeks = 999;
      d.countCurrentPerfectStreakWeeks = 999;
      d.perfectStreakDates = [{startDate:'2026-01-01', endDate:'2099-12-31'}];
      modUser(d); return JSON.stringify(d);
    }

    // === achievements ===
    if (d.achievements && Array.isArray(d.achievements)) {
      d.achievements.forEach(a => {
        a.tier = 9; a.count = 99999; a.shouldShowUnlock = false; a.noProgressBar = true;
        let ts = []; let now = Date.now();
        for (let t = 0; t < (a.tierCounts ? a.tierCounts.length : 10); t++) {
          ts.push(now - (10-t) * 86400000);
        }
        a.unlockTimestamps = ts;
      });
      return JSON.stringify(d);
    }

    // === activity-center ===
    if (url.includes('activity-center')) {
      d.hasNewActivity = true;
      d.newActivityCounts = {heart: 99, comment: 99};
      modUser(d);
      return JSON.stringify(d);
    }

    // === live-ops-challenges（紫水晶挑战改满）===
    if (d.liveOpsChallenges && Array.isArray(d.liveOpsChallenges)) {
      const challenges = d.liveOpsChallenges;
      for (let ci = 0; ci < challenges.length; ci++) {
        const ch = challenges[ci];
        ch.xpSections = [999, 999, 999];
        ch.challengeSections = [1, 1, 1];
        ch.allowXpMultiplier = true;
        if (ch.levelXpSections && Array.isArray(ch.levelXpSections)) {
          for (let li = 0; li < ch.levelXpSections.length; li++) {
            ch.levelXpSections[li] = [999, 999, 999];
          }
        }
        if (ch.levelChallengeSections && Array.isArray(ch.levelChallengeSections)) {
          for (let li = 0; li < ch.levelChallengeSections.length; li++) {
            ch.levelChallengeSections[li] = [1, 1, 1];
          }
        }
        ch.initialTime = 9999;
        ch.liveOpsEndTimestamp = 4102415999;
        if (ch.id === 'MATCH_MADNESS') ch.levelAfterReset = 99;
        if (ch.id === 'RAMP_UP' || ch.id === 'SIDE_QUEST_RAMP_UP' || ch.id === 'SIDE_QUEST_MATCH_MADNESS') {
          ch.numExtremeLevels = 99;
        }
      }
      d.liveOpsChallenges = challenges;
      modUser(d);
      return JSON.stringify(d);
    }

    // === show-advertisable ===
    if (url.includes('show-advertisable')) {
      d.advertisableFeatures = ['NO_NETWORK_ADS','UNLIMITED_HEARTS','LEGENDARY_LEVEL',
        'MISTAKES_INBOX','MASTERY_QUIZ','EXPLAIN_MY_ANSWER','LICENSED_SONGS',
        'CAN_ADD_SECONDARY_MEMBERS','DUOLINGO_MAX','VIDEO_CALL','ROLE_PLAY','ADVANCED_MATH'];
      return JSON.stringify(d);
    }

    // === available-features ===
    if (url.includes('available-features')) {
      d.subscriptionFeatures = ['NO_NETWORK_ADS','UNLIMITED_HEARTS','LEGENDARY_LEVEL',
        'MISTAKES_INBOX','MASTERY_QUIZ','EXPLAIN_MY_ANSWER','LICENSED_SONGS',
        'CAN_ADD_SECONDARY_MEMBERS','DUOLINGO_MAX','VIDEO_CALL','ROLE_PLAY'];
      return JSON.stringify(d);
    }

    // === subscription-catalog ===
    if (url.includes('subscription-catalog') && d.plusPackageViewModels) {
      if (!d.plusPackageViewModels.some(p => p.type === 'max')) {
        d.plusPackageViewModels.push({
          productId: 'com.duolingo.DuolingoMobile.subscription.Max.Monthly.v2',
          type: 'max', isFamilyPlan: false, isStudentPlan: false,
          trackingProperties: {subscription_tier:'max_monthly', subscription_item_type:'MAX_SUBSCRIPTION'},
          advertisableFeatures: ['NO_NETWORK_ADS','UNLIMITED_HEARTS','LEGENDARY_LEVEL',
            'MISTAKES_INBOX','MASTERY_QUIZ','EXPLAIN_MY_ANSWER','ROLE_PLAY','VIDEO_CALL','DUOLINGO_MAX']
        });
      }
      return JSON.stringify(d);
    }

    // === lapsed-info ===
    if (url.includes('lapsed-info')) {
      d.canRevive = true; d.streakRevivalData = {canRevive: true, revivalCost: 0, canWatchAd: true};
      return JSON.stringify(d);
    }

    // === subscription-optional-feature ===
    if (url.includes('subscription-optional-feature') || url.includes('unlimited-hearts')) return 'true';

    // === spree课程连续学习 ===
    if (d.course_spree_optional_feature !== undefined) {
      d.current_spree_length = 1000;
      d.longest_spree_length = 1000;
      d.course_spree_optional_feature = 'on';
      d.course_spree_mechanic_type = 'LOOSE';
      d.spree_unlock_status = 'unlocked';
      d.last_updated_timestamp = Math.floor(Date.now() / 1000);
      modUser(d);
      return JSON.stringify(d);
    }

    // === current_score（排行榜分数改高）===
    if (url.includes('current_score')) {
      for (let key in d) {
        if (d[key] && typeof d[key] === 'object' && d[key].score !== undefined) {
          d[key].score = 99999;
        }
      }
      return JSON.stringify(d);
    }

    // === 通用用户 ===
    if (url.includes('/users/') && !url.includes('/batch')) { if (modUser(d)) return JSON.stringify(d); }
    return b;
  } catch(e) { return b; }
}

const isReq = typeof $response === 'undefined' || $response === null;
try {
  if (isReq) {
    const url = $request.url || '';
    const body = $request.body || '';
    if (body && url.includes('/batch')) { $done({ body: modReq(body) }); }
    else { $done({}); }
  } else {
    const url = $request.url || '';
    const body = $response.body || '';
    if (!body) { $done({}); return; }
    if (url.includes('/batch')) { $done({ body: modBatch(body) }); }
    else { $done({ body: standalone(url, body) }); }
  }
} catch(e) { $done({}); }
