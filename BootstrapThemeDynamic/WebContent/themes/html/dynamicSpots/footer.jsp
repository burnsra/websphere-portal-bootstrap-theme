<%@ page session="false" buffer="none" %>
<%@ page trimDirectiveWhitespaces="true" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ include file="../includePortalTaglibs.jspf" %>
<portal-core:constants/><portal-core:defineObjects/>
<c:set var="deviceClass" scope="request" value="${wp.clientProfile['DeviceClass']}" />
<c:set var="columnCount" scope="request" value="6" />

<portal-logic:if loggedIn="yes">
	<c:set var="columnCount" scope="request" value="4" />
</portal-logic:if>
<hr />
<div class="row">
	<div class="col-span-<c:out value="${columnCount}"/>">
		<h2><portal-fmt:text key="help.title" bundle="nls.commonUI"/></h2>
		<ul class="list-unstyled">
			<li><a href="http://www.ibm.com/websphere/portal/library"><portal-fmt:text key="help.documentation" bundle="nls.commonUI"/></a></li>
			<li><a href="http://www.lotus.com/ldd/portalwiki.nsf/"><portal-fmt:text key="help.wiki" bundle="nls.commonUI"/></a></li>
			<li><a href="http://www.lotus.com/ldd/portalwiki.nsf/xpViewCategories.xsp?lookupName=Video%20Gallery"><portal-fmt:text key="help.media" bundle="nls.commonUI"/></a></li>
			<li><a href="http://www.ibm.com/websphere/developer/zones/portal/"><portal-fmt:text key="help.zone" bundle="nls.commonUI"/></a></li>
		</ul>
	</div>
	<div class="col-span-<c:out value="${columnCount}"/>">
		<h2><portal-fmt:text key="support.title" bundle="nls.commonUI"/></h2>
		<ul class="list-unstyled">
			<li><a href="http://www.ibm.com/software/genservers/portal/support/"><portal-fmt:text key="support.page" bundle="nls.commonUI"/></a></li>
			<li><a href="http://www-01.ibm.com/support/docview.wss?rs=1070&amp;uid=swg27007791"><portal-fmt:text key="support.hardware.software" bundle="nls.commonUI"/></a></li>
			<li><a href="http://www14.software.ibm.com/webapp/set2/sas/f/handbook/home.html"><portal-fmt:text key="support.guide" bundle="nls.commonUI"/></a></li>
		</ul>
	</div>
	<portal-logic:if loggedIn="yes">
	<div class="col-span-<c:out value="${columnCount}"/>">
		<h2><portal-fmt:text key="search.explore.title" bundle="nls.commonUI"/></h2>
		<ul class="list-unstyled">
			<li><a href="?uri=nm:oid:ibm.portal.Search"><portal-fmt:text key="search.center.page" bundle="nls.commonUI"/></a></li>
			<li><a href="?uri=nm:oid:ibm.portal.Tagging"><portal-fmt:text key="tagging.rating.page" bundle="nls.commonUI"/></a></li>
		</ul>
	</div>
	</portal-logic:if>
</div>

<script id="JS_jQuery" src="/BootstrapThemeStatic/themes/Portal8.0/js/jquery.js"></script>
<script id="JS_BootstrapTransition" src="/BootstrapThemeStatic/themes/Portal8.0/js/bootstrap-transition.js"></script>
<script id="JS_BootstrapAlert" src="/BootstrapThemeStatic/themes/Portal8.0/js/bootstrap-alert.js"></script>
<script id="JS_BootstrapModal" src="/BootstrapThemeStatic/themes/Portal8.0/js/bootstrap-modal.js"></script>
<script id="JS_BootstrapDropdown" src="/BootstrapThemeStatic/themes/Portal8.0/js/bootstrap-dropdown.js"></script>
<script id="JS_BootstrapScrollspy" src="/BootstrapThemeStatic/themes/Portal8.0/js/bootstrap-scrollspy.js"></script>
<script id="JS_BootstrapTab" src="/BootstrapThemeStatic/themes/Portal8.0/js/bootstrap-tab.js"></script>
<script id="JS_BootstrapTooltip" src="/BootstrapThemeStatic/themes/Portal8.0/js/bootstrap-tooltip.js"></script>
<script id="JS_BootstrapPopover" src="/BootstrapThemeStatic/themes/Portal8.0/js/bootstrap-popover.js"></script>
<script id="JS_BootstrapButton" src="/BootstrapThemeStatic/themes/Portal8.0/js/bootstrap-button.js"></script>
<script id="JS_BootstrapCollapse" src="/BootstrapThemeStatic/themes/Portal8.0/js/bootstrap-collapse.js"></script>
<script id="JS_BootstrapCarousel" src="/BootstrapThemeStatic/themes/Portal8.0/js/bootstrap-carousel.js"></script>
<script id="JS_BootstrapTypeahead" src="/BootstrapThemeStatic/themes/Portal8.0/js/bootstrap-typeahead.js"></script>
<script id="JS_BootstrapAffix" src="/BootstrapThemeStatic/themes/Portal8.0/js/bootstrap-affix.js"></script>
<script type="text/javascript">
	$('#utb-project-info').hide();
	$('.utb-project-quicklink').removeAttr('class');
	$('#utb-edit-mode-quicklink').unwrap().wrap('<ul class="nav visible-desktop"/>').wrap('<li/>');
	$('#utb-view-mode-quicklink').unwrap().wrap('<ul class="nav visible-desktop"/>').wrap('<li/>');
</script>