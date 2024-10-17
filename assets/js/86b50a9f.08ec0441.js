"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[802],{5680:(e,a,n)=>{n.d(a,{xA:()=>s,yg:()=>g});var t=n(6540);function r(e,a,n){return a in e?Object.defineProperty(e,a,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[a]=n,e}function i(e,a){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);a&&(t=t.filter((function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable}))),n.push.apply(n,t)}return n}function l(e){for(var a=1;a<arguments.length;a++){var n=null!=arguments[a]?arguments[a]:{};a%2?i(Object(n),!0).forEach((function(a){r(e,a,n[a])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(n,a))}))}return e}function o(e,a){if(null==e)return{};var n,t,r=function(e,a){if(null==e)return{};var n,t,r={},i=Object.keys(e);for(t=0;t<i.length;t++)n=i[t],a.indexOf(n)>=0||(r[n]=e[n]);return r}(e,a);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(t=0;t<i.length;t++)n=i[t],a.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=t.createContext({}),d=function(e){var a=t.useContext(p),n=a;return e&&(n="function"==typeof e?e(a):l(l({},a),e)),n},s=function(e){var a=d(e.components);return t.createElement(p.Provider,{value:a},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var a=e.children;return t.createElement(t.Fragment,{},a)}},y=t.forwardRef((function(e,a){var n=e.components,r=e.mdxType,i=e.originalType,p=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),m=d(n),y=r,g=m["".concat(p,".").concat(y)]||m[y]||u[y]||i;return n?t.createElement(g,l(l({ref:a},s),{},{components:n})):t.createElement(g,l({ref:a},s))}));function g(e,a){var n=arguments,r=a&&a.mdxType;if("string"==typeof e||r){var i=n.length,l=new Array(i);l[0]=y;var o={};for(var p in a)hasOwnProperty.call(a,p)&&(o[p]=a[p]);o.originalType=e,o[m]="string"==typeof e?e:r,l[1]=o;for(var d=2;d<i;d++)l[d]=n[d];return t.createElement.apply(null,l)}return t.createElement.apply(null,n)}y.displayName="MDXCreateElement"},7893:(e,a,n)=>{n.r(a),n.d(a,{assets:()=>p,contentTitle:()=>l,default:()=>u,frontMatter:()=>i,metadata:()=>o,toc:()=>d});var t=n(8168),r=(n(6540),n(5680));const i={},l=void 0,o={unversionedId:"api/modules/IapAmazon",id:"api/modules/IapAmazon",title:"IapAmazon",description:"react-native-iap / Exports / IapAmazon",source:"@site/docs/api/modules/IapAmazon.md",sourceDirName:"api/modules",slug:"/api/modules/IapAmazon",permalink:"/docs/api/modules/IapAmazon",draft:!1,editUrl:"https://github.com/hyochan/react-native-iap/edit/main/docs/docs/api/modules/IapAmazon.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"SubscriptionPurchase",permalink:"/docs/api/interfaces/SubscriptionPurchase"},next:{title:"IapAndroid",permalink:"/docs/api/modules/IapAndroid"}},p={},d=[{value:"Table of contents",id:"table-of-contents",level:2},{value:"Interfaces",id:"interfaces",level:3},{value:"Variables",id:"variables",level:3},{value:"Functions",id:"functions",level:3},{value:"Variables",id:"variables-1",level:2},{value:"AmazonModule",id:"amazonmodule",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"Functions",id:"functions-1",level:2},{value:"deepLinkToSubscriptionsAmazon",id:"deeplinktosubscriptionsamazon",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"validateReceiptAmazon",id:"validatereceiptamazon",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"verifyLicense",id:"verifylicense",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-3",level:4}],s={toc:d},m="wrapper";function u(e){let{components:a,...n}=e;return(0,r.yg)(m,(0,t.A)({},s,n,{components:a,mdxType:"MDXLayout"}),(0,r.yg)("p",null,(0,r.yg)("a",{parentName:"p",href:"../.."},"react-native-iap")," / ",(0,r.yg)("a",{parentName:"p",href:"/docs/api/modules"},"Exports")," / IapAmazon"),(0,r.yg)("h1",{id:"namespace-iapamazon"},"Namespace: IapAmazon"),(0,r.yg)("h2",{id:"table-of-contents"},"Table of contents"),(0,r.yg)("h3",{id:"interfaces"},"Interfaces"),(0,r.yg)("ul",null,(0,r.yg)("li",{parentName:"ul"},(0,r.yg)("a",{parentName:"li",href:"/docs/api/interfaces/IapAmazon.AmazonModuleProps"},"AmazonModuleProps"))),(0,r.yg)("h3",{id:"variables"},"Variables"),(0,r.yg)("ul",null,(0,r.yg)("li",{parentName:"ul"},(0,r.yg)("a",{parentName:"li",href:"/docs/api/modules/IapAmazon#amazonmodule"},"AmazonModule"))),(0,r.yg)("h3",{id:"functions"},"Functions"),(0,r.yg)("ul",null,(0,r.yg)("li",{parentName:"ul"},(0,r.yg)("a",{parentName:"li",href:"/docs/api/modules/IapAmazon#deeplinktosubscriptionsamazon"},"deepLinkToSubscriptionsAmazon")),(0,r.yg)("li",{parentName:"ul"},(0,r.yg)("a",{parentName:"li",href:"/docs/api/modules/IapAmazon#validatereceiptamazon"},"validateReceiptAmazon")),(0,r.yg)("li",{parentName:"ul"},(0,r.yg)("a",{parentName:"li",href:"/docs/api/modules/IapAmazon#verifylicense"},"verifyLicense"))),(0,r.yg)("h2",{id:"variables-1"},"Variables"),(0,r.yg)("h3",{id:"amazonmodule"},"AmazonModule"),(0,r.yg)("p",null,"\u2022 ",(0,r.yg)("inlineCode",{parentName:"p"},"Const")," ",(0,r.yg)("strong",{parentName:"p"},"AmazonModule"),": ",(0,r.yg)("a",{parentName:"p",href:"/docs/api/interfaces/IapAmazon.AmazonModuleProps"},(0,r.yg)("inlineCode",{parentName:"a"},"AmazonModuleProps"))),(0,r.yg)("h4",{id:"defined-in"},"Defined in"),(0,r.yg)("p",null,(0,r.yg)("a",{parentName:"p",href:"https://github.com/hyochan/react-native-iap/blob/8fa3da1/src/modules/amazon.ts#L46"},"modules/amazon.ts:46")),(0,r.yg)("h2",{id:"functions-1"},"Functions"),(0,r.yg)("h3",{id:"deeplinktosubscriptionsamazon"},"deepLinkToSubscriptionsAmazon"),(0,r.yg)("p",null,"\u25b8 ",(0,r.yg)("strong",{parentName:"p"},"deepLinkToSubscriptionsAmazon"),"(",(0,r.yg)("inlineCode",{parentName:"p"},"sku"),"): ",(0,r.yg)("inlineCode",{parentName:"p"},"Promise"),"\\<",(0,r.yg)("inlineCode",{parentName:"p"},"void"),">"),(0,r.yg)("p",null,"Deep link to subscriptions screen on Android."),(0,r.yg)("h4",{id:"parameters"},"Parameters"),(0,r.yg)("table",null,(0,r.yg)("thead",{parentName:"table"},(0,r.yg)("tr",{parentName:"thead"},(0,r.yg)("th",{parentName:"tr",align:"left"},"Name"),(0,r.yg)("th",{parentName:"tr",align:"left"},"Type"),(0,r.yg)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.yg)("tbody",{parentName:"table"},(0,r.yg)("tr",{parentName:"tbody"},(0,r.yg)("td",{parentName:"tr",align:"left"},(0,r.yg)("inlineCode",{parentName:"td"},"sku")),(0,r.yg)("td",{parentName:"tr",align:"left"},(0,r.yg)("inlineCode",{parentName:"td"},"Object")),(0,r.yg)("td",{parentName:"tr",align:"left"},"The product's SKU (on Android)")),(0,r.yg)("tr",{parentName:"tbody"},(0,r.yg)("td",{parentName:"tr",align:"left"},(0,r.yg)("inlineCode",{parentName:"td"},"sku.isAmazonDevice")),(0,r.yg)("td",{parentName:"tr",align:"left"},(0,r.yg)("inlineCode",{parentName:"td"},"boolean")),(0,r.yg)("td",{parentName:"tr",align:"left"},"-")))),(0,r.yg)("h4",{id:"returns"},"Returns"),(0,r.yg)("p",null,(0,r.yg)("inlineCode",{parentName:"p"},"Promise"),"\\<",(0,r.yg)("inlineCode",{parentName:"p"},"void"),">"),(0,r.yg)("h4",{id:"defined-in-1"},"Defined in"),(0,r.yg)("p",null,(0,r.yg)("a",{parentName:"p",href:"https://github.com/hyochan/react-native-iap/blob/8fa3da1/src/modules/amazon.ts#L87"},"modules/amazon.ts:87")),(0,r.yg)("hr",null),(0,r.yg)("h3",{id:"validatereceiptamazon"},"validateReceiptAmazon"),(0,r.yg)("p",null,"\u25b8 ",(0,r.yg)("strong",{parentName:"p"},"validateReceiptAmazon"),"(",(0,r.yg)("inlineCode",{parentName:"p"},"\xabdestructured\xbb"),"): ",(0,r.yg)("inlineCode",{parentName:"p"},"Promise"),"\\<",(0,r.yg)("inlineCode",{parentName:"p"},"ReceiptType"),">"),(0,r.yg)("p",null,"Validate receipt for Amazon. NOTE: This method is here for debugging purposes only. Including\nyour developer secret in the binary you ship to users is potentially dangerous.\nUse server side validation instead for your production builds"),(0,r.yg)("h4",{id:"parameters-1"},"Parameters"),(0,r.yg)("table",null,(0,r.yg)("thead",{parentName:"table"},(0,r.yg)("tr",{parentName:"thead"},(0,r.yg)("th",{parentName:"tr",align:"left"},"Name"),(0,r.yg)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.yg)("tbody",{parentName:"table"},(0,r.yg)("tr",{parentName:"tbody"},(0,r.yg)("td",{parentName:"tr",align:"left"},(0,r.yg)("inlineCode",{parentName:"td"},"\xabdestructured\xbb")),(0,r.yg)("td",{parentName:"tr",align:"left"},(0,r.yg)("inlineCode",{parentName:"td"},"Object"))),(0,r.yg)("tr",{parentName:"tbody"},(0,r.yg)("td",{parentName:"tr",align:"left"},"\u203a\xa0",(0,r.yg)("inlineCode",{parentName:"td"},"developerSecret")),(0,r.yg)("td",{parentName:"tr",align:"left"},(0,r.yg)("inlineCode",{parentName:"td"},"string"))),(0,r.yg)("tr",{parentName:"tbody"},(0,r.yg)("td",{parentName:"tr",align:"left"},"\u203a\xa0",(0,r.yg)("inlineCode",{parentName:"td"},"receiptId")),(0,r.yg)("td",{parentName:"tr",align:"left"},(0,r.yg)("inlineCode",{parentName:"td"},"string"))),(0,r.yg)("tr",{parentName:"tbody"},(0,r.yg)("td",{parentName:"tr",align:"left"},"\u203a\xa0",(0,r.yg)("inlineCode",{parentName:"td"},"useSandbox")),(0,r.yg)("td",{parentName:"tr",align:"left"},(0,r.yg)("inlineCode",{parentName:"td"},"boolean"))),(0,r.yg)("tr",{parentName:"tbody"},(0,r.yg)("td",{parentName:"tr",align:"left"},"\u203a\xa0",(0,r.yg)("inlineCode",{parentName:"td"},"userId")),(0,r.yg)("td",{parentName:"tr",align:"left"},(0,r.yg)("inlineCode",{parentName:"td"},"string"))))),(0,r.yg)("h4",{id:"returns-1"},"Returns"),(0,r.yg)("p",null,(0,r.yg)("inlineCode",{parentName:"p"},"Promise"),"\\<",(0,r.yg)("inlineCode",{parentName:"p"},"ReceiptType"),">"),(0,r.yg)("h4",{id:"defined-in-2"},"Defined in"),(0,r.yg)("p",null,(0,r.yg)("a",{parentName:"p",href:"https://github.com/hyochan/react-native-iap/blob/8fa3da1/src/modules/amazon.ts#L59"},"modules/amazon.ts:59")),(0,r.yg)("hr",null),(0,r.yg)("h3",{id:"verifylicense"},"verifyLicense"),(0,r.yg)("p",null,"\u25b8 ",(0,r.yg)("strong",{parentName:"p"},"verifyLicense"),"(): ",(0,r.yg)("inlineCode",{parentName:"p"},"Promise"),"\\<",(0,r.yg)("inlineCode",{parentName:"p"},"AmazonLicensingStatus"),">"),(0,r.yg)("p",null,"Returns the status of verifying app's license"),(0,r.yg)("h4",{id:"returns-2"},"Returns"),(0,r.yg)("p",null,(0,r.yg)("inlineCode",{parentName:"p"},"Promise"),"\\<",(0,r.yg)("inlineCode",{parentName:"p"},"AmazonLicensingStatus"),">"),(0,r.yg)("p",null,(0,r.yg)("strong",{parentName:"p"},(0,r.yg)("inlineCode",{parentName:"strong"},"See"))),(0,r.yg)("p",null,"AmazonLicensingStatus"),(0,r.yg)("h4",{id:"defined-in-3"},"Defined in"),(0,r.yg)("p",null,(0,r.yg)("a",{parentName:"p",href:"https://github.com/hyochan/react-native-iap/blob/8fa3da1/src/modules/amazon.ts#L79"},"modules/amazon.ts:79")))}u.isMDXComponent=!0}}]);