dojo.provide("com.ibm.skins.NoSkin.skin");

dojo.require("com.ibm.pb.decorations.Control");

dojo.declare("com.ibm.skins.NoSkin.skin", com.ibm.pb.decorations.Control, {
	constructor: function(id, node) {
		var mname = "constructor", lgr = this.LOGGER;
		this.id = id;
		this.root = node;
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
	destroy: function() {
		this.inherited(arguments);
	}
});