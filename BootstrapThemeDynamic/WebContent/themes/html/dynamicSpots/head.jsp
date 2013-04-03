<%@ page session="false" buffer="none" %> 
<%@ page trimDirectiveWhitespaces="true" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ include file="../includePortalTaglibs.jspf" %>
<portal-core:constants/><portal-core:defineObjects/> 
<%@ include file="../helper.jspf" %>
<portal-core:stateBase/>
<title><c:out value='<%=pageContext.getAttribute("pageTitle", PageContext.REQUEST_SCOPE)%>' /></title>
<portal-core:portletsHeadMarkupElements method="xhtml" filter="title"/>
<portal-navigation:urlGeneration navigationNode='<%=(String)pageContext.getAttribute("currentNavNodeID", PageContext.REQUEST_SCOPE)%>'>
<link id="com.ibm.lotus.NavStateUrl" rel="alternate" href="<%wpsURL.write(escapeXmlWriter);%>" />
<c:set var="currentNavNode" scope="request" value="${wp.selectionModel.selected}" />
<link rel="bookmark" title='<c:out value="${currentNavNode.title}"/>' href='<%wpsURL.write(escapeXmlWriter);%>' hreflang="<%=pageContext.getAttribute("preferredLocale", PageContext.REQUEST_SCOPE)%>"/>
</portal-navigation:urlGeneration>
<link href="<%=getStaticUrl(pageContext, "portalIcon")%>" rel="shortcut icon" type="image/x-icon" />

<%-- link the color palette style set for the page --%><%
{
	String colorPaletteUrl = (String)pageContext.getAttribute("colorPaletteUrl", PageContext.REQUEST_SCOPE);
	if(colorPaletteUrl != null) {
%><link title="assigned" href="<%=colorPaletteUrl%>" rel="stylesheet" type="text/css" /><%
	}
}
%><%-- link the page's style overrides stored in meta data --%><% 
{
	String pageStyle = (String)pageContext.getAttribute("pageStyle", PageContext.REQUEST_SCOPE);
	if(pageStyle != null) {
%><link id="ibmPageStyleLink" href="<%=pageStyle%>" rel="stylesheet" type="text/css" /><%
	}
}
%>
