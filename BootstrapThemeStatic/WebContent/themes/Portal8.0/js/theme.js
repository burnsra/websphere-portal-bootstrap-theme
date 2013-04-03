(function(){
var _1=false;
if(typeof wptheme==="undefined"||!wptheme){
wptheme={};
}
i$.mash(wptheme,{togglePageMode:function(){
return i$.modules.loadDeferred().then(function(){
var _2=i$.fromPath("com.ibm.mashups"),_3=_2?com.ibm.mashups.builder.model.Factory.getRuntimeModel():null,_4=_2?com.ibm.mashups.enabler.user.Factory.getUserModel():null,_5=document.getElementsByTagName("body")[0],_6=function(_7){
if(_2){
com.ibm.mashups.services.ServiceManager.getService("eventService").broadcastEvent("com.ibm.mashups.builder.changePageMode",_7);
_3.getCurrentPage().setPageMode(_7);
}
i$.fireEvent("wptheme/contextMenu/invalidate/all");
};
if((!_2&&!i$.hasClass(_5,"edit-mode"))||(_2&&_4.getAnonymousMode()!=com.ibm.mashups.enabler.user.AnonymousMode.ANONYMOUS&&_3.getCurrentPage().getPageMode()!="edit")){
_6("edit");
i$.addClass(_5,"edit-mode");
if(!_1){
if(!i$.isIE&&!i$.isOpera&&_2){
window.onbeforeunload=function(){
if(com.ibm.mashups.builder.model.Factory.getRuntimeModel().getCurrentPage().isDirty()){
return com.ibm.mm.builder.coreWidgetsStrings.I_PAGE_SAVE_WARNING;
}
};
}
_1=true;
}
}else{
_6("view");
i$.removeClass(_5,"edit-mode");
}
},function(_8){
console.log("Error going into edit mode. Most likely a session timeout. Refreshing. "+_8);
window.location.reload();
});
},mobileGoToSearch:function(id,_9,_a,_b,_c,_d,_e){
var _f=document.getElementById(_c);
var _10=document.getElementById("wpthemeSearchBoxInput");
if(i$.hasClass(_f,_9)){
wptheme.toggleMobileNav(id,_9,_a,_b,_c,_d,_e);
if(_10){
setTimeout(function(){
_10.focus();
},550);
}
}else{
if(_10){
_10.focus();
}
}
},mobileNavResizeBinding:null,mobileNavSideLastExpanded:[],mobileNavSideExpanded:[],mobileNavSideTogglingRoot:false,resizeMobileNavSide:function(e){
var _11=document.getElementsByTagName("header")[0];
var _12,id;
_12=document.getElementById("wpthemeNavRoot");
if(_12){
_12.style.top=_11.offsetHeight+"px";
_12.style.height=(window.innerHeight-_11.offsetHeight)+"px";
}
for(var i=0;i<wptheme.mobileNavSideExpanded.length;i++){
id=wptheme.mobileNavSideExpanded[i];
id=id.substr(0,id.length-4)+"Subnav";
_12=document.getElementById(id);
if(_12){
_12.style.top=_11.offsetHeight+"px";
_12.style.height=(window.innerHeight-_11.offsetHeight)+"px";
}
}
},animateMobileNavSidePanel:function(_13,_14,_15){
var _16=_13.offsetLeft;
if(ibmCfg.themeConfig.isRTL){
_16=parseInt(_13.style.right);
}
if(this.mobileNavSideTogglingRoot&&_14<_16){
_14=-_13.offsetWidth;
}
var _17=0;
var _18=Math.ceil(Math.abs(_14-_16)/5);
if(_16==_14){
_18=0;
}else{
if(_16>_14){
_18=-_18;
}
}
if(_18>0&&!this.mobileNavSideTogglingRoot){
if(ibmCfg.themeConfig.isRTL){
_13.style.clip="rect(0px,0px,"+_13.offsetHeight+"px,0px)";
}else{
_13.style.clip="rect(0px,"+_13.offsetWidth+"px,"+_13.offsetHeight+"px,"+_13.offsetWidth+"px)";
}
}
var _19=setInterval(function(){
if(_18>0&&_16+_18>_14){
_18=_14-_16;
}
if(_18<0&&_16+_18<_14){
_18=-(_16-_14);
}
if(_18<0&&!wptheme.mobileNavSideTogglingRoot){
if(ibmCfg.themeConfig.isRTL){
_13.style.clip="rect(0px,"+(_13.offsetWidth-(_17-=_18))+"px,"+_13.offsetHeight+"px,0px)";
}else{
_13.style.clip="rect(0px,"+_13.offsetWidth+"px,"+_13.offsetHeight+"px,"+(_17-=_18)+"px)";
}
}
if(_18>0&&!wptheme.mobileNavSideTogglingRoot){
if(ibmCfg.themeConfig.isRTL){
_13.style.clip="rect(0px,"+(_17+=_18)+"px,"+_13.offsetHeight+"px,0px)";
}else{
_13.style.clip="rect(0px,"+_13.offsetWidth+"px,"+_13.offsetHeight+"px,"+(_13.offsetWidth-(_17+=_18))+"px)";
}
}
if(ibmCfg.themeConfig.isRTL){
_13.style.right=(_16+=_18)+"px";
}else{
_13.style.left=(_16+=_18)+"px";
}
if(_18>0&&_16>=_14||_18<0&&_16<=_14||_18==0){
clearInterval(_19);
_13.style.clip="";
if(_15){
_15.call();
}
}
},1);
},toggleMobileNav:function(id,_1a,_1b,_1c,_1d,_1e,_1f){
var _20=document.getElementById(id);
var _21=document.getElementById("wpthemeNavRootLink");
var _22=document.getElementById(id+"Link");
var _23=document.getElementById(id+"Access");
var _24=document.getElementById(id+"Subnav");
var _25=document.getElementsByTagName("header")[0];
var _26=document.getElementById("layoutContainers");
if(_20){
if(_1f==0){
if(i$.hasClass(_21,"wpthemeNavOpened")){
i$.removeClass(_21,"wpthemeNavOpened");
}else{
i$.addClass(_21,"wpthemeNavOpened");
}
}
if(i$.hasClass(_20,_1a)){
if(id==_1d&&_1e){
this.mobileNavSideTogglingRoot=true;
_20.style.top=_25.offsetHeight+"px";
_20.style.height=(window.innerHeight-_20.offsetTop)+"px";
if(ibmCfg.themeConfig.isRTL){
_20.style.right=(-_20.offsetWidth)+"px";
}else{
_20.style.left=(-_20.offsetWidth)+"px";
}
this.mobileNavResizeBinding=i$.bindDomEvt(window,"resize",this.resizeMobileNavSide);
}
i$.removeClass(_20,_1a);
_20.setAttribute("aria-expanded","true");
_22.setAttribute("aria-label",_1c);
_22.title=_23.innerHTML=_1c;
if(id==_1d&&_1e){
_25.style.position="fixed";
_25.style.width="100%";
_26.style.paddingTop=_25.offsetHeight+10+"px";
_25.style.zIndex="9998";
_25.style.top="0px";
this.animateMobileNavSidePanel(_20,0,function(){
if(wptheme.mobileNavSideLastExpanded.length==0){
wptheme.mobileNavSideTogglingRoot=false;
}
});
}
if(_1e){
if(id==_1d){
for(var i=0;i<this.mobileNavSideLastExpanded.length;i++){
document.getElementById(this.mobileNavSideLastExpanded[i]).onclick.call();
}
}else{
this.mobileNavSideExpanded.push(id+"Link");
_22.parentNode.parentNode.parentNode.onclick=_22.onclick;
}
}
if(_24&&_1e){
var _27=document.getElementById(_1d);
var _28=_27.parentNode;
if(_24.parentNode!=_28){
_24=_24.parentNode.removeChild(_24);
_28.appendChild(_24);
}
var _29=Math.min((_1f*70),Math.floor(window.innerWidth-_24.offsetWidth)-1);
_24.style.top=_27.offsetTop+"px";
_24.style.height=(window.innerHeight-_24.offsetTop)+"px";
if(this.mobileNavSideTogglingRoot){
if(ibmCfg.themeConfig.isRTL){
_24.style.right=(-_24.offsetWidth)+"px";
}else{
_24.style.left=(-_24.offsetWidth)+"px";
}
}else{
if(ibmCfg.themeConfig.isRTL){
_24.style.right=(_29-_24.offsetWidth)+"px";
}else{
_24.style.left=(_29-_24.offsetWidth)+"px";
}
}
i$.removeClass(_24,_1a);
this.animateMobileNavSidePanel(_24,_29,function(){
if(wptheme.mobileNavSideTogglingRoot&&id+"Link"==wptheme.mobileNavSideLastExpanded[wptheme.mobileNavSideLastExpanded.length-1]){
wptheme.mobileNavSideTogglingRoot=false;
}
});
}
}else{
if(_1e){
if(id==_1d){
this.mobileNavSideTogglingRoot=true;
this.mobileNavSideLastExpanded=this.mobileNavSideExpanded.slice(0);
for(var i=this.mobileNavSideExpanded.length-1;i>=0;i--){
document.getElementById(this.mobileNavSideExpanded[i]).onclick.call();
}
}else{
var _2a=id+"Link";
var i=-1;
for(var j=this.mobileNavSideExpanded.length-1;j>=0;j--){
if(this.mobileNavSideExpanded[j]==_2a){
i=j;
break;
}
}
if(i!=-1){
var _2b;
for(var j=this.mobileNavSideExpanded.length-1;j>=i;j--){
_2b=this.mobileNavSideExpanded.pop();
if(_2a!=_2b){
document.getElementById(_2b).onclick.call();
}
}
}
_22.parentNode.parentNode.parentNode.onclick=null;
}
}
if(_24&&_1e){
var _29=_24.offsetLeft;
if(ibmCfg.themeConfig.isRTL){
_29=parseInt(_24.style.right);
}
this.animateMobileNavSidePanel(_24,_29-_24.offsetWidth,function(){
i$.addClass(_24,_1a);
if(_24.parentNode!=_20){
_24=_24.parentNode.removeChild(_24);
_20.appendChild(_24);
}
});
}
if(id==_1d&&_1e){
_25.style.position="static";
_26.style.paddingTop="";
_25.style.width="auto";
_25.style.zIndex="auto";
this.animateMobileNavSidePanel(_20,-_20.offsetWidth,function(){
i$.addClass(_20,_1a);
_20.setAttribute("aria-expanded","false");
_22.setAttribute("aria-label",_1b);
_22.title=_23.innerHTML=_1b;
wptheme.mobileNavSideTogglingRoot=false;
});
i$.unbindDomEvt(this.mobileNavResizeBinding);
this.mobileNavResizeBinding=null;
}else{
i$.addClass(_20,_1a);
_20.setAttribute("aria-expanded","false");
_22.setAttribute("aria-label",_1b);
_22.title=_23.innerHTML=_1b;
}
}
}
},toggleMobileTopNav:function(_2c,_2d){
var _2e=document.getElementById("wpthemeTopNavToggleBtn");
var _2f=document.getElementById("wpthemeTopNavToggleBtnAccess");
var _30=document.getElementsByTagName("header")[0];
var _31=_30.children[0];
if(i$.hasClass(_2e,"wpthemeTopNavOpened")){
_31.style.display="none";
i$.removeClass(_2e,"wpthemeTopNavOpened");
_2e.setAttribute("aria-label",_2c);
_2e.title=_2f.innerHTML=_2c;
}else{
_31.style.display="block";
i$.addClass(_2e,"wpthemeTopNavOpened");
_2e.setAttribute("aria-label",_2d);
_2e.title=_2f.innerHTML=_2d;
}
this.resizeMobileNavSide();
}});
var _32=document.getElementById("wpthemeHelpLink");
var _33=document.getElementById("wpthemeHelpOnClick");
var _34=document.getElementById("wpthemeHelpAnchor");
if(!(_32===null&&_33===null)&&_34!=null){
if(_32!=null){
var _35=_32.innerHTML;
_34.onclick=function(){
window.open(_35,"wpthemeHelp","width=800,height=600");
};
}else{
if(_33!=null){
var _36=_33.innerHTML;
_34.onclick=function(){
eval(_36);
};
}
}
}
})();

