// Memrise Pro Unlock v5
const url=$request.url;const b=$response.body;if(!b)$done({});
try{let obj=JSON.parse(b);let p=url.replace(/https?:\/\/[^\/]+/,'');
if(/^\/?v1\.25\/me\/?$/.test(p)){
if(obj.profile){obj.profile.is_pro=true;obj.profile.subscription={active:true,plan:'annual',expires_at:'2099-12-31T23:59:59Z',product_id:'memrise_pro_annual',type:'pro'};obj.profile.business_model={value:'premium'};obj.profile.is_premium=true;}
if(obj.is_pro!==undefined)obj.is_pro=true;}
if(/subscriptions\/?$/.test(p)){obj={subscriptions:[{id:'sub_pro_annual',plan:'annual',status:'active',product_id:'memrise_pro_annual',auto_renew:true,expires_at:'2099-12-31T23:59:59Z',started_at:'2026-01-01T00:00:00Z',source:'app_store',is_trial:false,will_renew:true}],active_subscription:{id:'sub_pro_annual',plan:'annual',status:'active',product_id:'memrise_pro_annual',auto_renew:true,expires_at:'2099-12-31T23:59:59Z'}};}
if(/availability/.test(p)&&obj.features){for(let f of obj.features)f.available=true;}
if(/buddies/.test(p)&&obj.buddies){for(let b of obj.buddies)b.is_premium=false;}
if(/media\/\d+/.test(p)&&obj.status)obj.status='unlocked';
if(/\/membot\/\d+\/missions\/[^\/]+/.test(p)&&obj.prompt&&obj.prompt.max_responses)obj.prompt.max_responses=999;
if(/\/membot\/\d+\/missions\/[^\/]+\/goal/.test(p)){if(obj.goal_reached!==undefined)obj.goal_reached=false;if(obj.message_limit_reached!==undefined)obj.message_limit_reached=false;}
$done({body:JSON.stringify(obj)});
}catch(e){$done({body});}
