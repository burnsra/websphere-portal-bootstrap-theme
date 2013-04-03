dojo.provide("com.ibm.skins.Hidden.skin");

dojo.require("com.ibm.pb.decorations.Control");
dojo.require("com.ibm.pb.decorations.ControlMenu");

/**
 * Instances of this module are created at the root DOM node for each layout control
 * whose skin markup includes a marker that contains the resource name of this module,
 * namely com.ibm.skins.Hidden.skin.  It is passed the ID of the layout control
 * and the root DOM node in the constructor.  This particular skin module decorates
 * the markup with additional markup for creating a drop-down context menu for performing
 * actions on the control (such as portlet or widget actions).  It also has some logic
 * for adding a dnd handle as well as dynamically inserting the control id for
 * active-site analytics (ASA) support.
 */
dojo.declare("com.ibm.skins.Hidden.skin", com.ibm.pb.decorations.Control, {
	_wFct: com.ibm.mashups.iwidget.model.Factory,

	contextMenuOpenEvent: null,
	contextMenuCloseEvent: null,
	
	contextMenuMarkup: 
		 '<div class="iw-iWidget iw-Standalone" id="${iWidgetMenuId}">'
			+'<a class="iw-Definition" href="${builderRoot}/widget-catalog/ContentSetMenu.xml?pragma=cache&max-age=1209600&cache-scope=public&vary=none&user-context=false"></a>'
			+'<span class="iw-ItemSet" title="attributes" style="display: none;">'
				+'<a class="iw-Item" href="#contextMenuID">widgetActions_${id}</a>'
				+'<a class="iw-Item" href="#menuCSSClass">lotusActionMenu</a>'
				+'<a class="iw-Item" href="#resourceType">com.ibm.mashups.iwidget.widget.IWidgetDefinition</a>'
				+'<a class="iw-Item" href="#openEvent">WidgetActions_${id}.open</a>'
				+'<a class="iw-Item" href="#closeEvent">WidgetActions_${id}.close</a>'
			+'</span>'
		+'</div>',
	
	constructor: function(id, node) {
		var mname = "constructor", lgr = this.LOGGER;
		this.id = id;
		this.iWidgetMenuId = "widgetActionsMenu_" + id;
		this.root = node;
		this.contextMenuOpenEvent = "WidgetActions_" + id + ".open";
		this.contextMenuCloseEvent = "WidgetActions_" + id + ".close";
		this.contextMenu = new com.ibm.pb.decorations.ControlMenu(id, "widgetActions_" + id);
		var parseRoot = dojo.query(".decoration-contextMenu", node)[0];
		if(parseRoot) {
			var map = dojo.delegate(this, {builderRoot: ibmConfig["com.ibm.mashups.contextroot.builder"]});
			lgr.trace(mname, "Creating hidden context menu widget in skin ${0}", [parseRoot]);
			parseRoot.innerHTML = dojo.string.substitute(this.contextMenuMarkup, map);
			var wm = this._wFct.getGlobalWidgetModel();
			var iWidget = wm.createWidget(parseRoot.firstChild);
			if(iWidget) {
				wm.renderWidget(iWidget);
			}
		}
		this.contextMenuLink = dojo.query(".decoration-contextMenuAction", node)[0];
		if(this.contextMenuLink) {
			lgr.trace(mname, "Attaching event handler to element ${0}", [this.contextMenuLink]);
			this.connect(this.contextMenuLink, "onclick", "openContextMenu");
		}
		this.dndHandle = dojo.query(".decoration-dndHandle", node)[0];
		if(this.dndHandle) {
			lgr.trace(mname, "Adding dojo dnd handle class to element ${0}", [this.dndHandle]);
			dojo.addClass(this.dndHandle, "dojoDndHandle");
		}
		var asaId = dojo.query("*[class~=asa.portlet.id]", node)[0];
		if(asaId) {
			asaId.innerHTML = id;
		}
		var ariaRegion = dojo.query(".decoration-aria-region", node)[0];
		if(ariaRegion) {
			lgr.trace(mname, "Creating ARIA region for element ${0}", [ariaRegion]);
			dojo.attr(ariaRegion, "role", "region");
			dojo.attr(ariaRegion, "aria-labelledby", "title." + id);
			dojo.attr(dojo.query(".decoration-title", node)[0], "id", "title." + id);
		}
	},
	openContextMenu: function(evt) {
		var mname = "openContextMenu", lgr = this.LOGGER;
		lgr.entering(mname, arguments);
		this.evtSvc.broadcastEvent(this.contextMenuOpenEvent, {resourceId: this.id, domNode: evt.target});
		lgr.exiting(mname, arguments);
	},
	destroy: function() {
		this.evtSvc.broadcastEvent("com.ibm.mashups.iwidget.unloadwidgets", [this.iWidgetMenuId]);
		this.contextMenu.destroy();
		delete this.root;
		delete this.dndHandle;
		delete this.contextMenuLink;
		delete this.contextMenu;
		this.inherited(arguments);
	}
});