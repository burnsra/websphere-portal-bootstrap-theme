(function(){
	var editModeInitialized = false;
	if(typeof wptheme === "undefined" || !wptheme) wptheme = {};
	i$.mash(wptheme, {
		togglePageMode: function () {
			return i$.modules.loadDeferred().then(function(){
				var hasEnabler = i$.fromPath("com.ibm.mashups"),
					runtimeModel = hasEnabler ? com.ibm.mashups.builder.model.Factory.getRuntimeModel() : null,
					userModel = hasEnabler ? com.ibm.mashups.enabler.user.Factory.getUserModel() : null,
					body = document.getElementsByTagName("body")[0],
					changePageMode = function(mode) {
						if(hasEnabler) {
							com.ibm.mashups.services.ServiceManager.getService("eventService").broadcastEvent("com.ibm.mashups.builder.changePageMode", mode);
							runtimeModel.getCurrentPage().setPageMode(mode);
						}
						i$.fireEvent('wptheme/contextMenu/invalidate/all');
					};
				if ( (!hasEnabler && !i$.hasClass(body,"edit-mode")) || (hasEnabler && userModel.getAnonymousMode() != com.ibm.mashups.enabler.user.AnonymousMode.ANONYMOUS && 
						runtimeModel.getCurrentPage().getPageMode() != "edit") ) {
					changePageMode("edit");
					i$.addClass(body, "edit-mode");
					if(!editModeInitialized){
						// Add an onbeforeunload to alert the user if s/he is leaving a page with unsaved changes
						// the onbeforeunload event is triggered in IE for javascript links, so it cannot be safely used
						// the onbeforeunload event is not supported in Opera
						if(!i$.isIE && !i$.isOpera && hasEnabler) {
							window.onbeforeunload = function(){
								if(com.ibm.mashups.builder.model.Factory.getRuntimeModel().getCurrentPage().isDirty()) {
									return com.ibm.mm.builder.coreWidgetsStrings.I_PAGE_SAVE_WARNING;
								}
							};
						}
						editModeInitialized = true;
					}
				} else {
					changePageMode("view");
					i$.removeClass(body, "edit-mode");
				}
			}, function(err) {
				console.log("Error going into edit mode. Most likely a session timeout. Refreshing. "+err);
				window.location.reload();
			});
		},
		mobileGoToSearch: function(id, collapsedCls, collapsedText, expandedText, rootid, side, level) {
			// open the navigation and focus on the search box
			var nav = document.getElementById(rootid);
			var searchField = document.getElementById("wpthemeSearchBoxInput");
			if(i$.hasClass(nav, collapsedCls)) {
				wptheme.toggleMobileNav(id, collapsedCls, collapsedText, expandedText, rootid, side, level);
				if(searchField) {
					setTimeout(function(){
						// focus in a timeout to ensure navigation animation is finished
						searchField.focus();				
					},550);
				}
			} else if(searchField) {
				searchField.focus();
			}
			
		},
		mobileNavResizeBinding: null,
		mobileNavSideLastExpanded: [],
		mobileNavSideExpanded: [],
		mobileNavSideTogglingRoot: false,
		resizeMobileNavSide: function(e) {
			// This function resizes any open nav menus on window onresize events to ensure
			// they always take the available height of the window when the window size
			// or device orientation changes, and when the top nav is hidden/shown.
			var header = document.getElementsByTagName("header")[0];
			var elem, id;
			elem = document.getElementById("wpthemeNavRoot");
			if (elem) {
				elem.style.top = header.offsetHeight + "px";
				elem.style.height = (window.innerHeight - header.offsetHeight) + "px";
			}
			for (var i = 0; i < wptheme.mobileNavSideExpanded.length; i++) {
				id = wptheme.mobileNavSideExpanded[i];
				id = id.substr(0, id.length - 4) + "Subnav";
				elem = document.getElementById(id);
				if (elem) {
					elem.style.top = header.offsetHeight + "px";
					elem.style.height = (window.innerHeight - header.offsetHeight) + "px";
				}
			}
		},
		animateMobileNavSidePanel: function(elem, stopXPos, callback) {
			// This function provides JS-based animation technique to not only slide the
			// nav menu to the left (right for bidi), but also to at the same time adjust 
			// a clip rectangle to be narrower from the left (right for bidi) edge to give
			// the effect that the menu is disappearing into thin air at the offset point
			// rather than at the edge of the screen. The clip rectangle effect is turned
			// off if opening or closing the entire nav menu from the root so that the
			// disappear will happen at the edge of the screen in that case. The distance
			// the nav menu has to travel is divided by 5 to determine the delta to ensure
			// that the animation always takes the same amount of time regardless of
			// distance.
			var xPos = elem.offsetLeft;
			if(ibmCfg.themeConfig.isRTL) {
				xPos = parseInt(elem.style.right);
			}
			if (this.mobileNavSideTogglingRoot && stopXPos < xPos) {
				// slide from edge of the screen if toggling root
				stopXPos = -elem.offsetWidth;
			}
			var clipPos = 0;
			var xDelta = Math.ceil(Math.abs(stopXPos - xPos) / 5);		// do it in five intervals
			if (xPos == stopXPos) {
				xDelta = 0;
			} else if (xPos > stopXPos) {
				xDelta = -xDelta;
			}
			if (xDelta > 0 && !this.mobileNavSideTogglingRoot) {		// don't clip if toggling root
			    if(ibmCfg.themeConfig.isRTL) {
				  elem.style.clip = "rect(0px,0px," + elem.offsetHeight + "px,0px)";  //top,right,bottom,left
				} else {
				  elem.style.clip = "rect(0px," + elem.offsetWidth + "px," + elem.offsetHeight + "px," + elem.offsetWidth + "px)";  //top,right,bottom,left
				}
			}
			var animationTimer = setInterval(function() {
			  if (xDelta > 0 && xPos + xDelta > stopXPos) {
				xDelta = stopXPos - xPos;
			  }
			  if (xDelta < 0 && xPos + xDelta < stopXPos) {
				xDelta = -(xPos - stopXPos);
			  }
			  if (xDelta < 0 && !wptheme.mobileNavSideTogglingRoot) {		// don't clip if toggling root
			    if(ibmCfg.themeConfig.isRTL) {
				  elem.style.clip = "rect(0px," + (elem.offsetWidth - (clipPos -= xDelta)) + "px," + elem.offsetHeight + "px,0px)";  //top,right,bottom,left
				} else {
				  elem.style.clip = "rect(0px," + elem.offsetWidth + "px," + elem.offsetHeight + "px," + (clipPos -= xDelta) + "px)";  //top,right,bottom,left
				}
			  }
			  if (xDelta > 0 && !wptheme.mobileNavSideTogglingRoot) {		// don't clip if toggling root
			    if(ibmCfg.themeConfig.isRTL) {
				  elem.style.clip = "rect(0px," + (clipPos += xDelta) + "px," + elem.offsetHeight + "px,0px)";  //top,right,bottom,left
				} else {
				  elem.style.clip = "rect(0px," + elem.offsetWidth + "px," + elem.offsetHeight + "px," + (elem.offsetWidth - (clipPos += xDelta)) + "px)";  //top,right,bottom,left
				}
			  }
			  if(ibmCfg.themeConfig.isRTL) {
			    elem.style.right = (xPos += xDelta) + "px";
			  } else {
			    elem.style.left = (xPos += xDelta) + "px";
			  }
			  if (xDelta > 0 && xPos >= stopXPos || xDelta < 0 && xPos <= stopXPos || xDelta == 0) {
				clearInterval(animationTimer);
				elem.style.clip = "";
				if (callback) {
					callback.call();
				}
			  }
			}, 1);
		},
		toggleMobileNav: function(id, collapsedCls, collapsedText, expandedText, rootid, side, level) {
			// This function collapses/hides or expands/shows a nav menu. The primary technique is
			// to add the collapsedCls class to collapse, or remove it to expand. If side is true (tablets),
			// then additional techniques are used to give it the slide-from-side animation effect.
			var node = document.getElementById(id);
			var navLink = document.getElementById("wpthemeNavRootLink");
			var link = document.getElementById(id + "Link");
			var accessText = document.getElementById(id + "Access");
			var subnav = document.getElementById(id + "Subnav");
			var header = document.getElementsByTagName("header")[0];
			var layout = document.getElementById("layoutContainers");
			if(node) {
				if(level == 0) {
					// the navigation is being opened or closed, update the icon
					if (i$.hasClass(navLink, "wpthemeNavOpened")) {
						// navigation panel is closing
						i$.removeClass(navLink, "wpthemeNavOpened");
					} else {
						// navigation panel is opening
						i$.addClass(navLink, "wpthemeNavOpened");
					}
				}
				if (i$.hasClass(node, collapsedCls)) {
					// navigation is collapsed, expand it
					if(id == rootid && side) {
						// turn on the toggling root flag that is used to control the animation clip effect
						// in animateMobileNavSidePanel
						this.mobileNavSideTogglingRoot = true;
						node.style.top = header.offsetHeight + "px";
						node.style.height = (window.innerHeight - node.offsetTop) + "px";
						if(ibmCfg.themeConfig.isRTL) {
							node.style.right = (-node.offsetWidth) + "px";
						} else {
							node.style.left = (-node.offsetWidth) + "px";
						}						
						// bind the window onresize event when any nav menus are expanded
						this.mobileNavResizeBinding = i$.bindDomEvt(window, "resize", this.resizeMobileNavSide);
					}
					i$.removeClass(node, collapsedCls);
					node.setAttribute("aria-expanded", "true");
					link.setAttribute("aria-label", expandedText);
					link.title = accessText.innerHTML = expandedText;
					if(id == rootid && side) {
						// fix the header, which together with the fixed nav menu(s) allows
						// the page to scroll independently from the nav menu(s) and header
						header.style.position = "fixed";
						header.style.width = "100%";							 	   
						layout.style.paddingTop = header.offsetHeight + 10 + "px";
						header.style.zIndex = "9998";
						header.style.top = "0px";
						// ANIMATE
						this.animateMobileNavSidePanel(node, 0, function () {
							if (wptheme.mobileNavSideLastExpanded.length == 0) {
								// we've expanded the last nav menu, so turn off the toggling root flag 
								// that is used to control the animation clip effect in animateMobileNavSidePanel
								wptheme.mobileNavSideTogglingRoot = false;
							}
						});
					}
					if(side) {
						if(id == rootid) {
							// if expanding the root, then call this function repeatedly via the onclick
							// handlers for each id in the mobileNavSideLastExpanded array, so that each
							// previously-expanded nav menu will re-expand
							for(var i = 0; i < this.mobileNavSideLastExpanded.length; i++) {
								document.getElementById(this.mobileNavSideLastExpanded[i]).onclick.call();
							}
						} else {
							// add this nav menu's id to the mobileNavSideExpanded array
							this.mobileNavSideExpanded.push(id + "Link");
							// map the onclick handler of the arrow button just clicked to also be the
							// onclick handler of the entire nav menu div. This is what enables the user
							// to touch anywhere on a nav menu to collapse any other nav menus beyond it
							// that are expanded
							link.parentNode.parentNode.parentNode.onclick = link.onclick;
						}
					}
					if(subnav && side) {
						var root = document.getElementById(rootid);
						var navparent = root.parentNode;
						if(subnav.parentNode != navparent) {
							// re-parent the subnav div to have the same parent as the root div. This is
							// done for the side case (tablet), as each div is absolutely positioned in 
							// that case, as opposed to the non-side case (smartphone), where no re-parenting
							// is required
							subnav = subnav.parentNode.removeChild(subnav);
							navparent.appendChild(subnav);
						}
						// each nav menu is indented 70 more pixels from the previous nav menu
						var edge = Math.min((level * 70), Math.floor(window.innerWidth - subnav.offsetWidth) - 1);
						subnav.style.top = root.offsetTop + "px";
						subnav.style.height = (window.innerHeight - subnav.offsetTop) + "px";
						if (this.mobileNavSideTogglingRoot) {
							// slide from edge of the screen if toggling root
							if(ibmCfg.themeConfig.isRTL) {
								subnav.style.right = (-subnav.offsetWidth) + "px";
							} else {
								subnav.style.left = (-subnav.offsetWidth) + "px";
							}
						} else {
							// otherwise slide from the offset edge
							if(ibmCfg.themeConfig.isRTL) {
								subnav.style.right = (edge - subnav.offsetWidth) + "px";
							} else {
								subnav.style.left = (edge - subnav.offsetWidth) + "px";
							}
						}
						i$.removeClass(subnav, collapsedCls);
						// ANIMATE
						this.animateMobileNavSidePanel(subnav, edge, function() {
							if (wptheme.mobileNavSideTogglingRoot && id + "Link" == wptheme.mobileNavSideLastExpanded[wptheme.mobileNavSideLastExpanded.length - 1]) {
								// we've expanded the last nav menu, so turn off the toggling root flag 
								// that is used to control the animation clip effect in animateMobileNavSidePanel
								wptheme.mobileNavSideTogglingRoot = false;
							}
						});
					}
				} else {
					// navigation is expanded, collapse it
					if(side) {
						if(id == rootid) {
							// turn on the toggling root flag that is used to control the animation clip effect
							// in animateMobileNavSidePanel
							this.mobileNavSideTogglingRoot = true;
							// copy the mobileNavSideExpanded array to the mobileNavSideLastExpanded array so
							// we'll remember what was last expanded if the user later expands from the root menu
							this.mobileNavSideLastExpanded = this.mobileNavSideExpanded.slice(0); // copy the array
							// if expanding the root, then call this function repeatedly via the onclick
							// handlers for each id in the mobileNavSideExpanded array, so that every
							// expanded nav menu will collapse
							for(var i = this.mobileNavSideExpanded.length - 1; i >= 0 ; i--) {
								document.getElementById(this.mobileNavSideExpanded[i]).onclick.call();
							}
						} else {
							// when collapsing a nav menu, we have to collapse not only itself, but first any
							// nav menus beyond itself that may be expanded
							var linkid = id + "Link";
							var i = -1;
							for(var j = this.mobileNavSideExpanded.length - 1; j >= 0; j--) {
								if(this.mobileNavSideExpanded[j] == linkid) {
									i = j;
									break;
								}
							}
							if(i != -1) {
								var tailid;
								// call this function repeatedly via the onclick handlers for each id in the 
								// mobileNavSideExpanded array from the end back to this id, so that every
								// expanded nav menu from the end to this one will collapse
								for(var j = this.mobileNavSideExpanded.length - 1; j >= i; j--) {
									tailid = this.mobileNavSideExpanded.pop();
									if(linkid != tailid) {
										document.getElementById(tailid).onclick.call();
									}
								}								
							}
							// when collapsing a nav menu, take off the onlick handler from the previous
							// nav menu div, as the technique that enables the user to touch anywhere on a 
							// nav menu to collapse back to it is no longer needed/desired
							link.parentNode.parentNode.parentNode.onclick = null;
						}
					}
					if(subnav && side) {
						var edge = subnav.offsetLeft;
						if(ibmCfg.themeConfig.isRTL) {
							edge = parseInt(subnav.style.right);
						}
						// ANIMATE
						this.animateMobileNavSidePanel(subnav, edge - subnav.offsetWidth, function() {
							i$.addClass(subnav, collapsedCls);
							if(subnav.parentNode != node) {
								// re-parent the subnav div back to its original parent. This is
								// done for the side case (tablet), to put each div back to static
								// positioning while collapsed. Only the expanded divs should have the
								// same parent, which ensures that the nth-of-type styles in 
								// mobilenav.css work right and the expanded nav menus come out with the
								// proper background and border colors.
								subnav = subnav.parentNode.removeChild(subnav);
								node.appendChild(subnav);
							}
						});
					}
					if(id == rootid && side) {
						// un-fix the header, so that it will go back to scrolling normally along with the page
						header.style.position = "static";
						layout.style.paddingTop = "";
						header.style.width = "auto";
						header.style.zIndex = "auto";
						//ANIMATE
						this.animateMobileNavSidePanel(node, -node.offsetWidth, function() {
							i$.addClass(node, collapsedCls);
							node.setAttribute("aria-expanded", "false");
							link.setAttribute("aria-label", collapsedText);
							link.title = accessText.innerHTML = collapsedText;
							// we've collapsed the last nav menu, so turn off the toggling root flag 
							// that is used to control the animation clip effect in animateMobileNavSidePanel
							wptheme.mobileNavSideTogglingRoot = false;
						});
						// unbind the window onresize event when the nav menus are all collapsed
						i$.unbindDomEvt(this.mobileNavResizeBinding);
						this.mobileNavResizeBinding = null;
					} else {
						i$.addClass(node, collapsedCls);
						node.setAttribute("aria-expanded", "false");
						link.setAttribute("aria-label", collapsedText);
						link.title = accessText.innerHTML = collapsedText;
					}
				}
			}
		},
		toggleMobileTopNav: function(closedText, openedText) {
			// This function collapses/hides or expands/shows the top nav.
			var topNavBtn = document.getElementById("wpthemeTopNavToggleBtn");
			var accessText = document.getElementById("wpthemeTopNavToggleBtnAccess");
			var header = document.getElementsByTagName("header")[0];
			var wpthemeHeader = header.children[0];
			// the navigation is being opened or closed, update the icon
			if (i$.hasClass(topNavBtn, "wpthemeTopNavOpened")) {
				// close top navigation
				wpthemeHeader.style.display = "none";
				i$.removeClass(topNavBtn, "wpthemeTopNavOpened");
				topNavBtn.setAttribute("aria-label", closedText);
				topNavBtn.title = accessText.innerHTML = closedText;
			} else {
				// open top navigation
				wpthemeHeader.style.display = "block";
				i$.addClass(topNavBtn, "wpthemeTopNavOpened");
				topNavBtn.setAttribute("aria-label", openedText);
				topNavBtn.title = accessText.innerHTML = openedText;
			}
			this.resizeMobileNavSide();
		}
	});
    // only one of the following two alt help containers should be used on the page
    var altHelpLinkContainer = document.getElementById("wpthemeHelpLink"); //if the page supplies the link, we will open it the same way we open portal help
    var altHelpOnClickContainer = document.getElementById("wpthemeHelpOnClick"); //if the page wants to call its own help logic we add that to the onclick (this contains some javascript)
    var helpAnchor = document.getElementById("wpthemeHelpAnchor");
    if (!(altHelpLinkContainer === null && altHelpOnClickContainer === null) && helpAnchor != null) { //we can retrieve the help anchor and at least one container is populated
        if (altHelpLinkContainer != null) {
            var helpHref = altHelpLinkContainer.innerHTML;
            helpAnchor.onclick=function(){window.open(helpHref,'wpthemeHelp','width=800,height=600')};
        }
        else if (altHelpOnClickContainer != null) {
            var helpOnClick = altHelpOnClickContainer.innerHTML;
            helpAnchor.onclick=function(){eval(helpOnClick)};
        }
    }

})();

