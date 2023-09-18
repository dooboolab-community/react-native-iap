"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[111],{3905:(e,t,n)=>{n.d(t,{Zo:()=>l,kt:()=>f});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var d=r.createContext({}),s=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},l=function(e){var t=s(e.components);return r.createElement(d.Provider,{value:t},e.children)},p="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,d=e.parentName,l=c(e,["components","mdxType","originalType","parentName"]),p=s(n),m=a,f=p["".concat(d,".").concat(m)]||p[m]||u[m]||i;return n?r.createElement(f,o(o({ref:t},l),{},{components:n})):r.createElement(f,o({ref:t},l))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=m;var c={};for(var d in t)hasOwnProperty.call(t,d)&&(c[d]=t[d]);c.originalType=e,c[p]="string"==typeof e?e:a,o[1]=c;for(var s=2;s<i;s++)o[s]=n[s];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},5429:(e,t,n)=>{n.d(t,{Z:()=>a});var r=n(7294);function a(e){let{className:t="adfit",style:n,unit:a,height:i,width:o}=e;return(0,r.useEffect)((()=>{let e=document.createElement("ins"),n=document.createElement("script");e.className="kakao_ad_area",e.style="display:none; width:100%;",n.async="true",n.type="text/javascript",n.src="//t1.daumcdn.net/kas/static/ba.min.js",e.setAttribute("data-ad-width",o.toString()),e.setAttribute("data-ad-height",i.toString()),e.setAttribute("data-ad-unit",a.toString()),document.querySelector(`.${t}`).appendChild(e),document.querySelector(`.${t}`).appendChild(n)}),[]),r.createElement("div",{style:n},r.createElement("div",{className:t}))}},2448:(e,t,n)=>{n.d(t,{Z:()=>i});var r=n(7294),a=n(5429);function i(){return r.createElement(a.Z,{unit:"DAN-YTmjDwlbcP42HBg6",height:100,width:320,className:"adfit-top",style:{flex:1,marginTop:24,marginBottom:24}})}},6177:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>c,default:()=>m,frontMatter:()=>o,metadata:()=>d,toc:()=>l});var r=n(7462),a=(n(7294),n(3905)),i=n(2448);const o={title:"Validate Receipt Amazon",sidebar_label:"Validate Receipt Amazon"},c=void 0,d={unversionedId:"api-reference/methods/amazon/validate-receipt-amazon",id:"api-reference/methods/amazon/validate-receipt-amazon",title:"Validate Receipt Amazon",description:"Validate receipt.",source:"@site/docs/api-reference/methods/amazon/validate-receipt-amazon.mdx",sourceDirName:"api-reference/methods/amazon",slug:"/api-reference/methods/amazon/validate-receipt-amazon",permalink:"/docs/api-reference/methods/amazon/validate-receipt-amazon",draft:!1,editUrl:"https://github.com/dooboolab-community/react-native-iap/edit/main/docs/docs/api-reference/methods/amazon/validate-receipt-amazon.mdx",tags:[],version:"current",frontMatter:{title:"Validate Receipt Amazon",sidebar_label:"Validate Receipt Amazon"},sidebar:"tutorialSidebar",previous:{title:"validateReceiptAndroid",permalink:"/docs/api-reference/methods/android/validate-receipt-android"},next:{title:"FAQ",permalink:"/docs/faq"}},s={},l=[{value:"Signature",id:"signature",level:2},{value:"Usage",id:"usage",level:2}],p={toc:l},u="wrapper";function m(e){let{components:t,...n}=e;return(0,a.kt)(u,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)(i.Z,{mdxType:"AdFitTopFixed"}),(0,a.kt)("h1",{id:"validatereceiptamazon"},(0,a.kt)("inlineCode",{parentName:"h1"},"validateReceiptAmazon")),(0,a.kt)("p",null,"Validate receipt."),(0,a.kt)("admonition",{type:"note"},(0,a.kt)("p",{parentName:"admonition"},"This method is here for debugging purposes only. Including your\ndeveloper secret in the binary you ship to users is potentially dangerous.\nUse server-side validation instead for your production builds.")),(0,a.kt)("h2",{id:"signature"},"Signature"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"validateReceiptAmazon(\n  /** From the Amazon developer console */\n  developerSecret: string,\n\n  /** Who purchased the item. */\n  userId: string,\n\n  /** Long obfuscated string returned when purchasing the item */\n  receiptId: string,\n\n  /** Defaults to true, use sandbox environment or production. */\n  useSandbox: boolean = true,\n): Promise<AmazonReceiptType>;\n")),(0,a.kt)("h2",{id:"usage"},"Usage"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"import React from 'react';\nimport {Button} from 'react-native';\nimport {validateReceiptAmazon} from 'react-native-iap';\n\nconst App = () => {\n  const handlePurchase = async () => {\n    const response = await validateReceiptAmazon(\n      'your-developer-secret',\n      'user-id',\n      'receipt-id',\n    );\n  };\n\n  return <Button title=\"Purchase\" onPress={handlePurchase} />;\n};\n")))}m.isMDXComponent=!0}}]);