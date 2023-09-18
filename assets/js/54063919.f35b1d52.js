"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[585],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>f});var n=r(7294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var c=n.createContext({}),u=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},p=function(e){var t=u(e.components);return n.createElement(c.Provider,{value:t},e.children)},l="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},h=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,c=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),l=u(r),h=o,f=l["".concat(c,".").concat(h)]||l[h]||d[h]||a;return r?n.createElement(f,i(i({ref:t},p),{},{components:r})):n.createElement(f,i({ref:t},p))}));function f(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,i=new Array(a);i[0]=h;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s[l]="string"==typeof e?e:o,i[1]=s;for(var u=2;u<a;u++)i[u]=r[u];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}h.displayName="MDXCreateElement"},940:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>c,contentTitle:()=>i,default:()=>d,frontMatter:()=>a,metadata:()=>s,toc:()=>u});var n=r(7462),o=(r(7294),r(3905));const a={sidebar_position:6},i="Hooks",s={unversionedId:"api-reference/hooks",id:"api-reference/hooks",title:"Hooks",description:"Installation",source:"@site/docs/api-reference/hooks.md",sourceDirName:"api-reference",slug:"/api-reference/hooks",permalink:"/docs/api-reference/hooks",draft:!1,editUrl:"https://github.com/dooboolab-community/react-native-iap/edit/main/docs/docs/api-reference/hooks.md",tags:[],version:"current",sidebarPosition:6,frontMatter:{sidebar_position:6},sidebar:"tutorialSidebar",previous:{title:"Lifecycle",permalink:"/docs/guides/lifecycle"},next:{title:"purchaseErrorListener",permalink:"/docs/api-reference/methods/listeners/purchase-error-listener"}},c={},u=[{value:"Installation",id:"installation",level:2},{value:"Usage",id:"usage",level:2}],p={toc:u},l="wrapper";function d(e){let{components:t,...r}=e;return(0,o.kt)(l,(0,n.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"hooks"},"Hooks"),(0,o.kt)("h2",{id:"installation"},"Installation"),(0,o.kt)("p",null,"You first have to wrap your app with the ",(0,o.kt)("inlineCode",{parentName:"p"},"withIAPContext")," HOC."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import React from 'react';\nimport {withIAPContext} from 'react-native-iap';\n\nconst App = () => <View />;\n\nexport default withIAPContext(App);\n")),(0,o.kt)("h2",{id:"usage"},"Usage"),(0,o.kt)("p",null,"The ",(0,o.kt)("inlineCode",{parentName:"p"},"useIAP()")," hook is an easy way to access ",(0,o.kt)("inlineCode",{parentName:"p"},"react-native-iap")," methods simplified for you. It already does some work through the context to help you get your products, purchases, subscriptions, callback and error handlers faster."),(0,o.kt)("p",null,"Below are all the methods available through the hook. All the rest of the methods e.g. ",(0,o.kt)("inlineCode",{parentName:"p"},"requestPurchase")," are available through the usual import ",(0,o.kt)("inlineCode",{parentName:"p"},"import {requestPurchase} from 'react-native-iap';")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import React from 'react';\nimport {View, Text} from 'react-native';\nimport {requestPurchase, useIAP} from 'react-native-iap';\n\nconst App = () => {\n  const {\n    connected,\n    products,\n    promotedProductsIOS,\n    subscriptions,\n    purchaseHistories,\n    availablePurchases,\n    currentPurchase,\n    currentPurchaseError,\n    initConnectionError,\n    finishTransaction,\n    getProducts,\n    getSubscriptions,\n    getAvailablePurchases,\n    getPurchaseHistories,\n  } = useIAP();\n\n  const handlePurchase = async (sku: string) => {\n    await requestPurchase({sku});\n  };\n\n  useEffect(() => {\n    // ... listen to currentPurchaseError, to check if any error happened\n  }, [currentPurchaseError]);\n\n  useEffect(() => {\n    // ... listen to currentPurchase, to check if the purchase went through\n  }, [currentPurchase]);\n\n  return (\n    <>\n      <Button\n        title=\"Get the products\"\n        onPress={getProducts(['com.example.consumable'])}\n      />\n\n      {products.map((product) => (\n        <View key={product.productId}>\n          <Text>{product.productId}</Text>\n\n          <Button\n            title=\"Buy\"\n            onPress={() => handlePurchase(product.productId)}\n          />\n        </View>\n      ))}\n    </>\n  );\n};\n")))}d.isMDXComponent=!0}}]);