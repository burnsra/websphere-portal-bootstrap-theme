<%-- Licensed Materials - Property of IBM, 5724-E76, (C) Copyright IBM Corp. 2001, 2004, 2006, 2010 - All Rights reserved. --%>
<%-- This JSP will render the Plain.html template which only displays the layout of the page --%>
<%@ page session="false" buffer="none" %>
<%@ page trimDirectiveWhitespaces="true" %><%@ 
taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %><%@
taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ include file="./includePortalTaglibs.jspf" %>
<%@ taglib uri="/WEB-INF/tld/portal-internal.tld" prefix="portal-internal" %>
<%--
--%><portal-core:constants/><portal-core:defineObjects/><portal-internal:adminNavHelper/><%@ 
include file="./bootstrap.jspf" %><%--
<%-- The Plain template is determined by whether there is a value set in page meta data, 
if no value is set in the meta data, then it defaults to the template stored in webdav --%><%--
--%><c:choose><%--
--%><c:when test="${empty themeWebDAVBaseURI}"><c:set var="themeTemplateURI" value="" /></c:when><%--
--%><c:when test="${empty dirMD['com.ibm.portal.theme.template.file.name.html']}"><c:set var="themeTemplateURI" value="${themeWebDAVBaseURI}Plain.html" /></c:when><%--
--%><c:otherwise><c:set var="themeTemplateURI" value="${themeWebDAVBaseURI}Plain.html" /></c:otherwise><%--
--%></c:choose><%--
--%><c:choose><%--
--%><c:when test="${!empty themeTemplateURI}"><%--
--%><r:dataSource uri="spa:${wp.identification[currentNavNode]}" escape="none"><%--
	--%><r:param name="themeURI" value="${themeTemplateURI}"/><%--
	--%><r:param name="mime-type" value="text/html"/><%--
--%></r:dataSource><%--
--%></c:when><%-- If no Plain template is found, the fallback.jsp is rendered
--%><c:otherwise><%@ include file="./fallback.jsp" %></c:otherwise><%--
--%></c:choose>
