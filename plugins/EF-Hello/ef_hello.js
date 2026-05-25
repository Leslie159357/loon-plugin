let body = $response.body;
if (!body) { $done({}); return; }

try {
  // RC RevenueCat
  if ($request.url.indexOf('api.rc-backup.com') >= 0) {
    if ($request.url.indexOf('/v1/subscribers/') >= 0 && $request.url.indexOf('/attributes') < 0 && $request.url.indexOf('/offerings') < 0 && $request.url.indexOf('/identify') < 0) {
      var fake = {};
      fake.request_date = "2026-05-25T03:00:00Z";
      fake.request_date_ms = 1779679800000;
      fake.subscriber = {
        first_seen: "2026-05-25T03:13:52Z",
        last_seen: "2026-05-25T03:14:00Z",
        management_url: "https://apps.apple.com/account/subscriptions",
        original_app_user_id: "$RCAnonymousID:1f1bf48367924bb98c85952a72dd1a4d",
        original_application_version: "8070420",
        original_purchase_date: "2026-05-25T03:13:52Z",
        non_subscriptions: {},
        entitlements: { premium: { expires_date: "2099-12-31T23:59:59Z", product_identifier: "com.ef.efhello.premium_yearly", purchase_date: "2026-05-25T03:13:52Z" } },
        subscriptions: { "com.ef.efhello.premium_yearly": { expires_date: "2099-12-31T23:59:59Z", original_purchase_date: "2026-05-25T03:13:52Z", purchase_date: "2026-05-25T03:13:52Z", store: "app_store", is_sandbox: false, unsubscribe_detected_at: null, period_type: "normal", billing_issues_detected_at: null, grace_period_expires_date: null, ownership_type: "PURCHASED" } }
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

  // GraphQL
  if ($request.url.indexOf('v2.api.hello.ef.cn/graphql') >= 0 || $request.url.indexOf('v2.api.hello.ef.com/graphql') >= 0) {
    if (!body || body === '') { $done({}); return; }
    
    var respObj = JSON.parse(body);
    
    // 错误拦截 - 404->成功
    if (respObj.errors) {
      if (body.indexOf('startStudySession') >= 0) {
        $done({ body: '{"data":{"startStudySession":{"studySession":{"id":"U3R1ZHlTZXNzaW9uOmZha2U=","__typename":"StudySession"},"__typename":"StartStudySessionPayload"}}}' });
        return;
      }
      if (body.indexOf('recordStudyResponse') >= 0) {
        $done({ body: '{"data":{"recordStudyResponse":{"viewer":{"checkinStreak":0,"__typename":"Viewer"},"__typename":"RecordStudyResponsePayload"}}}' });
        return;
      }
      if (body.indexOf('completeStudySession') >= 0) {
        $done({ body: JSON.stringify({data:{completeStudySession:{studySession:{id:"U3R1ZHlTZXNzaW9uOmZha2U=",pointsEarned:100,score:1.0,__typename:"StudySession"},centile:null,checkin:null,smartCourseSection:{id:"U21hcnRDb3Vyc2VTZWN0aW9uOmZha2U=",progress:{isCompleted:true,__typename:"SmartCourseSectionProgress"},lesson:{id:"U21hcnRDb3Vyc2VMZXNzb246ZmFrZQ==",title:"完成课程",numberInCourse:1,sectionsLength:6,progress:{isCompleted:true,completedSectionsCount:1,__typename:"SmartCourseLessonProgress"},reviewLesson:null,course:{id:"U21hcnRDb3Vyc2U6ZmFrZQ==",progress:{isCompleted:false,completedSectionsCount:1,__typename:"SmartCourseProgress"},title:"课程",difficulty:"NONE",isGifted:false,enrollment:{isEnrolled:true,__typename:"SmartCourseEnrollment"},sectionsLength:22,cover:{title:"课程",foregroundColor:"#7572FF",backgroundColor:"#D0CFFF",backgroundShadowColor:"#B1B0F7",image:{url:"https://assets.hello.ef.cn/covers/09_weather_seasons-h420-if0512471-w420.png",width:420,height:420,__typename:"Image"},__typename:"Image"},access:{policy:"FREE",__typename:"SmartCourseAccess"},__typename:"SmartCourse"},__typename:"SmartCourseLesson"},__typename:"SmartCourseSection"},completedUserPath:null,viewer:{lastCheckinDate:"2026-05-25",checkinStreak:1,pastDailyCheckins:[],userHasCompletedAllPaths:false,me:{id:"VXNlcjpjYTA2YjM0My00Y2RhLTRjZTAtODgwNC0zZDk2MmFlZDBhZGE=",points:99999,__typename:"User"},__typename:"Viewer"},__typename:"CompleteStudySessionPayload"}}}) });
        return;
      }
    }
    
    // 递归修复access.policy, enrollment, completedSectionsCount
    function fixAll(obj) {
      if (!obj || typeof obj !== 'object') return;
      if (Array.isArray(obj)) { obj.forEach(fixAll); return; }
      
      if (obj.access && obj.access.policy === 'NONE') { obj.access.policy = 'FREE'; }
      if (obj.access && obj.access.policy === 'RESTRICTED') { obj.access.policy = 'FREE'; }
      if (obj.enrollment && obj.enrollment.isEnrolled === false) { obj.enrollment.isEnrolled = true; }
      if (obj.__typename === 'SmartCourseProgress' && obj.completedSectionsCount === 0) { obj.completedSectionsCount = 1; }
      if (obj.__typename === 'SmartCourseLessonProgress' && obj.completedSectionsCount === 0) { obj.completedSectionsCount = 1; }
      
      // Viewer premium + points
      if (obj.premium && obj.premium.isEnabled !== undefined) {
        obj.premium.isEnabled = true;
        obj.premium.planType = 'PREMIUM';
        obj.premium.endTime = 4102329600000;
      }
      if (obj.points !== undefined && obj.points === 0) { obj.points = 99999; }
      
      Object.keys(obj).forEach(function(k) { fixAll(obj[k]); });
    }
    
    if (respObj.data) {
      fixAll(respObj.data);
      
      // Bucket分配
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
