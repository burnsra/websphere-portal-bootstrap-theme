<%@ page session="false" buffer="none" %> 
<%@ page trimDirectiveWhitespaces="true" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ include file="../includePortalTaglibs.jspf" %>

<%-- The following variables are defined in bootstrap.jspf for performance reasons and reused here:
    * selectionPath
    * deviceClass
    * isMobile --%>
<c:if test="${deviceClass != 'smartphone'}">
<c:if test="${fn:length(selectionPath) > (param.startLevel+1)}">
<ul class="breadcrumb">
	<c:forEach var="node" items="${selectionPath}" begin="${param.startLevel}">
		<c:set var="nodeID" value="${wp.identification[node]}"/>
		<c:set var="separator" value="&gt;" />
		<c:if test="${!node.metadata['com.ibm.portal.Hidden']}">
			<c:choose>
				<c:when test="${wp.identification[wp.selectionModel.selected] == nodeID}">
					<li class="active" lang="${node.title.xmlLocale}" dir="${node.title.direction}"><c:choose><c:when test="${node.projectID != null}">(<c:choose><c:when test="${node.title == 'Home'}"><span class="glyphicon glyphicon-home"></span></c:when><c:otherwise><c:out value="${node.title}"/></c:otherwise></c:choose>)</c:when><c:otherwise><c:choose><c:when test="${node.title == 'Home'}"><span class="glyphicon glyphicon-home"></span></c:when><c:otherwise><c:out value="${node.title}"/></c:otherwise></c:choose></c:otherwise></c:choose></li>
				</c:when>
				<c:when test="${node.contentNode.contentNodeType == 'LLABEL'}">
					<span lang="${node.title.xmlLocale}" dir="${node.title.direction}"><c:choose><c:when test="${node.projectID != null}">(<c:out value="${node.title}"/>)</c:when><c:otherwise><c:out value="${node.title}"/></c:otherwise></c:choose></span>
				</c:when>
				<c:otherwise>
					<portal-navigation:urlGeneration contentNode="${nodeID}" keepNavigationalState="false">
					<!-- <li><a href="?uri=nm:oid:${nodeID}" lang="${node.title.xmlLocale}" dir="${node.title.direction}"><c:choose><c:when test="${node.projectID != null}">(<c:out value="${node.title}"/>)</c:when><c:otherwise><c:out value="${node.title}"/></c:otherwise></c:choose></a></li> -->
					<li><a href="<%wpsURL.write(out);%>" lang="${node.title.xmlLocale}" dir="${node.title.direction}"><c:choose><c:when test="${node.projectID != null}">(<c:choose><c:when test="${node.title == 'Home'}"><span class="glyphicon glyphicon-home"></span></c:when><c:otherwise><c:out value="${node.title}"/></c:otherwise></c:choose>)</c:when><c:otherwise><c:choose><c:when test="${node.title == 'Home'}"><span class="glyphicon glyphicon-home"></span></c:when><c:otherwise><c:out value="${node.title}"/></c:otherwise></c:choose></c:otherwise></c:choose></a></li>
					</portal-navigation:urlGeneration>
				</c:otherwise>
			</c:choose>
		</c:if>
	</c:forEach>
</ul>
</c:if>
</c:if>
