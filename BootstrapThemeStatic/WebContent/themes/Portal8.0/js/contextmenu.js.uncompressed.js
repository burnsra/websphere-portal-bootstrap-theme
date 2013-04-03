(function(){
	/**
	 * START of wptheme/ContextMenu
	 */
	
	var contextMenuUrl = ibmCfg.portalConfig.contentHandlerURI + ((ibmCfg.portalConfig.contentHandlerURI.indexOf("?")<0)?"?":"&") + "uri=menu:${id}";
	var editModeInitialized = false;
	var isEditActive = function(){
		return i$.hasClass(document.getElementsByTagName("body")[0], "edit-mode");
	};
	
	if (typeof wptheme === "undefined" || !wptheme) {
		wptheme = {};
	}
	i$.mash(wptheme, {
		getWindowIDFromSkin: function(node){
			while ((node = node.parentNode) != null) {
				if (i$.hasClass(node, "component-control")) {
					var m = node && (node.className || "").match(/id-([\S]+)/);
					return m && m[1];
				}
			}
			return null;
		},
		getPortletState: function(wid){
			// theme includes a hidden DOM node with id "portletState"
			// whose contents are JSON-encoded state information about each portlet
			var node = i$.byId("portletState");
			if (node) {
				if (!node._cache) {
					node._cache = i$.fromJson(node.innerHTML);
					node._cache._defaults = {"windowState":"normal","portletMode":"view"};
				}				
				if (node._cache[wid]) {
					return node._cache[wid];
				} else {
					return node._cache._defaults;
				}
			}
			return {};
		},
		isValidOp: function(menuOp){
			if (menuOp.visibility === false) {
				return false;
			}
			var meta = menuOp.metadata || {};
			switch (menuOp.id) {
				case "ibm.portal.operations.changePortletMode":
					return wptheme.getPortletState(meta.wid).portletMode != meta.portletMode;
				case "ibm.portal.operations.changeWindowState":
					return wptheme.getPortletState(meta.wid).windowState != meta.windowState;
				default:
			}
			return true;
		},
		operation: {
			changeToHelpMode: function(menuitem){
				var _url = window.location.href;
				if (menuitem.actionUrl) {
					if (menuitem.actionUrl.indexOf("?") == 0) { // this is a query URL
						var hashIdx = _url.indexOf("#");
						if (hashIdx != -1) { // this url has a hash
							var mainurl = _url.substring(0, hashIdx);
							var hash = _url.substring(hashIdx);
							_url = mainurl + (mainurl.indexOf("?") == -1 ? "?" : "&") + menuitem.actionUrl.substring(1);
							_url += hash;
						}
						else {
							_url += (_url.indexOf("?") == -1 ? "?" : "&") + menuitem.actionUrl.substring(1);
						}
					}
					else {
						_url = menuitem.actionUrl;
					}
				}
				window.open(_url, '', 'resizable=yes,scrollbars=yes,menubar=no,toolbar=no,status=no,width=800,height=600,screenX=10,screenY=10,top=10,left=10');
			}
		},
		canImpersonate: function() {
			return ibmCfg.portalConfig.canImpersonate;
		},
		contextMenu: {
			cache: {},
			css: {
				focus: "wpthemeMenuFocus",
				disabled: "wpthemeMenuDisabled",
				show: "wpthemeMenuShow",
				error: "wpthemeMenuError",
				menuTemplate: "wpthemeTemplateMenu",
				submenuTemplate: "wpthemeTemplateSubmenu",
				loadingTemplate: "wpthemeTemplateLoading"
			},
			
			init: function(node, menuId, jsonQuery){
				node._contextMenu = node._contextMenu || {};
				node._contextMenu.id = node._contextMenu.id || Math.round(Math.random() * 1000000000);
				node.setAttribute("id", node._contextMenu.id); // we set this back into the DOM so that we can look it up later again
				node._contextMenu.menuId = menuId;
				node._contextMenu.jsonQuery = jsonQuery;
				
				var jsonData = node._contextMenu;
				// generate menu
				var callback = function(result){
					if (result.displayMenu) {
					    
                        // notify other popup windows to close/hide first
                        i$.fireEvent("wptheme/contextMenu/close/all");

						// show menu
                        if(!jsonData._submenu) {
							// notify other popup windows to close/hide first
							i$.fireEvent("wptheme/contextMenu/close/all");
                        	wptheme.contextMenu._updateAbsolutePosition(i$.byId(jsonData.id));
                        }
						var startHeight = wptheme.contextMenu._adjustScreenPositionStart();
						i$.addClass((jsonData.shadowNode)?jsonData.shadowNode:i$.byId(jsonData.id), wptheme.contextMenu.css.show);
						wptheme.contextMenu._adjustScreenPositionEnd(startHeight);
						// set focus here
						var firstSelectable = i$.byId(jsonData.id)._firstSelectable;
						if (firstSelectable) {
							firstSelectable.focus();
							i$.byId(jsonData.id)._currentSelected = firstSelectable;
						}

                        // now attach listener for popup window close event. 
						// Once this popup is being shown, we need to make sure to close it, once
						// another popup window/menu is about to be shown
                        i$.addListener("wptheme/contextMenu/close/all", function() {
                            var _node = i$.byId(jsonData.id);
                            //i$.removeClass((jsonData.shadowNode)?jsonData.shadowNode:_node, wptheme.contextMenu.css.show);
                        });
					}
				};
				wptheme.contextMenu._initialize(node).then(callback, callback);
				node = null;
			},
			
			initSubmenu: function(node, menuId, jsonData){
				node._contextMenu = node._contextMenu || {};
				node._contextMenu._submenu = true;
				node._contextMenu._menuitemTemplate = jsonData._menuitemTemplate;
				node._contextMenu._subMenuTemplate = jsonData._subMenuTemplate;
				node._contextMenu._loadingTemplate = jsonData._loadingTemplate;
				wptheme.contextMenu.init(node, menuId, jsonData.jsonQuery);
			},
			/**
			 * @private
			 */
			_findFocusNode: function(parent){
				var focusNode, i, node;
				var recSearch = function(parent, counter){
					var l = parent.childNodes.length;
					for (i = 0; i < l; i++) {
						if (focusNode) { // interrupt processing
							break;
						}
						node = parent.childNodes[i];
						if (i$.hasClass(node, wptheme.contextMenu.css.focus)) {
							focusNode = node;
							break;
						}
						if (node.childNodes) {
							i = recSearch(node, i); // we need to carry over the current counter
						}
					}
					return counter;
				};
				if (i$.hasClass(parent, wptheme.contextMenu.css.focus)) {
					return parent;
				}
				recSearch(parent);
				return focusNode;
			},
			/**
			 * @private
			 */
			_findNodes: function(parent){
				var menuTemplateNode, submenuTemplateNode, loadingTemplateNode, i, node;
				var recSearch = function(parent, counter){
					for (i = parent.childNodes.length - 1; i >= 0; i--) {
						node = parent.childNodes[i];
						if (i$.hasClass(node, wptheme.contextMenu.css.menuTemplate)) {
							menuTemplateNode = node;
							continue; // we can assume there is no template as child hiding anymore
						}
						if (i$.hasClass(node, wptheme.contextMenu.css.submenuTemplate)) {
							submenuTemplateNode = node;
							continue; // we can assume there is no template as child hiding anymore
						}
						if (i$.hasClass(node, wptheme.contextMenu.css.loadingTemplate)) {
							loadingTemplateNode = node;
							continue; // we can assume there is no template as child hiding anymore
						}
						if (node.childNodes) {
							i = recSearch(node, i); // we need to carry over the current counter
						}
					}
					return counter;
				};
				recSearch(parent);
				return {
					"menu": menuTemplateNode,
					"submenu": submenuTemplateNode,
					"loading": loadingTemplateNode
				};
			},
			/**
			 * @private
			 */
			_invalidateCallback: function(){
				// invalidate all menus
				wptheme.contextMenu.cache = {};
			},
			/**
			 * @private
			 */
			_initialize: function(node){
				var _displayMenu = true;
				var jsonData = node._contextMenu;
				if (wptheme.contextMenu.cache[jsonData.id] || jsonData._inProgress) {
					return i$.promise.resolved({ displayMenu: _displayMenu });
				}
				jsonData._inProgress = true;
				// now attach listener for invalidation
				i$.addListener("wptheme/contextMenu/invalidate/all", wptheme.contextMenu._invalidateCallback);
				// prepare data
				var menuNode, loadingNode, tmp = i$.createDom("div");
				if (jsonData._submenu) {
					tmp.innerHTML = jsonData._subMenuTemplate.replace(/\$\{submenu-id\}/g, jsonData.id + "_menu");
					node.appendChild(tmp.firstChild);
					menuNode = i$.byId(jsonData.id + "_menu");
					loadingNode = i$.createDom("div");
					loadingNode.innerHTML = jsonData._loadingTemplate;
				}
				else {
					// find nodes first
					var templateNodes = wptheme.contextMenu._findNodes((jsonData.shadowNode)?jsonData.shadowNode:node);
					menuNode = templateNodes.menu;
					if (!jsonData._menuitemTemplate) {
						// we only fetch the template the first time, every other call is cause due to an invalidated cache and we already know the templates
						jsonData._menuitemTemplate = i$.trim(menuNode.innerHTML); // fetch template out of UL
					}
					if (!jsonData._loadingTemplate) {
						loadingNode = i$.createDom("div");
						loadingNode.appendChild(templateNodes.loading);
						// we only fetch the template the first time, every other call is cause due to an invalidated cache and we already know the templates
						jsonData._loadingTemplate = i$.trim(loadingNode.innerHTML);
						loadingNode = null;
					}
					loadingNode = i$.createDom("div");
					loadingNode.innerHTML = jsonData._loadingTemplate;
					// get the submenu template now
					tmp.appendChild(templateNodes.submenu.cloneNode(true));
					if (!jsonData._subMenuTemplate) {
						// we only fetch the template the first time, every other call is cause due to an invalidated cache and we already know the templates
						jsonData._subMenuTemplate = i$.trim(tmp.innerHTML);
					}
				}
				
				while (menuNode.firstChild) {
					menuNode.removeChild(menuNode.firstChild);
				}
				// show loading menu
				menuNode.appendChild(loadingNode);
				var shadowNode;
				if (jsonData._submenu) {
				    shadowNode = jsonData.shadowNode; //node;
				} else if (jsonData.shadowNode){
					shadowNode = jsonData.shadowNode;
				} else {
					shadowNode = wptheme.contextMenu._transformIntoAbsolutePosition(node);
				}
				i$.addClass((shadowNode)?shadowNode:node, wptheme.contextMenu.css.show);

				i$.bindDomEvt((shadowNode)?shadowNode:node, "onmouseleave", function(){
					if (jsonData._inProgress) {
						_displayMenu = false;
					}
					var _node = i$.byId(jsonData.id);
					i$.removeClass((jsonData.shadowNode)?jsonData.shadowNode:_node, wptheme.contextMenu.css.show);
					if (!jsonData.activeAction) {
						// acessibility - focus handling
						var selected = _node._currentSelected;
						if (selected) {
							selected.blur();
						}
						var focusNode = wptheme.contextMenu._findFocusNode(_node);
						((focusNode)?focusNode:_node).focus();
					}
				});
				
				// load the data from backend
				return wptheme.contextMenu._load(jsonData).then(function(data){
					var retVal = wptheme.contextMenu._parseData(data).then(function(items){
						items = wptheme.contextMenu._filterMenu(items);
						if (!items || items.length == 0) {
							// there are no menu items to display, so display a special message
							var tmp = i$.createDom("div");
							tmp.innerHTML = wptheme.contextMenu._fromTemplate(jsonData._menuitemTemplate, wptheme.contextMenu.css.error, wptheme.contextMenu.nls.NO_ITEMS_0);
							while (menuNode.firstChild) {
								menuNode.removeChild(menuNode.firstChild);
							}
							menuNode.appendChild(tmp);
						}
						else {
							wptheme.contextMenu._buildMenu(jsonData, menuNode, items);
						}
						jsonData._inProgress = false;
						wptheme.contextMenu.cache[jsonData.id] = true;
						//i$.removeClass((shadowNode)?shadowNode:node, wptheme.contextMenu.css.show);
						return { displayMenu: _displayMenu };
					});
					return retVal;
				}, function(){
					var tmp = i$.createDom("div");
					tmp.innerHTML = wptheme.contextMenu._fromTemplate(jsonData._menuitemTemplate, wptheme.contextMenu.css.error, wptheme.contextMenu.nls.ERROR_LOADING_0);
					while (menuNode.firstChild) {
						menuNode.removeChild(menuNode.firstChild);
					}
					menuNode.appendChild(tmp);
					jsonData._inProgress = false;
					wptheme.contextMenu.cache[jsonData.id] = true;
					return { displayMenu: _displayMenu };
				});
			},
			
			/**
			 * This function returns the JSON data for this context menu from the backend. It has to be in the format XXX
			 * @return {Promise} A promise which gets resolved with the json feed data on success, otherwise null
			 *
			 * @private
			 */
			_load: function(jsonData){
				var _url = contextMenuUrl.replace(/\$\{id\}/g, jsonData.menuId);
				if (jsonData.jsonQuery) {
					_url += (_url.indexOf("?") == -1 ? "?" : "&") + i$.toQuery(jsonData.jsonQuery);
				}
				return i$.xhrGet({
					url: _url,
					headers: {
						"X-IBM-XHR": "true"
					},
					responseType: "json"
				}).then(function(ioData){
					// ioData: {data: data, xhr: xhr}
					return ioData.data;
				}, function(data){
					var contentType = data.xhr.getResponseHeader("Content-Type") || "";
					if ((contentType.indexOf("text/html") == 0) || (data.xhr.status == 401)) {
						// we recognized a timeout as we have been expecting JSON value, but the login form with HTML came back
						// therefore we are refreshing the whole page
						window.setTimeout(function(){
							document.location.reload();
						}, 0);
					}
					console.log("Error trying to load the context menu feed for '" + jsonData.menuId + "': " + data);
					return null;
				});
			},
			
			/**
			 * @private
			 */
			_parseData: function(menuArray){
				var promiseArray = [];
				i$.each(menuArray, function(menuitem){
					var deferredDone = i$.fromPath("moduleInfo.deferred", false, menuitem) ? i$.modules.loadDeferred() : i$.promise.resolved(true);
					promiseArray.push(deferredDone.then(function() {
						var promiseVisibility = wptheme.contextMenu._checkFunction(menuitem, menuitem.visibilityFn, menuitem, (typeof menuitem.visibility != "undefined") ? menuitem.visibility : true);
						var promiseEnabled = wptheme.contextMenu._checkFunction(menuitem, menuitem.enableFn, menuitem, (typeof menuitem.enabled != "undefined") ? menuitem.enabled : true);
						return i$.whenAll(promiseVisibility, promiseEnabled).then(function(dataArray){
							// now inject the calculated values into the menuitem
							menuitem._visible = dataArray[0];
							menuitem._enabled = dataArray[1];
							return menuitem;
						});
					}));
				});
				return i$.whenAll.apply(i$, promiseArray);
			},
			
			/**
			 * @private
			 */
			_filterMenu: function(menuArray){
				var newArray = [], menuitem, previousMenuitem = {
					"type": "Separator"
				};
				for (var i = menuArray.length - 1; i >= 0; i--) {
					menuitem = menuArray[i];
					if (!menuitem._visible) {
						continue;
					}
					if (menuitem.type == "Separator") {
						if (previousMenuitem.type == "Separator") { // we skip duplicates
							continue;
						}
					}
					else if (menuitem.type == "Header") {
						if ((previousMenuitem.type == "Separator") || (previousMenuitem.type == "Header")) { // we skip duplicates
							continue;
						}
					}
					previousMenuitem = menuitem;
					newArray.unshift(menuitem);
				}
				// now shave off any beginning separators
				while (newArray.length > 0 && newArray[0].type == "Separator") {
					newArray = newArray.slice(1);
				}
				return newArray;
			},
			
			/**
			 * @private
			 */
			_buildMenu: function(jsonData, menuNode, menuArray){
				var frag = document.createDocumentFragment(), 
					tmp = i$.createDom("div"), 
					menuitem, childnode, _previous, firstSelectableChild;
				for (var i = 0, l = menuArray.length; i < l; i++) {
					menuitem = menuArray[i];
					// create DOM node
					tmp.innerHTML = wptheme.contextMenu._fromTemplate(jsonData._menuitemTemplate, menuitem);
					while (childnode = tmp.firstChild) {
						if (childnode.nodeType == 1) {
							// now attach the action handler, if the menu item is enabled, and it is not of type submenu
							if (menuitem.type == "Submenu") {
								childnode._menuitem = menuitem;
								childnode._jsonData = jsonData;
								i$.bindDomEvt(childnode, "onmouseover", wptheme.contextMenu._applySubmenu);
							}
							else if (menuitem._enabled) {
								childnode.links = {
									previous: _previous,
									next: null,
									sub: null
								};
								if (_previous) { 
									_previous.links.next = childnode;
								}
								if (!firstSelectableChild && menuitem.type != "Header") {
									firstSelectableChild = childnode;
								}
								childnode._menuitem = menuitem;
								_previous = childnode;
								i$.bindDomEvt(childnode, "onclick", function(evt){
									wptheme.contextMenu._stopEventPropagation(evt);
									
									wptheme.contextMenu._applyAction(evt);
									setTimeout(function(){
										var _node = i$.byId(jsonData.id);
										i$.removeClass((jsonData.shadowNode)?jsonData.shadowNode:_node, wptheme.contextMenu.css.show);
									}, 0);
								});
								i$.bindDomEvt(childnode, "onkeydown", function(evt){
									return wptheme.contextMenu._applyKeyAction(evt);
								});
								i$.bindDomEvt(childnode, "onmouseover", function(evt){
									return wptheme.contextMenu._applyFocusAction(evt);
								});
							}
							// set RTL if needed
							if ((menuitem.title) && (i$.isRTL(menuitem.title.lang))) {
								i$.addClass(childnode, "rtl");
								childnode.setAttribute("dir", "RTL");
							}
							// markupId handling
							if (menuitem.markupId) {
								childnode.setAttribute("id", menuitem.markupId);
							}
						}
						frag.appendChild(childnode);
					}
				}
				while (menuNode.firstChild) {
					menuNode.removeChild(menuNode.firstChild);
				}
				menuNode.appendChild(frag);
				i$.byId(jsonData.id)._firstSelectable = firstSelectableChild;
				i$.byId(jsonData.id)._currentSelected = null;
			},
			
			/**
			 * @private
			 */
			_fromTemplate: function(template, menuitem, enabled){
				var cssClass, title, description;
				if (typeof(menuitem) == "string") {
					// in case menuitem is of type string the signature is:
					// function(template, className, title) and it is always disabled
					cssClass = menuitem;
					title = enabled;
					description = "";
				}
				else {
					cssClass = "type" + menuitem.type;
					if (menuitem.itemClass) {
						cssClass += " " + menuitem.itemClass;
					}
					if (!menuitem._enabled) {
						cssClass += " " + wptheme.contextMenu.css.disabled;
					}
					title = (menuitem.title) ? menuitem.title.value : "";
					description = ((menuitem.description) ? menuitem.description.value : "");
				}
				// the double replacement needs to be done because in FF the template (fetched with innerHTML)
				// retains the double quotes where as they vanish in IE
				return template.replace(/\$\{title\}/g, title).replace(/"\$\{css-class\}"/g, "\"" + (cssClass) + "\"").replace(/\$\{css-class\}/g, "\"" + (cssClass) + "\"").replace(/"\$\{description\}"/g, "\"" + description + "\"").replace(/\$\{description\}/g, "\"" + description + "\"");
			},
			
			/**
			 * @private
			 */
			_checkFunction: function(menuitem, fn, arg, defaultValue){
				if (fn) {
					if (!menuitem.fromPath) {
						menuitem.fromPath = {};
					}
					var fromPath = menuitem.fromPath[fn] || i$.fromPath(fn);
					menuitem.fromPath[fn] = fromPath;
					if (i$.isFunction(fromPath)) {
						try {
							return fromPath(arg);
						} 
						catch (exc) {
							console.log("error executing function " + fn + " - " + exc);
						}
					}
				}
				return i$.promise.resolved(defaultValue);
			},
			/**
			 * @private
			 */
			_stopEventPropagation: function(evt){
				if (evt) {
					if (evt.stopPropagation) {
						evt.stopPropagation();
					}
					else {
						evt.cancelBubble = true;
					}					
				}
			},
			/**
			 * @private
			 */
			_applyKeyAction: function(evt){
				var node = evt.target || evt.srcElement;
				var tempNode = node;
				var menuNode = null;
				while (!menuNode) {
					tempNode = tempNode.parentNode;
					if (tempNode._contextMenu) {
						menuNode = tempNode;
					}
				}
				
				var jsonData = menuNode._contextMenu;
				
				switch (evt.keyCode) {
					case 13: { // ENTER
						wptheme.contextMenu._stopEventPropagation(evt);
						// close menu
						var _node = i$.byId(jsonData.id);
						i$.removeClass((jsonData.shadowNode)?jsonData.shadowNode:_node, wptheme.contextMenu.css.show);
						// move focus
						var focusNode = wptheme.contextMenu._findFocusNode(_node);
						window.setTimeout(function(){
							((focusNode)?focusNode:menuNode).focus();
							window.setTimeout(function(){
								wptheme.contextMenu._applyAction(evt);
							}, 0);
						}, 0);
						return false;
					}
					case 9:// TAB
					case 27: { // ESCAPE
						//close menu
						var _node = i$.byId(jsonData.id);
						i$.removeClass((jsonData.shadowNode)?jsonData.shadowNode:_node, wptheme.contextMenu.css.show);
						// move focus
						var focusNode = wptheme.contextMenu._findFocusNode(_node);
						((focusNode)?focusNode:menuNode).focus();
						break;
					}
					case 40: { // DOWN KEY
						// find next menu item
						wptheme.contextMenu._moveFocus(evt,jsonData,node,"next");
						return false;
					}
					case 38: { // UP KEY
						// find prev menu item
						wptheme.contextMenu._moveFocus(evt,jsonData,node,"previous");
						return false;
					}
				} // end of switch
				return true;
			},
			_moveFocus: function(evt, jsonData, node, direction) {
				var newNode = node.links[direction];
				
				if (newNode && (newNode._menuitem.type == "Header" || newNode._menuitem.type == "Separator")) {
					var endMenuItems = false;
					var validNode = null;
					// find next menuitem node not header
					while (!validNode && !endMenuItems) {
						newNode = newNode.links[direction];
						if (!newNode) {
							endMenuItems = true;
						}
						else if (newNode._menuitem.type != "Header" && newNode._menuitem.type != "Separator") {
							validNode = newNode;
						}
					}
					newNode = validNode;
				}
				if (newNode) {
					// remove focus
					var currentSelected = i$.byId(jsonData.id)._currentSelected;
					if (currentSelected) {
						// remove focus from the previous item
						currentSelected.blur();
					}
					// set focus
					i$.byId(jsonData.id)._currentSelected = newNode;
					newNode.focus();
				}
				if (evt.preventDefault) {
					evt.preventDefault();
				}
			},
			_applyFocusAction: function(evt) {
				var node = evt.target || evt.srcElement;
				var tempNode = node;
				var menuNode = null;
				var menuitem = node._menuitem;
				while (!menuNode) {
					tempNode = tempNode.parentNode;
					if (tempNode._contextMenu) {
						menuNode = tempNode;
					}
					if (!menuitem) {
						node = node.parentNode;
						menuitem = node._menuitem;
					}
				}
				var jsonData = menuNode._contextMenu;
				var currentSelected = i$.byId(jsonData.id)._currentSelected;
				if (currentSelected != node) {
					if (currentSelected) {
						// remove focus from the previous item
						currentSelected.blur();
						i$.byId(jsonData.id)._currentSelected = null;
					}
					if (menuitem.type != "Header" && menuitem.type != "Separator") {
						// setting focus onto the new item
						i$.byId(jsonData.id)._currentSelected = node;
						node.focus();
					}
				}
				return false;
			},
			/**
			 * @private
			 */
			_applyAction: function(evt){
				var node = evt.target || evt.srcElement;
				var tempNode = node;
				var menuNode = null;
				var menuitem = node._menuitem;
				while (!menuNode) {
					tempNode = tempNode.parentNode;
					if (tempNode._contextMenu) {
						menuNode = tempNode;
					}
					if (!menuitem) {
						node = node.parentNode;
						menuitem = node._menuitem;
					}
				}
				var jsonData = menuNode._contextMenu;
				jsonData.activeAction = true;
				// now we can either execute the actionUrl or we call the actionFn method
				var p = wptheme.contextMenu._checkFunction(menuitem, menuitem.actionFn, menuitem, menuitem.actionUrl);
				if (p) {
					p.then(function(actionUrl){
						if (actionUrl && i$.isString(actionUrl)) {
							var method = menuitem.actionHttpMethod || "GET";
							if (method != "GET") {
								var form = i$.createDom("form");
								form.setAttribute("action", actionUrl);
								method = method.toLowerCase();
								switch (method) {
									case "get":
										form.setAttribute("method", "GET");
										break;
									case "delete":
									case "put":
										var inputElement = i$.createDom("input", {
											"type": "hidden",
											"name": "x-method-override",
											"value": method.toUpperCase()
										});
										form.appendChild(inputElement);
									case "post":
										form.setAttribute("method", "POST");
										form.setAttribute("enctype", "multipart/form-data");
										break;
									default:
								}
								i$.byId("wpthemeComplementaryContent").appendChild(form);
								form.submit();
							}
							else {
								window.location.href = actionUrl;
							}
						}
					});
				}
			},
			/**
			 * @private
			 */
			_applySubmenu: function(evt){
				var node = evt.target || evt.srcElement;
				if (!node._jsonData) {
					node = node.parentNode; // we need this piece of code specifically for IE7
				}
				if (node._jsonData) {
					node.setAttribute("id", node._jsonData.id + "_" + node._menuitem.id);
					wptheme.contextMenu.initSubmenu(node, node._menuitem.id, node._jsonData);
				}
			},
			/**
			 * now remove the node from its context in the DOM and change it to be absolutely positioned and a node below the main body
			 * This is only necessary because of IE7/IE8
			 *
			 * @private
			 */
			_transformIntoAbsolutePosition: function(node) {
				var nodes = node.childNodes, foundNode, i=0, isRight=false;
				while (foundNode = nodes[i++]) {
					if (i$.hasClass(foundNode, "wpthemeMenuRight")) {
						isRight = true;
						break;
					}
					else if (i$.hasClass(foundNode, "wpthemeMenuLeft")) {
						break;
					}
				}
				// create shadowNode
				var shadowNode = i$.createDom("div");
				shadowNode.className = node.className;
				//i$.addClass(shadowNode, "wpthemeMenuAnchor");
				shadowNode.appendChild(foundNode);
				i$.byId("wpthemeComplementaryContent").appendChild(shadowNode);
				// now reference necessary data in both main menu nodes referencing each other
				shadowNode._contextMenu = node._contextMenu;
				node._contextMenu.shadowNode = shadowNode;
				node._contextMenu._menuIsRight = isRight;
				
				// now we need to create an overlay over "node" so that the menu is hidden appropriately
				var overlayNode = i$.createDom("span");
				shadowNode.appendChild(overlayNode);
				i$.addClass(overlayNode, "wpthemeMenuOverlay");
				

				// remember overlay and menu node for updating scenario (when you open the menu a second time)
				node._contextMenu.overlayNode = overlayNode;
				node._contextMenu.menuNode = foundNode;

				wptheme.contextMenu._updateAbsolutePosition(node);
				
				return shadowNode;
			},
			/**
			 * @private
			 */
			_updateAbsolutePosition: function(node) {
				var isRight = node._contextMenu._menuIsRight;
				var menuNode = node._contextMenu.menuNode;
				var overlayNode = node._contextMenu.overlayNode;
				
				// now position correctly
				var coordinates = wptheme.contextMenu._findPos(node);
				var padding = 2;
				overlayNode.style.left = (coordinates[0]-padding)+"px";
				overlayNode.style.top = (coordinates[1]-padding)+"px";
				overlayNode.style.width = (node.offsetWidth+(2*padding))+"px";
				overlayNode.style.height = (node.offsetHeight+(2*padding))+"px";

				var dir = document.getElementsByTagName('html')[0].getAttribute("dir");
				if (dir != null){
					dir = dir.toLowerCase();
				} else {
					dir = "";
				}
				if (!(dir == "rtl")){ // bidi check
					menuNode.style.left = ((isRight)?coordinates[0]+node.offsetWidth:coordinates[0])+"px";
				} else {
					menuNode.style.left = ((isRight)?coordinates[0]+node.offsetWidth-node.scrollWidth:coordinates[0])+"px";
				}
				menuNode.style.top = coordinates[1]+"px";
			},
			/**
			 * @private
			 */
			_adjustScreenPositionStart: function() {
				return document.documentElement.scrollHeight;
			},
			/**
			 * @private
			 */
			_adjustScreenPositionEnd: function(previousHeight) {
				var newHeight = document.documentElement.scrollHeight;
				if (previousHeight!=newHeight) {
					document.documentElement.scrollTop = document.documentElement.scrollHeight;
				}
			},
			/**
			 * @private
			 */
			_findPos: function(obj) {
				var curleft = curtop = 0;
				if (obj.offsetParent) {
					do {
						curleft += obj.offsetLeft;
						curtop += obj.offsetTop;
					} while (obj = obj.offsetParent);
					return [curleft,curtop];
				}
			}
		}
	});
	
	/**
	 * END of wptheme/ContextMenu
	 */
})();
