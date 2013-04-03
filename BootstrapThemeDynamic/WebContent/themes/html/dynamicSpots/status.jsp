<%@ page session="false" buffer="none" %>
<%@ page trimDirectiveWhitespaces="true" %>
<%@ include file="../includePortalTaglibs.jspf" %>
<%@ include file="../helper.jspf" %>
<div class="wpthemeInner">
	<div id="wpthemeStatusBarContainer" class="lotusui30">
		<%-- Renders a message in the status bar alerting the user that javascript is disabled --%>
		<noscript>
			<div class="lotusMessage2" role="alert" wairole="alert">
				<img class="lotusIcon lotusIconMsgError" src="icons/blank.gif" alt="Error" />
				<span class="lotusAltText">Error:</span>
				<div class="lotusMessageBody"><portal-fmt:text key="theme.javascript.disabled" bundle="nls.engine"/></div>
			</div>
		</noscript>
	</div>
</div>