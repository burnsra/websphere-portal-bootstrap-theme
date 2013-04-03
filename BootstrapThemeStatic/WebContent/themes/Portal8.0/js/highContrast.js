(function(){
if(!i$.isIE){
i$.addOnLoad(function(){
var _1=document.createElement("div");
var _2=ibmCfg.themeConfig.themeWebAppBaseURI;
_1.style.cssText="border:1px solid;border-color:red green;position:absolute;height:5px;top:-999px;background-image:url(\""+_2+"/icons/blank.gif\");";
document.body.appendChild(_1);
var _3=null;
try{
_3=document.defaultView.getComputedStyle(_1,"");
}
catch(e){
_3=_1.currentStyle;
}
var _4=_3.backgroundImage;
if((_3.borderTopColor==_3.borderRightColor)||(_4!=null&&(_4=="none"||_4=="url(invalid-url:)"))){
document.getElementsByTagName("body")[0].className+=" wpthemeImagesOff";
}
document.body.removeChild(_1);
});
}
})();

