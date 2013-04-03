(function(){
var _1=ibmCfg.portalConfig.contentHandlerURI+((ibmCfg.portalConfig.contentHandlerURI.indexOf("?")<0)?"?":"&")+"uri=menu:${id}";
var _2=false;
var _3=function(){
return i$.hasClass(document.getElementsByTagName("body")[0],"edit-mode");
};
if(typeof wptheme==="undefined"||!wptheme){
wptheme={};
}
i$.mash(wptheme,{getWindowIDFromSkin:function(_4){
while((_4=_4.parentNode)!=null){
if(i$.hasClass(_4,"component-control")){
var m=_4&&(_4.className||"").match(/id-([\S]+)/);
return m&&m[1];
}
}
return null;
},getPortletState:function(_5){
var _6=i$.byId("portletState");
if(_6){
if(!_6._cache){
_6._cache=i$.fromJson(_6.innerHTML);
_6._cache._defaults={"windowState":"normal","portletMode":"view"};
}
if(_6._cache[_5]){
return _6._cache[_5];
}else{
return _6._cache._defaults;
}
}
return {};
},isValidOp:function(_7){
if(_7.visibility===false){
return false;
}
var _8=_7.metadata||{};
switch(_7.id){
case "ibm.portal.operations.changePortletMode":
return wptheme.getPortletState(_8.wid).portletMode!=_8.portletMode;
case "ibm.portal.operations.changeWindowState":
return wptheme.getPortletState(_8.wid).windowState!=_8.windowState;
default:
}
return true;
},operation:{changeToHelpMode:function(_9){
var _a=window.location.href;
if(_9.actionUrl){
if(_9.actionUrl.indexOf("?")==0){
var _b=_a.indexOf("#");
if(_b!=-1){
var _c=_a.substring(0,_b);
var _d=_a.substring(_b);
_a=_c+(_c.indexOf("?")==-1?"?":"&")+_9.actionUrl.substring(1);
_a+=_d;
}else{
_a+=(_a.indexOf("?")==-1?"?":"&")+_9.actionUrl.substring(1);
}
}else{
_a=_9.actionUrl;
}
}
window.open(_a,"","resizable=yes,scrollbars=yes,menubar=no,toolbar=no,status=no,width=800,height=600,screenX=10,screenY=10,top=10,left=10");
}},canImpersonate:function(){
return ibmCfg.portalConfig.canImpersonate;
},contextMenu:{cache:{},css:{focus:"wpthemeMenuFocus",disabled:"wpthemeMenuDisabled",show:"wpthemeMenuShow",error:"wpthemeMenuError",menuTemplate:"wpthemeTemplateMenu",submenuTemplate:"wpthemeTemplateSubmenu",loadingTemplate:"wpthemeTemplateLoading"},init:function(_e,_f,_10){
_e._contextMenu=_e._contextMenu||{};
_e._contextMenu.id=_e._contextMenu.id||Math.round(Math.random()*1000000000);
_e.setAttribute("id",_e._contextMenu.id);
_e._contextMenu.menuId=_f;
_e._contextMenu.jsonQuery=_10;
var _11=_e._contextMenu;
var _12=function(_13){
if(_13.displayMenu){
i$.fireEvent("wptheme/contextMenu/close/all");
if(!_11._submenu){
i$.fireEvent("wptheme/contextMenu/close/all");
wptheme.contextMenu._updateAbsolutePosition(i$.byId(_11.id));
}
var _14=wptheme.contextMenu._adjustScreenPositionStart();
i$.addClass((_11.shadowNode)?_11.shadowNode:i$.byId(_11.id),wptheme.contextMenu.css.show);
wptheme.contextMenu._adjustScreenPositionEnd(_14);
var _15=i$.byId(_11.id)._firstSelectable;
if(_15){
_15.focus();
i$.byId(_11.id)._currentSelected=_15;
}
i$.addListener("wptheme/contextMenu/close/all",function(){
var _16=i$.byId(_11.id);
});
}
};
wptheme.contextMenu._initialize(_e).then(_12,_12);
_e=null;
},initSubmenu:function(_17,_18,_19){
_17._contextMenu=_17._contextMenu||{};
_17._contextMenu._submenu=true;
_17._contextMenu._menuitemTemplate=_19._menuitemTemplate;
_17._contextMenu._subMenuTemplate=_19._subMenuTemplate;
_17._contextMenu._loadingTemplate=_19._loadingTemplate;
wptheme.contextMenu.init(_17,_18,_19.jsonQuery);
},_findFocusNode:function(_1a){
var _1b,i,_1c;
var _1d=function(_1e,_1f){
var l=_1e.childNodes.length;
for(i=0;i<l;i++){
if(_1b){
break;
}
_1c=_1e.childNodes[i];
if(i$.hasClass(_1c,wptheme.contextMenu.css.focus)){
_1b=_1c;
break;
}
if(_1c.childNodes){
i=_1d(_1c,i);
}
}
return _1f;
};
if(i$.hasClass(_1a,wptheme.contextMenu.css.focus)){
return _1a;
}
_1d(_1a);
return _1b;
},_findNodes:function(_20){
var _21,_22,_23,i,_24;
var _25=function(_26,_27){
for(i=_26.childNodes.length-1;i>=0;i--){
_24=_26.childNodes[i];
if(i$.hasClass(_24,wptheme.contextMenu.css.menuTemplate)){
_21=_24;
continue;
}
if(i$.hasClass(_24,wptheme.contextMenu.css.submenuTemplate)){
_22=_24;
continue;
}
if(i$.hasClass(_24,wptheme.contextMenu.css.loadingTemplate)){
_23=_24;
continue;
}
if(_24.childNodes){
i=_25(_24,i);
}
}
return _27;
};
_25(_20);
return {"menu":_21,"submenu":_22,"loading":_23};
},_invalidateCallback:function(){
wptheme.contextMenu.cache={};
},_initialize:function(_28){
var _29=true;
var _2a=_28._contextMenu;
if(wptheme.contextMenu.cache[_2a.id]||_2a._inProgress){
return i$.promise.resolved({displayMenu:_29});
}
_2a._inProgress=true;
i$.addListener("wptheme/contextMenu/invalidate/all",wptheme.contextMenu._invalidateCallback);
var _2b,_2c,tmp=i$.createDom("div");
if(_2a._submenu){
tmp.innerHTML=_2a._subMenuTemplate.replace(/\$\{submenu-id\}/g,_2a.id+"_menu");
_28.appendChild(tmp.firstChild);
_2b=i$.byId(_2a.id+"_menu");
_2c=i$.createDom("div");
_2c.innerHTML=_2a._loadingTemplate;
}else{
var _2d=wptheme.contextMenu._findNodes((_2a.shadowNode)?_2a.shadowNode:_28);
_2b=_2d.menu;
if(!_2a._menuitemTemplate){
_2a._menuitemTemplate=i$.trim(_2b.innerHTML);
}
if(!_2a._loadingTemplate){
_2c=i$.createDom("div");
_2c.appendChild(_2d.loading);
_2a._loadingTemplate=i$.trim(_2c.innerHTML);
_2c=null;
}
_2c=i$.createDom("div");
_2c.innerHTML=_2a._loadingTemplate;
tmp.appendChild(_2d.submenu.cloneNode(true));
if(!_2a._subMenuTemplate){
_2a._subMenuTemplate=i$.trim(tmp.innerHTML);
}
}
while(_2b.firstChild){
_2b.removeChild(_2b.firstChild);
}
_2b.appendChild(_2c);
var _2e;
if(_2a._submenu){
_2e=_2a.shadowNode;
}else{
if(_2a.shadowNode){
_2e=_2a.shadowNode;
}else{
_2e=wptheme.contextMenu._transformIntoAbsolutePosition(_28);
}
}
i$.addClass((_2e)?_2e:_28,wptheme.contextMenu.css.show);
i$.bindDomEvt((_2e)?_2e:_28,"onmouseleave",function(){
if(_2a._inProgress){
_29=false;
}
var _2f=i$.byId(_2a.id);
i$.removeClass((_2a.shadowNode)?_2a.shadowNode:_2f,wptheme.contextMenu.css.show);
if(!_2a.activeAction){
var _30=_2f._currentSelected;
if(_30){
_30.blur();
}
var _31=wptheme.contextMenu._findFocusNode(_2f);
((_31)?_31:_2f).focus();
}
});
return wptheme.contextMenu._load(_2a).then(function(_32){
var _33=wptheme.contextMenu._parseData(_32).then(function(_34){
_34=wptheme.contextMenu._filterMenu(_34);
if(!_34||_34.length==0){
var tmp=i$.createDom("div");
tmp.innerHTML=wptheme.contextMenu._fromTemplate(_2a._menuitemTemplate,wptheme.contextMenu.css.error,wptheme.contextMenu.nls.NO_ITEMS_0);
while(_2b.firstChild){
_2b.removeChild(_2b.firstChild);
}
_2b.appendChild(tmp);
}else{
wptheme.contextMenu._buildMenu(_2a,_2b,_34);
}
_2a._inProgress=false;
wptheme.contextMenu.cache[_2a.id]=true;
return {displayMenu:_29};
});
return _33;
},function(){
var tmp=i$.createDom("div");
tmp.innerHTML=wptheme.contextMenu._fromTemplate(_2a._menuitemTemplate,wptheme.contextMenu.css.error,wptheme.contextMenu.nls.ERROR_LOADING_0);
while(_2b.firstChild){
_2b.removeChild(_2b.firstChild);
}
_2b.appendChild(tmp);
_2a._inProgress=false;
wptheme.contextMenu.cache[_2a.id]=true;
return {displayMenu:_29};
});
},_load:function(_35){
var _36=_1.replace(/\$\{id\}/g,_35.menuId);
if(_35.jsonQuery){
_36+=(_36.indexOf("?")==-1?"?":"&")+i$.toQuery(_35.jsonQuery);
}
return i$.xhrGet({url:_36,headers:{"X-IBM-XHR":"true"},responseType:"json"}).then(function(_37){
return _37.data;
},function(_38){
var _39=_38.xhr.getResponseHeader("Content-Type")||"";
if((_39.indexOf("text/html")==0)||(_38.xhr.status==401)){
window.setTimeout(function(){
document.location.reload();
},0);
}
console.log("Error trying to load the context menu feed for '"+_35.menuId+"': "+_38);
return null;
});
},_parseData:function(_3a){
var _3b=[];
i$.each(_3a,function(_3c){
var _3d=i$.fromPath("moduleInfo.deferred",false,_3c)?i$.modules.loadDeferred():i$.promise.resolved(true);
_3b.push(_3d.then(function(){
var _3e=wptheme.contextMenu._checkFunction(_3c,_3c.visibilityFn,_3c,(typeof _3c.visibility!="undefined")?_3c.visibility:true);
var _3f=wptheme.contextMenu._checkFunction(_3c,_3c.enableFn,_3c,(typeof _3c.enabled!="undefined")?_3c.enabled:true);
return i$.whenAll(_3e,_3f).then(function(_40){
_3c._visible=_40[0];
_3c._enabled=_40[1];
return _3c;
});
}));
});
return i$.whenAll.apply(i$,_3b);
},_filterMenu:function(_41){
var _42=[],_43,_44={"type":"Separator"};
for(var i=_41.length-1;i>=0;i--){
_43=_41[i];
if(!_43._visible){
continue;
}
if(_43.type=="Separator"){
if(_44.type=="Separator"){
continue;
}
}else{
if(_43.type=="Header"){
if((_44.type=="Separator")||(_44.type=="Header")){
continue;
}
}
}
_44=_43;
_42.unshift(_43);
}
while(_42.length>0&&_42[0].type=="Separator"){
_42=_42.slice(1);
}
return _42;
},_buildMenu:function(_45,_46,_47){
var _48=document.createDocumentFragment(),tmp=i$.createDom("div"),_49,_4a,_4b,_4c;
for(var i=0,l=_47.length;i<l;i++){
_49=_47[i];
tmp.innerHTML=wptheme.contextMenu._fromTemplate(_45._menuitemTemplate,_49);
while(_4a=tmp.firstChild){
if(_4a.nodeType==1){
if(_49.type=="Submenu"){
_4a._menuitem=_49;
_4a._jsonData=_45;
i$.bindDomEvt(_4a,"onmouseover",wptheme.contextMenu._applySubmenu);
}else{
if(_49._enabled){
_4a.links={previous:_4b,next:null,sub:null};
if(_4b){
_4b.links.next=_4a;
}
if(!_4c&&_49.type!="Header"){
_4c=_4a;
}
_4a._menuitem=_49;
_4b=_4a;
i$.bindDomEvt(_4a,"onclick",function(evt){
wptheme.contextMenu._stopEventPropagation(evt);
wptheme.contextMenu._applyAction(evt);
setTimeout(function(){
var _4d=i$.byId(_45.id);
i$.removeClass((_45.shadowNode)?_45.shadowNode:_4d,wptheme.contextMenu.css.show);
},0);
});
i$.bindDomEvt(_4a,"onkeydown",function(evt){
return wptheme.contextMenu._applyKeyAction(evt);
});
i$.bindDomEvt(_4a,"onmouseover",function(evt){
return wptheme.contextMenu._applyFocusAction(evt);
});
}
}
if((_49.title)&&(i$.isRTL(_49.title.lang))){
i$.addClass(_4a,"rtl");
_4a.setAttribute("dir","RTL");
}
if(_49.markupId){
_4a.setAttribute("id",_49.markupId);
}
}
_48.appendChild(_4a);
}
}
while(_46.firstChild){
_46.removeChild(_46.firstChild);
}
_46.appendChild(_48);
i$.byId(_45.id)._firstSelectable=_4c;
i$.byId(_45.id)._currentSelected=null;
},_fromTemplate:function(_4e,_4f,_50){
var _51,_52,_53;
if(typeof (_4f)=="string"){
_51=_4f;
_52=_50;
_53="";
}else{
_51="type"+_4f.type;
if(_4f.itemClass){
_51+=" "+_4f.itemClass;
}
if(!_4f._enabled){
_51+=" "+wptheme.contextMenu.css.disabled;
}
_52=(_4f.title)?_4f.title.value:"";
_53=((_4f.description)?_4f.description.value:"");
}
return _4e.replace(/\$\{title\}/g,_52).replace(/"\$\{css-class\}"/g,"\""+(_51)+"\"").replace(/\$\{css-class\}/g,"\""+(_51)+"\"").replace(/"\$\{description\}"/g,"\""+_53+"\"").replace(/\$\{description\}/g,"\""+_53+"\"");
},_checkFunction:function(_54,fn,arg,_55){
if(fn){
if(!_54.fromPath){
_54.fromPath={};
}
var _56=_54.fromPath[fn]||i$.fromPath(fn);
_54.fromPath[fn]=_56;
if(i$.isFunction(_56)){
try{
return _56(arg);
}
catch(exc){
console.log("error executing function "+fn+" - "+exc);
}
}
}
return i$.promise.resolved(_55);
},_stopEventPropagation:function(evt){
if(evt){
if(evt.stopPropagation){
evt.stopPropagation();
}else{
evt.cancelBubble=true;
}
}
},_applyKeyAction:function(evt){
var _57=evt.target||evt.srcElement;
var _58=_57;
var _59=null;
while(!_59){
_58=_58.parentNode;
if(_58._contextMenu){
_59=_58;
}
}
var _5a=_59._contextMenu;
switch(evt.keyCode){
case 13:
wptheme.contextMenu._stopEventPropagation(evt);
var _5b=i$.byId(_5a.id);
i$.removeClass((_5a.shadowNode)?_5a.shadowNode:_5b,wptheme.contextMenu.css.show);
var _5c=wptheme.contextMenu._findFocusNode(_5b);
window.setTimeout(function(){
((_5c)?_5c:_59).focus();
window.setTimeout(function(){
wptheme.contextMenu._applyAction(evt);
},0);
},0);
return false;
case 9:
case 27:
var _5b=i$.byId(_5a.id);
i$.removeClass((_5a.shadowNode)?_5a.shadowNode:_5b,wptheme.contextMenu.css.show);
var _5c=wptheme.contextMenu._findFocusNode(_5b);
((_5c)?_5c:_59).focus();
break;
case 40:
wptheme.contextMenu._moveFocus(evt,_5a,_57,"next");
return false;
case 38:
wptheme.contextMenu._moveFocus(evt,_5a,_57,"previous");
return false;
}
return true;
},_moveFocus:function(evt,_5d,_5e,_5f){
var _60=_5e.links[_5f];
if(_60&&(_60._menuitem.type=="Header"||_60._menuitem.type=="Separator")){
var _61=false;
var _62=null;
while(!_62&&!_61){
_60=_60.links[_5f];
if(!_60){
_61=true;
}else{
if(_60._menuitem.type!="Header"&&_60._menuitem.type!="Separator"){
_62=_60;
}
}
}
_60=_62;
}
if(_60){
var _63=i$.byId(_5d.id)._currentSelected;
if(_63){
_63.blur();
}
i$.byId(_5d.id)._currentSelected=_60;
_60.focus();
}
if(evt.preventDefault){
evt.preventDefault();
}
},_applyFocusAction:function(evt){
var _64=evt.target||evt.srcElement;
var _65=_64;
var _66=null;
var _67=_64._menuitem;
while(!_66){
_65=_65.parentNode;
if(_65._contextMenu){
_66=_65;
}
if(!_67){
_64=_64.parentNode;
_67=_64._menuitem;
}
}
var _68=_66._contextMenu;
var _69=i$.byId(_68.id)._currentSelected;
if(_69!=_64){
if(_69){
_69.blur();
i$.byId(_68.id)._currentSelected=null;
}
if(_67.type!="Header"&&_67.type!="Separator"){
i$.byId(_68.id)._currentSelected=_64;
_64.focus();
}
}
return false;
},_applyAction:function(evt){
var _6a=evt.target||evt.srcElement;
var _6b=_6a;
var _6c=null;
var _6d=_6a._menuitem;
while(!_6c){
_6b=_6b.parentNode;
if(_6b._contextMenu){
_6c=_6b;
}
if(!_6d){
_6a=_6a.parentNode;
_6d=_6a._menuitem;
}
}
var _6e=_6c._contextMenu;
_6e.activeAction=true;
var p=wptheme.contextMenu._checkFunction(_6d,_6d.actionFn,_6d,_6d.actionUrl);
if(p){
p.then(function(_6f){
if(_6f&&i$.isString(_6f)){
var _70=_6d.actionHttpMethod||"GET";
if(_70!="GET"){
var _71=i$.createDom("form");
_71.setAttribute("action",_6f);
_70=_70.toLowerCase();
switch(_70){
case "get":
_71.setAttribute("method","GET");
break;
case "delete":
case "put":
var _72=i$.createDom("input",{"type":"hidden","name":"x-method-override","value":_70.toUpperCase()});
_71.appendChild(_72);
case "post":
_71.setAttribute("method","POST");
_71.setAttribute("enctype","multipart/form-data");
break;
default:
}
i$.byId("wpthemeComplementaryContent").appendChild(_71);
_71.submit();
}else{
window.location.href=_6f;
}
}
});
}
},_applySubmenu:function(evt){
var _73=evt.target||evt.srcElement;
if(!_73._jsonData){
_73=_73.parentNode;
}
if(_73._jsonData){
_73.setAttribute("id",_73._jsonData.id+"_"+_73._menuitem.id);
wptheme.contextMenu.initSubmenu(_73,_73._menuitem.id,_73._jsonData);
}
},_transformIntoAbsolutePosition:function(_74){
var _75=_74.childNodes,_76,i=0,_77=false;
while(_76=_75[i++]){
if(i$.hasClass(_76,"wpthemeMenuRight")){
_77=true;
break;
}else{
if(i$.hasClass(_76,"wpthemeMenuLeft")){
break;
}
}
}
var _78=i$.createDom("div");
_78.className=_74.className;
_78.appendChild(_76);
i$.byId("wpthemeComplementaryContent").appendChild(_78);
_78._contextMenu=_74._contextMenu;
_74._contextMenu.shadowNode=_78;
_74._contextMenu._menuIsRight=_77;
var _79=i$.createDom("span");
_78.appendChild(_79);
i$.addClass(_79,"wpthemeMenuOverlay");
_74._contextMenu.overlayNode=_79;
_74._contextMenu.menuNode=_76;
wptheme.contextMenu._updateAbsolutePosition(_74);
return _78;
},_updateAbsolutePosition:function(_7a){
var _7b=_7a._contextMenu._menuIsRight;
var _7c=_7a._contextMenu.menuNode;
var _7d=_7a._contextMenu.overlayNode;
var _7e=wptheme.contextMenu._findPos(_7a);
var _7f=2;
_7d.style.left=(_7e[0]-_7f)+"px";
_7d.style.top=(_7e[1]-_7f)+"px";
_7d.style.width=(_7a.offsetWidth+(2*_7f))+"px";
_7d.style.height=(_7a.offsetHeight+(2*_7f))+"px";
var dir=document.getElementsByTagName("html")[0].getAttribute("dir");
if(dir!=null){
dir=dir.toLowerCase();
}else{
dir="";
}
if(!(dir=="rtl")){
_7c.style.left=((_7b)?_7e[0]+_7a.offsetWidth:_7e[0])+"px";
}else{
_7c.style.left=((_7b)?_7e[0]+_7a.offsetWidth-_7a.scrollWidth:_7e[0])+"px";
}
_7c.style.top=_7e[1]+"px";
},_adjustScreenPositionStart:function(){
return document.documentElement.scrollHeight;
},_adjustScreenPositionEnd:function(_80){
var _81=document.documentElement.scrollHeight;
if(_80!=_81){
document.documentElement.scrollTop=document.documentElement.scrollHeight;
}
},_findPos:function(obj){
var _82=curtop=0;
if(obj.offsetParent){
do{
_82+=obj.offsetLeft;
curtop+=obj.offsetTop;
}while(obj=obj.offsetParent);
return [_82,curtop];
}
}}});
})();

