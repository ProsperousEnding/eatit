import{aw as e,ax as t,ag as r,y as n,G as o,H as a,P as s,A as i,at as l,ay as c}from"./vendors-123bf75d.js";import{i as p}from"./element-plus-f93db08e.js";!function(){const e=document.createElement("link").relList;if(!(e&&e.supports&&e.supports("modulepreload"))){for(const e of document.querySelectorAll('link[rel="modulepreload"]'))t(e);new MutationObserver((e=>{for(const r of e)if("childList"===r.type)for(const e of r.addedNodes)"LINK"===e.tagName&&"modulepreload"===e.rel&&t(e)})).observe(document,{childList:!0,subtree:!0})}function t(e){if(e.ep)return;e.ep=!0;const t=function(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),"use-credentials"===e.crossOrigin?t.credentials="include":"anonymous"===e.crossOrigin?t.credentials="omit":t.credentials="same-origin",t}(e);fetch(e.href,t)}}();const u={},d=function(e,t,r){if(!t||0===t.length)return e();const n=document.getElementsByTagName("link");return Promise.all(t.map((e=>{if((e=function(e){return"/"+e}(e))in u)return;u[e]=!0;const t=e.endsWith(".css"),o=t?'[rel="stylesheet"]':"";if(!!r)for(let r=n.length-1;r>=0;r--){const o=n[r];if(o.href===e&&(!t||"stylesheet"===o.rel))return}else if(document.querySelector(`link[href="${e}"]${o}`))return;const a=document.createElement("link");return a.rel=t?"stylesheet":"modulepreload",t||(a.as="script",a.crossOrigin=""),a.href=e,document.head.appendChild(a),t?new Promise(((t,r)=>{a.addEventListener("load",t),a.addEventListener("error",(()=>r(new Error(`Unable to preload CSS for ${e}`))))})):void 0}))).then((()=>e())).catch((e=>{const t=new Event("vite:preloadError",{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}))},m=[{path:"/",name:"Home",component:()=>d((()=>import("./Home-187d5063.js")),["assets/js/Home-187d5063.js","assets/js/vendors-123bf75d.js","assets/js/_plugin-vue_export-helper-152f4368.js","assets/js/element-plus-f93db08e.js","assets/css/Home-6c222777.css"])},{path:"/search",name:"Search",component:()=>d((()=>import("./Search-29db2494.js")),["assets/js/Search-29db2494.js","assets/js/vendors-123bf75d.js","assets/js/_plugin-vue_export-helper-152f4368.js","assets/css/Search-0d4a6a61.css"])},{path:"/recipe/:id",name:"RecipeDetail",component:()=>d((()=>import("./RecipeDetail-3ff9dd7a.js")),["assets/js/RecipeDetail-3ff9dd7a.js","assets/js/vendors-123bf75d.js","assets/js/_plugin-vue_export-helper-152f4368.js","assets/js/element-plus-f93db08e.js","assets/css/RecipeDetail-daf2564d.css"])},{path:"/category",name:"CategoryList",component:()=>d((()=>import("./CategoryList-acdb9f6d.js")),["assets/js/CategoryList-acdb9f6d.js","assets/js/vendors-123bf75d.js","assets/js/_plugin-vue_export-helper-152f4368.js","assets/js/element-plus-f93db08e.js","assets/css/CategoryList-637b7cbe.css"])}],f=e({history:t("/"+"/".replace(/^\/+|\/+$/g,"")+"/"),routes:m,scrollBehavior:(e,t,r)=>r||{top:0}});f.beforeEach(((e,t,r)=>{const n=e.query.p;if(n){const{p:t,...o}=e.query;return void r({path:n,query:o})}m.some((t=>{var r;if(t.path===(null==(r=e.matched[0])?void 0:r.path))return!0;if(t.path.includes(":")){return new RegExp("^"+t.path.replace(/:[^/]+/g,"[^/]+")+"$").test(e.path)}return t.path===e.path}))?r():r({path:"/"})}));const h=l({__name:"App",setup:e=>(e,t)=>{const l=r("router-view"),c=r("el-footer"),p=r("el-container");return n(),o(p,{class:"layout-container"},{default:a((()=>[s(l),s(c,null,{default:a((()=>t[0]||(t[0]=[i("p",null,"© 2024 EatIt - 今天吃什么",-1)]))),_:1})])),_:1})}});h.use(c()),h.use(f),h.use(p),h.mount("#app");
