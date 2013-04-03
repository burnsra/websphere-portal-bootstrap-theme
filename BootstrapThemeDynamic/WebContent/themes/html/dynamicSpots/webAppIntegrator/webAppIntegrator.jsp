<%@ page session="false" buffer="none" contentType="text/javascript" %> 
<%-- Licensed Materials - Property of IBM, 5724-E76, (C) Copyright IBM Corp. 2007 - All Rights reserved. --%> 
<%@ page import="java.net.URL,com.ibm.wps.state.utils.CharWriter,java.util.LinkedHashMap,java.util.Iterator,java.io.Reader"%>


<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ include file="../../includePortalTaglibs.jspf" %>
<%@ taglib uri="/WEB-INF/tld/portal-internal.tld" prefix="portal-internal" %>

<portal-core:constants/><portal-core:defineObjects/><portal-internal:adminNavHelper/>
<%@ include file="../../bootstrap.jspf" %>

<c:set var="wpthemeWAI" value="true" scope="request"/>
<c:set var="isDebug" value="${wp.themeConfig['wai.isDebug']}"/>


<%--get theme template--%>
<c:choose>
<c:when test="${!empty dirMD['com.ibm.portal.theme.template.file.name.html']}">
    <c:set var="waiCustomTemplate" value="${dirMD['com.ibm.portal.theme.template.file.name.html']}" /> <%--use theme template set for the page--%>
    <c:if test="${waiCustomTemplate == 'ic4_wai'}">
        var ic4_wai_integration = true;
        <c:set var="waiCustomTemplate" value=""/>
    </c:if>
</c:when>
<c:otherwise>
    <c:set var="waiCustomTemplate" value="" /> <%--use default--%>
</c:otherwise>
</c:choose>

<c:set var="markupPath" value="${wp.themeList.current.contextRoot}/themes/html/${wp.themeList.current.resourceRoot}/webAppIntegrator/markup${waiCustomTemplate}" scope="request"/>

<% 
Boolean debugIntegrator=new Boolean ((String)pageContext.getAttribute("isDebug"));
if (debugIntegrator) {
    System.out.println("webAppIntegrator Theme Template BEGIN - "+pageContext.getAttribute("waiCustomTemplate"));
}
%> 

<%-- there are two script tags (one at the top of the body and one at the bottom - we need to know which to process --%>
if (typeof waiScriptInstance == "undefined") {
    var waiScriptInstance = "top";
    document.createElement("nav");<%--for browsers that do not support the nav tag (like IE7/8)--%>
    if ("<c:out value="${waiCustomTemplate}"/>"=="SideNav"){
        document.body.className += " wpthemeSplitView lotusui30dojo tundra";
    }
    else if (typeof ic4_wai_integration!="undefined" && ic4_wai_integration===true) {
        document.body.className += "  wptheme_ic4_wai";
    }
    else {
        document.body.className += " lotusui30dojo tundra";
    }
    var metaTags = document.getElementsByTagName("meta");
    var hasViewportMeta = false;
    for (var i=0; i<metaTags.length; i++) {
        if (metaTags[i].name == "viewport") {
            hasViewportMeta = true;
        }
    }
    if (!hasViewportMeta) {
        var headId = document.getElementsByTagName("head")[0];         
        var metaNode = document.createElement("meta");
        metaNode.name = "viewport";
        metaNode.content = "width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1";
        headId.appendChild(metaNode);
    }
}
else {
    var waiScriptInstance = "bottom";
}

<%
String portalContext = com.ibm.wps.services.config.Config.URI_CONTEXT_PATH;
URL absolutePortalContextURL = new URL(request.getScheme(),request.getServerName(),request.getServerPort(),portalContext);
String pathInfo = request.getPathInfo();
String requestURL = request.getRequestURL().toString();
URL absolutePortalRootURL = new URL(requestURL.substring(0, requestURL.indexOf(pathInfo)));

final String OUTPUT_VAR = "waiVarOutput";
final String WAI_HEAD = "waiHead";
final String WAI_CONFIG = "waiConfig";
final String WAI_NAV = "waiNav";
final String WAI_FOOTER = "waiFooter";

Map dataSourceMap = new LinkedHashMap();
    dataSourceMap.put("waiHeadMarkup.jsp", WAI_HEAD);
    dataSourceMap.put("waiNavMarkup.jsp", WAI_NAV);
    dataSourceMap.put("waiFooterMarkup.jsp", WAI_FOOTER);
    dataSourceMap.put("waiConfigMarkup.jsp", WAI_CONFIG); 

Iterator it = dataSourceMap.entrySet().iterator();
while (it.hasNext()) {
    Map.Entry entry = (Map.Entry)it.next();
    pageContext.setAttribute("markupJsp", (String)entry.getKey(), PageContext.PAGE_SCOPE);
    String processingSection = (String)entry.getValue();
    if (debugIntegrator) {
        System.out.println("webAppIntegrator: generating markup from "+
            pageContext.getAttribute("markupPath", PageContext.REQUEST_SCOPE)+"/"+pageContext.getAttribute("markupJsp", PageContext.PAGE_SCOPE));
    }
%>
        
        <r:dataSource uri='<%="spa:" + pageContext.getAttribute("currentNavNodeID", PageContext.REQUEST_SCOPE)%>' escape="none" var="<%=OUTPUT_VAR%>">
            <r:param name="themeURI" value="res:${markupPath}/${markupJsp}"/>
            <r:param name="mime-type" value="text/html"/>
        </r:dataSource>
<%

    CharWriter waiWriter = (CharWriter)pageContext.getAttribute(OUTPUT_VAR, PageContext.PAGE_SCOPE);
    if (waiWriter == null) continue;
    Reader waiReader = waiWriter.newReader();
    // loop through the characters to create a one line string which we can document.write
    StringBuffer sb = new StringBuffer("");
    int r = 0;
    while((r = waiReader.read()) != -1) { 
        char c = (char) r;
        if (c != '\n' && c != '\r' && c != '\t') {
            if (c == '\'') {
                // append and escape to the string buffer before this char because document.write uses ' to enclose the string
                sb.append('\\');
            }
            sb.append(c);
        }
    }
    String markupResult = sb.toString();
    markupResult = markupResult.replaceAll("\""+portalContext, "\""+absolutePortalContextURL);
    markupResult = markupResult.replaceAll("\'"+portalContext, "\'"+absolutePortalContextURL);
    if (processingSection.equals(WAI_NAV) || processingSection.equals(WAI_FOOTER)) {
        markupResult = markupResult.replaceAll("\\?uri", absolutePortalRootURL+"?uri");
    }
    else if (processingSection.equals(WAI_CONFIG)) {
        markupResult = markupResult.replace("}ibmCfg", "};ibmCfg");
        markupResult = markupResult.replace("<script ", "<script defer "); // this prevents IE from executing the scripts out of order
        markupResult = markupResult.replaceFirst("<script defer ", "<script "); // this ensures the first script tag (which initializes js) executes before the others
    }

%>

<%--top writes head and nav.  bottom writes footer and config.--%>
var currentMarkupSection = '<%=processingSection%>';
if ((waiScriptInstance == "top" && (currentMarkupSection == '<%=WAI_HEAD%>' || currentMarkupSection == '<%=WAI_NAV%>')) ||
    (waiScriptInstance == "bottom" && (currentMarkupSection == '<%=WAI_FOOTER%>' || currentMarkupSection == '<%=WAI_CONFIG%>'))){
    document.write('<%=markupResult%>');
}

<%
    waiWriter.close();
    waiReader.close();
}
%>


<%
if (debugIntegrator) {
    System.out.println("webAppIntegrator Theme Template END");
}
%>

