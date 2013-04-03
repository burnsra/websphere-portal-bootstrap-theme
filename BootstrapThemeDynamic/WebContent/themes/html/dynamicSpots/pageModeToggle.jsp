<%@ page session="false" buffer="none"%>
<%@ page trimDirectiveWhitespaces="true"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://www.ibm.com/xmlns/prod/websphere/portal/v8.0/portal-managed-pages-support" prefix="portal-mp"%>
<%@ include file="../includePortalTaglibs.jspf"%>
<c:set var="deviceClass" scope="request" value="${wp.clientProfile['DeviceClass']}" />

<c:if test="${deviceClass != 'smartphone' && deviceClass != 'tablet'}">
<%-- show the page mode toggle button if managed pages is disabled --%>
<portal-logic:if loggedIn="yes">
	<c:set var="toolbarMode"><r:dataSource uri="utb:state" mode="download"></r:dataSource></c:set><%-- the current toolbar mode ("closed", "open" or "minimized") --%>
	<c:set var="closed" value="closed"/><c:set var ="open" value="open"/><c:set var ="minimized" value="minimized"/><%-- toolbar mode constants --%>
	<c:set var="inEditMode" value="${toolbarMode eq minimized or toolbarMode eq open}"/><%-- the page is in edit mode if the toolbar is either open or minimized --%>

	<portal-mp:managedPagesEnabled var="managedPagesEnabled" />
	<c:if test="${!managedPagesEnabled}">
		<%-- render the page mode toggle button --%>
		<c:choose>
			<c:when test="${inEditMode}">
				<c:set var="viewModeDesc"><portal-fmt:text key="toolbar.viewModeDesc" bundle="com.ibm.wps.toolbar.resources.Toolbar"></portal-fmt:text></c:set>
				<button id="utb-view-btn" onclick="javascript:top.location.href='?uri=utb:closed'" role="button" aria-pressed="false" class="wpthemeModeToggle" title="${viewModeDesc}"><portal-fmt:text key="toolbar.viewPage" bundle="com.ibm.wps.toolbar.resources.Toolbar"/></button>
			</c:when>
			<c:otherwise>
				<c:set var="editModeDesc"><portal-fmt:text key="toolbar.editModeDesc" bundle="com.ibm.wps.toolbar.resources.Toolbar"></portal-fmt:text></c:set>
				<button id="utb-edit-btn" onclick="javascript:top.location.href='?uri=utb:open'" role="button" aria-pressed="false" class="wpthemeModeToggle" title="${editModeDesc}"><portal-fmt:text key="toolbar.editPage" bundle="com.ibm.wps.toolbar.resources.Toolbar"/></button>
			</c:otherwise>
		</c:choose>
	</c:if>

	<c:if test="${inEditMode}">
		<%-- This script must always be included in edit mode independent of view button! --%>
		<script type="text/javascript">
			i$.addOnLoad(function(){
				if (typeof wptheme != "undefined") wptheme.togglePageMode();
			});
		</script>
	</c:if>
</portal-logic:if>
</c:if>
