<%@ page session="false" buffer="none" %> 
<%@ page trimDirectiveWhitespaces="true" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ include file="../includePortalTaglibs.jspf" %>
<%@ taglib uri="/WEB-INF/tld/SearchMenuControl.tld" prefix="searchmenu" %>
<portal-core:constants/><portal-core:defineObjects/>
<%-- The following variables are defined in bootstrap.jspf for performance reasons and reused here:
    * selectionPath
    * deviceClass
    * isMobile --%>
<portal-navigation:urlGeneration allowRelativeURL="true" contentNode="ibm.portal.Search Center" layoutNode="ibm.portal.Search Center Portlet Window" portletParameterType="action">
<portal-navigation:urlParam name="javax.portlet.action" value="newQuery" type="action"/>
<form name="searchQueryForm" method="get" action="<%wpsURL.write(out);%>" class="navbar-form pull-right visible-desktop">
	<input type="hidden" value="<searchmenu:currentContentNode/>" name="sourceContentNode">
	<label for="wpthemeSearchBoxInput" class="wpthemeDisplayNone"><portal-fmt:text key="search.theme.searchbox.alttext" bundle="nls.engine"/></label>
	<input class="search-query" type="text" id="wpthemeSearchBoxInput" name="query" placeholder="Search" <c:if test="${isMobile}">value="<portal-fmt:text key="theme.search.site" bundle="nls.commonUI"/>" onclick="javascript:this.value=''"</c:if>>
	<input class="wpthemeSearchButton" type="image" src="${wp.themeConfig['resources.modules.ibm.contextRoot']}/themes/html/dynamicSpots/icons/blank.gif" title="<portal-fmt:text key="search.theme.searchresultsicon.alttext" bundle="nls.engine"/>" alt="Search">
</form>		
</portal-navigation:urlGeneration>
