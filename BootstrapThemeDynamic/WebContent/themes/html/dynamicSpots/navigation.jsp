<%@ page session="false" buffer="none" %> 
<%@ page trimDirectiveWhitespaces="true" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ include file="../includePortalTaglibs.jspf" %>

<%-- The following variables are defined in bootstrap.jspf for performance reasons and reused here:
    * selectionPath
    * deviceClass
    * isMobile --%>
<c:set var="toolbarMode"><r:dataSource uri="utb:state" mode="download"></r:dataSource></c:set><%-- the current toolbar mode ("closed", "open" or "minimized") --%>
<c:set var="inEditMode" value="${toolbarMode eq 'minimized' or toolbarMode eq 'open'}"/><%-- the page is in edit mode if the toolbar is either open or minimized --%>
<c:set var="startLevel" value="${param.startLevel}" />
<c:set var="selectedNodeID" value="${wp.identification[wp.selectionModel.selected]}" />
<c:set var="selectionPathLength" value="${fn:length(selectionPath)}" />
<c:set var="primeNavigation" value="${ccConfig['cc.primeNavigation'] and inEditMode}" />

<c:choose>
<c:when test="${empty param.levelsDisplayed}">
	<c:set var="endLevel" value="${startLevel}" />
</c:when>
<c:otherwise>
	<c:set var="endLevel" value="${param.startLevel + (param.levelsDisplayed-1)}"/>
</c:otherwise>
</c:choose>

<c:if test="${(selectionPathLength > startLevel+1) && !(empty param.levelsDisplayed)}">
	<c:set var="startLevel" value="${selectionPathLength - param.levelsDisplayed}"/>	
	<c:set var="endLevel" value="${selectionPathLength}"/> 
</c:if>

<c:if test="${primeNavigation && param.primeRoot}">
	<span style="display:none;" id="wpthemePrimeRoot" data-nm-level="0" data-nm-primed="<portal-fmt:out><portal-core:navigationNodePriming navigationNode="${wp.identification[selectionPath[0]]}" metaData="${navHiddenMetadata}" considerChildren="false" includeRoles="true" /></portal-fmt:out>"></span>
</c:if>

<c:forEach var="node" items="${selectionPath}" varStatus="status" begin="${startLevel}" end="${endLevel}" step="1">
	<c:set var="level" value="${startLevel + (status.count-1)}"/> 
	<c:set var="childrenAvailable" value="false"/> 
	<c:if test="${(selectionPathLength > level) && wp.navigationModel.hasChildren[selectionPath[level]]}">
		<c:forEach var="node" items="${wp.navigationModel.children[selectionPath[level]]}" varStatus="childrenStatus">
		<c:if test="${!node.metadata['com.ibm.portal.Hidden'] && !(isMobile && node.metadata['com.ibm.portal.mobile.Hidden'])}">
			<c:set var="nodeID" value="${wp.identification[node]}"/>
			<c:if test="${childrenAvailable == false}">
			<div class="wpthemeNavContainer${status.count}">
				<nav class="${param.rootClass}">
					<ul class="wpthemeNavList">
			</c:if>
				<c:set var="primeNode" value="${primeNavigation && wp.selectionModel[node] != null}"/>
					<li class="wpthemeNavListItem wpthemeLeft<c:if test="${wp.selectionModel[node] != null}"> wpthemeSelected</c:if>">
						<a href="?uri=nm:oid:${nodeID}" class="wpthemeLeft<c:if test="${childrenStatus.count == 1}"> wpthemeFirst</c:if>" <c:if test="${primeNode}">data-nm-level="${level+1}" data-nm-primed="<portal-fmt:out><portal-core:navigationNodePriming navigationNode="${nodeID}" metaData="${navHiddenMetadata}" considerChildren="false" includeRoles="true" /></portal-fmt:out>"</c:if>><span lang="${node.title.xmlLocale}" dir="${node.title.direction}"><c:choose><c:when test="${node.projectID != null}">(<c:out value="${node.title}"/>)</c:when><c:otherwise><c:out value="${node.title}"/></c:otherwise></c:choose><c:if test="${selectedNodeID == nodeID}"><span class="wpthemeAccess"> <portal-fmt:text key="currently_selected" bundle="nls8.Theme"/></span></c:if></span></a>
						<portal-dynamicui:closePage node="${node}"><a class="wpthemeClose wpthemeLeft" href="<%closePageURL.write(out);%>"><img alt="X" src="${themeConfig['resources.modules.ibm.contextRoot']}/themes/html/NavigationClose.gif"></a></portal-dynamicui:closePage>
					</li>
				<c:set var="childrenAvailable" value="true"/> 
		</c:if>
		</c:forEach>
		<c:if test="${childrenAvailable != false}">
					</ul>	
				</nav>
				<div class="wpthemeClear"></div>
			</div>
		</c:if>
	</c:if>
</c:forEach>