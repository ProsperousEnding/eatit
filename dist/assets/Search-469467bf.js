import{az as w,aA as B,r as m,ag as t,y as s,z as c,P as r,H as l,a5 as K,u as h,O as N,a4 as R,G as f,K as b,L as T,A as n,M as v}from"./vendors-75826026.js";import{_ as j,u as z}from"./_plugin-vue_export-helper-4c6240b9.js";const A={class:"search"},D={key:0,class:"search-results"},L={class:"recipe-content"},$={class:"recipe-info"},E={class:"ingredients"},F={__name:"Search",setup(G){const y=w(),i=z(),{recipes:_}=B(i),a=m(""),u=m(!1),d=async()=>{a.value.trim()&&(await i.searchRecipes(a.value),u.value=!0)},g=p=>{y.push(`/recipe/${p}`)};return(p,o)=>{const k=t("el-button"),S=t("el-input"),V=t("el-image"),x=t("el-card"),C=t("el-empty");return s(),c("div",A,[r(S,{modelValue:a.value,"onUpdate:modelValue":o[0]||(o[0]=e=>a.value=e),placeholder:"输入食材关键词搜索食谱...",class:"search-input",onKeyup:K(d,["enter"])},{append:l(()=>[r(k,{onClick:d},{default:l(()=>o[1]||(o[1]=[T("搜索")])),_:1})]),_:1},8,["modelValue"]),h(_).length?(s(),c("div",D,[(s(!0),c(N,null,R(h(_),e=>(s(),f(x,{key:e.id,class:"recipe-item",onClick:H=>g(e.id)},{default:l(()=>[n("div",L,[r(V,{src:e.image||"/default-food.jpg",class:"recipe-thumb"},null,8,["src"]),n("div",$,[n("h3",null,v(e.name),1),n("p",E," 主料: "+v(e.ingredients.join(", ")),1)])])]),_:2},1032,["onClick"]))),128))])):u.value?(s(),f(C,{key:1,description:"没有找到相关食谱"})):b("",!0)])}}},O=j(F,[["__scopeId","data-v-076625a6"]]);export{O as default};
