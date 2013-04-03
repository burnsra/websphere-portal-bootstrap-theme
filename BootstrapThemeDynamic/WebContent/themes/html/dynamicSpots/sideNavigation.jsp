<%@ page session="false" buffer="none" %> 
<%@ page trimDirectiveWhitespaces="true" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ include file="../includePortalTaglibs.jspf" %>

<c:if test="${empty parentNode}">
	<c:set var="parentNode" value="${wp.selectionModel.selectionPath[param.startLevel]}" />
</c:if>

<c:set var="primeNavigation" value="${ccConfig['cc.primeNavigation']}" />
<c:set var="selectedNodeID" value="${wp.identification[wp.selectionModel.selected]}" />
<c:set var="childrenAvailable" value="false"/> 

<c:forEach var="node" items="${wp.navigationModel.children[parentNode]}">
	<c:if test="${!node.metadata['com.ibm.portal.Hidden']}">
		
		<c:if test="${childrenAvailable == false}">
			<ul class="wpthemeNavList wpthemeNavContainer">
		</c:if>
		
		<c:set var="nodeID" value="${wp.identification[node]}"/>
		<c:set var="primeNode" value="${primeNavigation && wp.selectionModel[node] != null}"/>
			
				<li class="wpthemeNavListItem">
					<span>
						<a href="?uri=nm:oid:${nodeID}" <c:if test="${selectedNodeID == nodeID}">class="wpthemeSelected"</c:if> <c:if test="${primeNode}">data-nm-level="${level}" data-nm-primed="<portal-fmt:out><portal-core:navigationNodePriming navigationNode="${nodeID}" metaData="${navHiddenMetadata}" considerChildren="false" /></portal-fmt:out>"</c:if>><span lang="${node.title.xmlLocale}" dir="${node.title.direction}"><c:choose><c:when test="${node.projectID != null}">(<c:out value="${node.title}"/>)</c:when><c:otherwise><c:out value="${node.title}"/></c:otherwise></c:choose><c:if test="${selectedNodeID == nodeID}"><span class="wpthemeAccess"> <portal-fmt:text key="currently_selected" bundle="nls8.Theme"/></span></c:if></span></a>
						<portal-dynamicui:closePage node="${node}"><a class="wpthemeClose" href="<%closePageURL.write(out);%>"><img alt="X" src="${themeConfig['resources.modules.ibm.contextRoot']}/themes/html/NavigationClose.gif"></a></portal-dynamicui:closePage>
					</span>
					<c:if test="${wp.navigationModel.hasChildren[node]}">
						<c:set var="parentNode" value="${node}" scope="request"/>
						<jsp:include page="sideNavigation.jsp"/>
					</c:if>
				</li>
			
		<c:set var="childrenAvailable" value="true"/> 
	</c:if>
</c:forEach>

<c:if test="${childrenAvailable != false}">
</ul>
</c:if>