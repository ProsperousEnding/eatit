import{aB as e,az as s,aA as a,r as l,f as i,k as t,S as n,ag as c,u as r,y as d,z as o,P as u,H as p,A as m,K as g,M as h,G as f,L as v,O as y,a4 as _}from"./vendors-123bf75d.js";import{_ as k,u as b,g as $}from"./_plugin-vue_export-helper-2aea90e9.js";import{E as w,c as z,f as R,a as C,d as I,w as P}from"./element-plus-f93db08e.js";const L={key:0,class:"recipe-detail"},M={key:0,class:"nutrition-info"},T={class:"ingredient-quantity"},j={class:"section-header"},x={class:"total-time"},H={class:"time-value"},V={class:"step-content"},q={class:"step-number"},A=["innerHTML"],B={class:"action-buttons"},D={class:"mobile-pairings-content"},E={class:"current-dish-section"},F={class:"current-dish-card"},G={class:"current-dish-info"},K={class:"current-dish-tags"},O={class:"pairing-reason-section"},S={class:"reason-title"},U={class:"reason-grid"},J={class:"reason-item"},N={class:"reason-item"},Q={class:"reason-item"},W={class:"recommended-dishes-section"},X={class:"dishes-grid"},Y=["onClick"],Z={class:"dish-image-wrapper"},ee={class:"dish-content"},se={class:"dish-meta"},ae={class:"dish-tags"},le={class:"cooking-time"},ie={class:"pairing-desc"},te={class:"mobile-dialog-footer"},ne=k({__name:"RecipeDetail",setup(k){const P=e(),ne=s(),ce=b(),{currentRecipe:re,recommendedPairings:de}=a(ce),oe=l(!1);l([{title:"营养搭配小贴士",content:"荤素搭配不仅可以让饮食更加美味，还能确保营养均衡。主菜提供优质蛋白质，蔬菜补充维生素和膳食纤维。"},{title:"健康饮食建议",content:"建议一餐中荤菜和素菜的比例为3:7，这样既能享受美味，又不会摄入过多油脂。"}]);const ue=async e=>{try{if(!e)return;await ce.getRecipeById(parseInt(e)),await ce.getRecommendedPairings(parseInt(e))}catch(s){w.error(s.message||"获取菜品详情失败")}};i((()=>P.params.id),(async e=>{e&&await ue(e)}));const pe=async()=>{oe.value=!0},me=async()=>{try{const e=P.params.id;if(!e)return;await ce.getRecommendedPairings(parseInt(e))}catch(e){w.error("获取搭配推荐失败")}};t((async()=>{const e=P.params.id;e&&await ue(e)})),n((()=>{ce.currentRecipe=null,ce.recommendedPairings=[]}));const ge=e=>0===e?"primary":e===re.value.steps.length-1?"success":"normal";return(e,s)=>{const a=c("el-image"),l=c("el-descriptions-item"),i=c("el-descriptions"),t=c("el-card"),n=c("el-tag"),k=c("el-icon"),b=c("el-timeline-item"),w=c("el-timeline"),P=c("el-button"),ce=c("el-divider"),ue=c("el-dialog");return r(re)?(d(),o("div",L,[u(t,{class:"main-info"},{default:p((()=>[u(a,{src:r($)(r(re).image),fit:"cover",class:"recipe-image"},null,8,["src"]),m("h1",null,h(r(re).name),1),r(re).nutrition?(d(),o("div",M,[u(i,{column:3,border:""},{default:p((()=>[r(re).nutrition.calories?(d(),f(l,{key:0,label:"热量"},{default:p((()=>[v(h(r(re).nutrition.calories),1)])),_:1})):g("",!0),r(re).nutrition.protein?(d(),f(l,{key:1,label:"蛋白质"},{default:p((()=>[v(h(r(re).nutrition.protein),1)])),_:1})):g("",!0),r(re).nutrition.fat?(d(),f(l,{key:2,label:"脂肪"},{default:p((()=>[v(h(r(re).nutrition.fat),1)])),_:1})):g("",!0),r(re).nutrition.carbs?(d(),f(l,{key:3,label:"碳水"},{default:p((()=>[v(h(r(re).nutrition.carbs),1)])),_:1})):g("",!0)])),_:1})])):g("",!0)])),_:1}),u(t,{class:"ingredients-section"},{header:p((()=>s[2]||(s[2]=[m("h3",null,"食材清单",-1)]))),default:p((()=>[(d(!0),o(y,null,_(r(re).ingredients,(e=>(d(),f(n,{key:e,class:"ingredient-tag"},{default:p((()=>[e.includes("克")||e.includes("g")||e.includes("ml")||e.includes("个")||e.includes("片")?(d(),o(y,{key:0},[m("span",T,h(e.match(/\d+(\.\d+)?[克gml个片]/)[0]),1),v(" "+h(e.replace(/\d+(\.\d+)?[克gml个片]/,"")),1)],64)):(d(),o(y,{key:1},[v(h(e),1)],64))])),_:2},1024)))),128))])),_:1}),u(t,{class:"steps-section"},{header:p((()=>[m("div",j,[s[4]||(s[4]=m("h3",null,"烹饪步骤",-1)),m("span",x,[u(k,null,{default:p((()=>[u(r(z))])),_:1}),s[3]||(s[3]=v(" 总耗时：")),m("span",H,h(r(re).cookingTime),1)])])])),default:p((()=>[u(w,null,{default:p((()=>[(d(!0),o(y,null,_(r(re).steps,((e,s)=>(d(),f(b,{key:s,type:ge(s),hollow:s===r(re).steps.length-1,class:"step-item"},{default:p((()=>{return[m("div",V,[m("div",q,h(s+1),1),m("div",{class:"step-text",innerHTML:(a=e,a=(a=(a=(a=(a=(a=(a=a.replace(/(\d+(?:\.\d+)?)\s*(分钟|秒钟|小时|分|秒|h|min|s)/g,'<span class="highlight-time">$1$2</span>')).replace(/(\d+(?:\.\d+)?)\s*(厘米|毫米|cm|mm|米|m)/g,'<span class="highlight-length">$1$2</span>')).replace(/(\d+)\s*(度|℃|°C|°F)/g,'<span class="highlight-temp">$1$2</span>')).replace(/(\d+(?:\.\d+)?)\s*(克|千克|g|kg|公斤|斤|两)/g,'<span class="highlight-weight">$1$2</span>')).replace(/(\d+(?:\.\d+)?)\s*(ml|毫升|升|L|l|dl|分升)/g,'<span class="highlight-volume">$1$2</span>')).replace(/(\d+(?:\.\d+)?)\s*(茶匙|勺|汤匙|碗|杯|盘|把|撮|勺子|匙|大勺|小勺|cup|tbsp|tsp)/g,'<span class="highlight-measure">$1$2</span>')).replace(/(\d+(?:\.\d+)?)\s*(个|只|块|片|颗|粒|根|条|串|包|瓣|节|头|朵|丝|段|张|捆|把|束)/g,'<span class="highlight-quantity">$1$2</span>'))},null,8,A),g("",!0)])];var a})),_:2},1032,["type","hollow"])))),128))])),_:1})])),_:1}),m("div",B,[u(P,{type:"primary",size:"large",onClick:pe,class:"pairing-btn"},{default:p((()=>s[5]||(s[5]=[v(" 查看最佳搭配 ")]))),_:1})]),u(ue,{modelValue:oe.value,"onUpdate:modelValue":s[1]||(s[1]=e=>oe.value=e),title:`${r(re).name}的最佳搭配`,width:"90%",class:"pairings-dialog mobile-dialog",fullscreen:!0},{footer:p((()=>[m("div",te,[u(P,{onClick:s[0]||(s[0]=e=>oe.value=!1),block:""},{default:p((()=>s[14]||(s[14]=[v("关闭")]))),_:1}),u(P,{type:"primary",onClick:me,block:""},{default:p((()=>s[15]||(s[15]=[v("换一批搭配")]))),_:1})])])),default:p((()=>[m("div",D,[m("div",E,[m("div",F,[u(a,{src:r($)(r(re).image),class:"current-dish-image"},null,8,["src"]),m("div",G,[m("h3",null,h(r(re).name),1),m("div",K,[u(n,{size:"small",effect:"plain",type:"danger"},{default:p((()=>[v(h(r(re).taste),1)])),_:1}),u(n,{size:"small",effect:"plain",type:"warning"},{default:p((()=>[v(h(r(re).cookingMethod),1)])),_:1})])])])]),m("div",O,[m("div",S,[u(ce,null,{default:p((()=>s[6]||(s[6]=[v("搭配理由")]))),_:1})]),m("div",U,[m("div",J,[u(k,{class:"reason-icon"},{default:p((()=>[u(r(R))])),_:1}),s[7]||(s[7]=m("h5",null,"营养均衡",-1)),s[8]||(s[8]=m("p",null,"合理搭配荤素",-1))]),m("div",N,[u(k,{class:"reason-icon"},{default:p((()=>[u(r(C))])),_:1}),s[9]||(s[9]=m("h5",null,"口感互补",-1)),s[10]||(s[10]=m("p",null,"提升饮食体验",-1))]),m("div",Q,[u(k,{class:"reason-icon"},{default:p((()=>[u(r(I))])),_:1}),s[11]||(s[11]=m("h5",null,"健康饮食",-1)),s[12]||(s[12]=m("p",null,"注重荤素比例",-1))])])]),m("div",W,[s[13]||(s[13]=m("div",{class:"section-title"},[m("h4",null,"推荐搭配")],-1)),m("div",X,[(d(!0),o(y,null,_(r(de),(e=>(d(),o("div",{key:e.id,class:"dish-item",onClick:s=>{return a=e.id,ne.push({path:`/recipe/${a}`}),void(oe.value=!1);var a}},[m("div",Z,[u(a,{src:r($)(e.image),fit:"cover",class:"dish-thumb"},null,8,["src"])]),m("div",ee,[m("h5",null,h(e.name),1),m("div",se,[m("div",ae,[u(n,{size:"small",effect:"plain"},{default:p((()=>[v(h(e.category),1)])),_:2},1024),u(n,{size:"small",effect:"plain",type:"info"},{default:p((()=>[v(h(e.taste),1)])),_:2},1024)]),m("span",le,[u(k,null,{default:p((()=>[u(r(z))])),_:1}),v(" "+h(e.cookingTime),1)])]),m("p",ie,h(e.pairingReason),1)])],8,Y)))),128))])])])])),_:1},8,["modelValue","title"])])):g("",!0)}}},[["__scopeId","data-v-6c9f637d"]]);export{ne as default};
