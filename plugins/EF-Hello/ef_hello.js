let body = $response.body;
if (!body) { $done({}); return; }

try {
  console.log('[EFHello] http-response fired: ' + $request.url);

  // ========== 本地持久化 (Loon $store, 失败自动降级) ==========
  function sget(k) { try { return $store.get(k); } catch (e) { return null; } }
  function sset(k, v) { try { $store.set(k, v); } catch (e) {} }
  function sjget(k) { try { var s = sget(k); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function sjset(k, o) { sset(k, JSON.stringify(o)); }

  // StartStudySession 请求变量里的 sectionId (JWT studySectionToken)
  function getSectionIdFromReq() {
    try {
      var req = JSON.parse($request.body);
      var token = req.variables && req.variables.input && req.variables.input.studySectionToken;
      if (!token) return null;
      var payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      while (payload.length % 4) payload += '=';
      var j = JSON.parse(atob(payload));
      return j.section && j.section.sectionId;
    } catch (e) { return null; }
  }

  // 标记一个 section 已完成 → 所属 lesson 完成数 +1
  function markSectionDone(secId) {
    if (!secId) return;
    var done = sjget('EFH_done') || {};
    done[secId] = 1;
    sjset('EFH_done', done);
    var map = sjget('EFH_map') || {};
    var lid = map[secId];
    if (lid) {
      var lc = sjget('EFH_lcount') || {};
      lc[lid] = (lc[lid] || 0) + 1;
      sjset('EFH_lcount', lc);
    }
  }

  // ========== RC RevenueCat (不变) ==========
  if ($request.url.indexOf('api.rc-backup.com') >= 0) {
    if ($request.url.indexOf('/v1/subscribers/') >= 0 && $request.url.indexOf('/attributes') < 0 && $request.url.indexOf('/offerings') < 0 && $request.url.indexOf('/identify') < 0) {
      var fake = {};
      fake.request_date = "2026-08-14T03:00:00Z";
      fake.request_date_ms = 1786647600000;
      fake.subscriber = {
        first_seen: "2026-08-14T03:13:52Z",
        last_seen: "2026-08-14T03:14:00Z",
        management_url: "https://apps.apple.com/account/subscriptions",
        original_app_user_id: "$RCAnonymousID:1f1bf48367924bb98c85952a72dd1a4d",
        original_application_version: "8080420",
        original_purchase_date: "2026-08-14T03:13:52Z",
        non_subscriptions: {},
        entitlements: { premium: { expires_date: "2099-12-31T23:59:59Z", product_identifier: "com.ef.efhello.premium_yearly", purchase_date: "2026-08-14T03:13:52Z" } },
        subscriptions: { "com.ef.efhello.premium_yearly": { expires_date: "2099-12-31T23:59:59Z", original_purchase_date: "2026-08-14T03:13:52Z", purchase_date: "2026-08-14T03:13:52Z", store: "app_store", is_sandbox: false, unsubscribe_detected_at: null, period_type: "normal", billing_issues_detected_at: null, grace_period_expires_date: null, ownership_type: "PURCHASED" } }
      };
      $done({ body: JSON.stringify(fake) });
      return;
    }
    if ($request.url.indexOf('/offerings') >= 0) {
      $done({ body: '{"offerings":[{"identifier":"default","description":"EF Hello Premium","metadata":{},"packages":[{"identifier":"$rc_monthly","platform_product_identifier":"com.ef.efhello.premium_monthly"},{"identifier":"$rc_yearly","platform_product_identifier":"com.ef.efhello.premium_yearly"}]}],"current_offering_id":"default"}' });
      return;
    }
    if ($request.url.indexOf('/product_entitlement_mapping') >= 0) {
      $done({ body: '{"com.ef.efhello.premium_monthly":{"entitlements":["premium"]},"com.ef.efhello.premium_yearly":{"entitlements":["premium"]}}' });
      return;
    }
    $done({});
    return;
  }

  // ========== GraphQL ==========
  if ($request.url.indexOf('v2.api.hello.ef.cn/graphql') >= 0 || $request.url.indexOf('v2.api.hello.ef.com/graphql') >= 0) {
    if (!body || body === '') { $done({}); return; }

    var respObj = JSON.parse(body);

    // 错误拦截 (403/404/500 → 伪成功, 学习不中断)
    if (respObj.errors) {
      // StartStudySession: 记录当前 section → 伪造成功
      if (body.indexOf('startStudySession') >= 0) {
        var curSec = getSectionIdFromReq();
        if (curSec) sset('EFH_cur', curSec);
        $done({ body: '{"data":{"startStudySession":{"studySession":{"id":"U3R1ZHlTZXNzaW9uOmZha2U=","__typename":"StudySession"},"__typename":"StartStudySessionPayload"}}}' });
        return;
      }
      // CompleteStudySession: 标记完成 → 伪造成功 (带 isCompleted 让 UI 打勾)
      if (body.indexOf('completeStudySession') >= 0) {
        var sec = sget('EFH_cur');
        markSectionDone(sec);
        sset('EFH_cur', '');
        $done({ body: '{"data":{"completeStudySession":{"studySession":{"id":"U3R1ZHlTZXNzaW9uOmZha2U=","pointsEarned":100,"score":1,"__typename":"StudySession"},"centile":null,"checkin":null,"smartCourseSection":{"id":"U21hcnRDb3Vyc2VTZWN0aW9uOmZha2U=","progress":{"isCompleted":true,"__typename":"SmartCourseSectionProgress"},"lesson":{"id":"U21hcnRDb3Vyc2VMZXNzb246ZmFrZQ==","title":"完成课程","numberInCourse":1,"sectionsLength":6,"progress":{"isCompleted":false,"completedSectionsCount":1,"__typename":"SmartCourseLessonProgress"},"reviewLesson":null,"course":{"id":"U21hcnRDb3Vyc2U6ZmFrZQ==","progress":{"isCompleted":false,"completedSectionsCount":1,"__typename":"SmartCourseProgress"},"title":"课程","difficulty":"NONE","isGifted":false,"enrollment":{"isEnrolled":true,"__typename":"SmartCourseEnrollment"},"sectionsLength":22,"cover":{"title":"课程","foregroundColor":"#7572FF","backgroundColor":"#D0CFFF","backgroundShadowColor":"#B1B0F7","image":{"url":"https://assets.hello.ef.cn/covers/09_weather_seasons-h420-if0512471-w420.png","width":420,"height":420,"__typename":"Image"},"__typename":"Image"},"access":{"policy":"FREE","__typename":"SmartCourseAccess"},"__typename":"SmartCourse"},"__typename":"SmartCourseLesson"},"__typename":"SmartCourseSection"},"completedUserPath":null,"viewer":{"lastCheckinDate":"2026-08-14","checkinStreak":1,"pastDailyCheckins":[],"userHasCompletedAllPaths":false,"me":{"id":"VXNlcjpjYTA2YjM0My00Y2RhLTRjZTAtODgwNC0zZDk2MmFlZDBhZGE=","points":99999,"__typename":"User"},"__typename":"Viewer"},"__typename":"CompleteStudySessionPayload"}}}' });
        return;
      }
      if (body.indexOf('recordStudyResponse') >= 0) {
        $done({ body: '{"data":{"recordStudyResponse":{"viewer":{"checkinStreak":0,"__typename":"Viewer"},"__typename":"RecordStudyResponsePayload"}}}' });
        return;
      }
    }

    // ===== 响应改写 =====
    var doneSecs = sjget('EFH_done') || {};
    var secMap = sjget('EFH_map') || {};
    var lessonCnt = sjget('EFH_lcount') || {};

    function fixAll(obj) {
      if (!obj || typeof obj !== 'object') return;
      if (Array.isArray(obj)) { obj.forEach(fixAll); return; }

      // 解锁: 课程访问 + 报名
      if (obj.access && obj.access.policy === 'NONE') { obj.access.policy = 'FREE'; }
      if (obj.access && obj.access.policy === 'RESTRICTED') { obj.access.policy = 'FREE'; }
      if (obj.enrollment && obj.enrollment.isEnrolled === false) { obj.enrollment.isEnrolled = true; }

      // SmartCourseChat / SmartCourseLesson: section→lesson 映射 + section 打勾
      if (obj.__typename === 'SmartCourseLesson' && obj.id && obj.sections) {
        obj.sections.forEach(function(s) {
          if (!s || !s.id) return;
          secMap[s.id] = obj.id;
          if (doneSecs[s.id] && s.progress) { s.progress.isCompleted = true; }
        });
        sjset('EFH_map', secMap);
      }

      // lesson 级进度: 本地完成数覆盖 (学完才打勾)
      if (obj.__typename === 'SmartCourseLesson' && obj.id && obj.progress) {
        var n = lessonCnt[obj.id] || 0;
        if (n > 0) {
          if (obj.progress.completedSectionsCount === undefined || n > obj.progress.completedSectionsCount) {
            obj.progress.completedSectionsCount = n;
          }
          if (obj.sectionsLength && obj.progress.completedSectionsCount >= obj.sectionsLength) {
            obj.progress.isCompleted = true;
          }
        }
      }

      // Viewer premium + points
      if (obj.premium && obj.premium.isEnabled !== undefined) {
        obj.premium.isEnabled = true;
        obj.premium.planType = 'PREMIUM';
        obj.premium.endTime = 4102329600000;
      }
      if (obj.lockedInBucketAssignments && Array.isArray(obj.lockedInBucketAssignments)) { obj.lockedInBucketAssignments = []; }
      if (obj.points !== undefined && obj.points === 0) { obj.points = 99999; }

      Object.keys(obj).forEach(function(k) { fixAll(obj[k]); });
    }

    if (respObj.data) {
      fixAll(respObj.data);

      // Bucket 分配
      if (respObj.data.viewer && respObj.data.viewer.allBucketAssignments) {
        var bm = { DICTIONARY_VISIBILITY:'visible', CONVERSATIONAL_LESSONS:'enabled', ADDI_WELCOME_BACK_CHAT:'visible', DYNAMIC_TOPIC_ASSESSMENT:'enabled', DYNAMIC_TOPIC_ASSESSMENT_V2:'enabled' };
        respObj.data.viewer.allBucketAssignments.forEach(function(b) { if (bm[b.bucketGroup]) { b.bucket = bm[b.bucketGroup]; } });
      }

      // ProfilePointsChart
      if (respObj.data.pointBalanceByInterval) {
        respObj.data.pointBalanceByInterval.forEach(function(item) { if (item.total !== undefined) { item.total = 99999; } });
      }
    }

    $done({ body: JSON.stringify(respObj) });
    return;
  }

} catch(e) {}

$done({});
