/*********************************************************** {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM
* Tivoli Presentation Services
*
* (C) Copyright IBM Corp. 2002,2003 All Rights Reserved.
*
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
************************************************************ {COPYRIGHT-END} ***
* Change Activity on 6/20/03 version 1.17:
* @00=WCL, V3R0, 04/14/2002, JCP: Initial version
* @01=D96484, V3R2, 06/14/2002, bcourt: hide select/iframe elements
* @02=D99067, V3R2, 06/25/2002, bcourt: hide listbox scrollbar
* @03=D97043, V3R3, 09/03/2002, JCP: fix launch menu item on linux NS6
* @04=D104656, V3R3, 09/16/2002, JCP: form submit instead of triggers, mozilla compatibility
* @05=D107029, V3R4, 12/03/2002, Mark Rebuck:  Added support for timed menu hiding
* @06=D110173, V3R4, 03/24/2003, JCP: selection sometimes gets stuck
* @07=D113641, V3R4, 04/29/2003, LSR: Requirement #258 Shorten CSS Names
* @08=D113626, V3R4, 06/20/2003, JCP: clicking on text doesn't launch action on linux Moz13
*******************************************************************************/

var visibleMenu_ = null;
var padding_ = 10;

var transImg_ = "transparent.gif";

var arrowNorm_ = "contextArrowDefault.gif";
var arrowSel_ = "contextArrowSelected.gif";
var arrowDis_ = "contextArrowDisabled.gif";
var launchNorm_ = "contextLauncherDefault.gif";
var launchSel_ = "contextLauncherSelected.gif";

var arrowNormRTL_ = "contextArrowDefault.gif";
var arrowSelRTL_ = "contextArrowSelected.gif";
var arrowDisRTL_ = "contextArrowDisabled.gif";
var launchNormRTL_ = "contextLauncherDefault.gif";
var launchSelRTL_ = "contextLauncherSelected.gif";

var wclIsOpera_ = /Opera/.test(navigator.userAgent);

//ARC CHANGES FOR SPECIFYING STYLES - BEGIN
var defaultContextMenuBorderStyle_ = "lwpShadowBorder";
var defaultContextMenuTableStyle_ = "lwpBorderAll";
//ARC CHANGES FOR SPECIFYING STYLES - END

var arrowWidth_ = "12";
var arrowHeight_ = "12";

var submenuAltText_ = "+";

//ARC CHANGES FOR SPECIFIYING EMPTY MENU TEXT - BEGIN
var defaultNoActionsText_ = "(0)";
var defaultNoActionsTextStyle_ = "lwpMenuItemDisabled";
//ARC CHANGES FOR SPECIFIYING EMPTY MENU TEXT - END

var hideCurrentMenuTimer_ = null;

var onmousedown_ = document.onmousedown;

function clearMenuTimer( ) { //@05
   if (null != hideCurrentMenuTimer_) {
      clearTimeout( hideCurrentMenuTimer_ );
      hideCurrentMenuTimer_ = null;
   }
}

function setMenuTimer( ) { // @05
   clearMenuTimer( );
   hideCurrentMenuTimer_ = setTimeout( 'hideCurrentContextMenu( )', 2000);
}

function debug( str ) {
   /*
   if ( xbDEBUG != null ) {
      xbDEBUG.dump( str );
   }
   */
}

// constructor
function UilContextMenu( name, isLTR, width, borderStyle, tableStyle, emptyMenuText, emptyMenuTextStyle, positionUnder ) {
   // member variables
   this.name = name;
   this.items = new Array();
   this.isVisible = false;
   this.isDismissable = true;
   this.selectedItem = null;
   this.isDynamic = false;
   this.isCacheable = false;
   this.isEmpty = true;
   this.isLTR = isLTR;
   this.hiddenItems = new Array(); //@01A
   this.isHyperlinkChild = true; //  We will reset later if needed.
   
   this.bottomPositioned = positionUnder;

   // html variables
   this.launcher = null;
   this.menuTag = null;

   //ARC CHANGES FOR SPECIFYING STYLES - BEGIN
   //styles for menu
   if ( borderStyle != null )
   {
       this.menuBorderStyle = borderStyle;
   }
   else
   {
       this.menuBorderStyle = defaultContextMenuBorderStyle_;
   }
   
   if ( tableStyle != null )
   {
       this.menuTableStyle = tableStyle;
   }
   else
   {
       this.menuTableStyle = defaultContextMenuTableStyle_;
   }
   //ARC CHANGES FOR SPECIFYING STYLES - END

   //ARC CHANGES FOR SPECIFIYING EMPTY MENU TEXT - BEGIN
   if ( emptyMenuText != null )
   {
   	   this.noActionsText = emptyMenuText;
   }
   else
   {
   	   this.noActionsText = defaultNoActionsText_;
   }
   
   if ( emptyMenuTextStyle != null )
   {
   	   this.noActionsTextStyle = emptyMenuTextStyle;
   }
   else
   {
   	   this.noActionsTextStyle = defaultNoActionsTextStyle_;
   }
   //ARC CHANGES FOR SPECIFIYING EMPTY MENU TEXT - END

   // external methods
   this.add = UilContextMenuAdd;
   this.addSeparator = UilContextMenuAddSeparator;
   this.show = UilContextMenuShow;
   this.hide = UilContextMenuHide;

   // internal methods
   this.create = UilContextMenuCreate;
   this.getMenuItem = UilContextMenuGetMenuItem;
   this.getSelectedItem = UilContextMenuGetSelectedItem;

   if ( this.name == null ) {
      this.name = "UilContextMenu_" + allMenus_.length;
   }
}

// adds a menu item to the context menu
function UilContextMenuAdd( item ) {
   this.items[ this.items.length ] = item;
   this.isEmpty = false;
}

function UilContextMenuAddSeparator() {
   var sep = new UilMenuItem();
   sep.isSeparator = true;
   this.add( sep );
}

// shows the context menu
// launcher- html element (anchor) that is launching the menu
// launchItem- menu item that is launching the menu
function UilContextMenuShow( launcher, launchItem ) {
   if ( this.items.length == 0 ) {
      // empty context menu
      debug( 'menu is empty!' );
      //ARC CHANGES FOR SPECIFIYING EMPTY MENU TEXT - BEGIN
      this.add( new UilMenuItem( this.noActionsText, false, "javascript:void(0);", null, null, null, null, this.noActionsTextStyle ) );
      //ARC CHANGES FOR SPECIFIYING EMPTY MENU TEXT - END
      this.isEmpty = true;
   }

   if ( this.menuTag == null ) {
      // create the context menu html
      this.create();
   } else {
      this.menuTag.style.left = ""; //196195 //Reset
      this.menuTag.style.top = ""; //196195 //Reset
      this.menuTag.style.width = ""; //"0px"; //196195 //Reset
      this.menuTag.style.height = ""; //196195 //Reset
      this.menuTag.style.overflow = "visible"; //196195 //Reset, No horizontal and vertical scrollbars
   }

   if ( this.menuTag != null) {
      // store the launcher for later
      this.launcher = launcher;
      if ( this.launcher.tagName == "IMG" ) {
         this.isHyperlinkChild = false;

         // we want the anchor tag
         this.launcher = this.launcher.parentNode;
      }

      // boundaries of window
      var bd = new ContextMenuBrowserDimensions();
      var maxX = bd.getScrollFromLeft() + bd.getViewableAreaWidth();
      var maxY = bd.getScrollFromTop() + bd.getViewableAreaHeight();
      var minX = bd.getScrollFromLeft();
      var minY = bd.getScrollFromTop();

      debug( 'max: ' + maxX + ', ' + maxY );

      var menuWidth = getWidth( this.menuTag );
      var menuHeight = getHeight( this.menuTag );

      // move the context menu to the right of the launcher
      var posX = 0;
      var posY = 0;
      var fUseUpperY = false; //196195
      var maxUpperPosY = 0; //196195

      if ( launchItem != null ) {
         // launched from submenu
         var launchTag = launchItem.itemTag;
         var launchTagWidth = getWidth( launchTag );
         var parentTag = launchItem.parentMenu.menuTag; //@04A
         var launchOffsetX = getLeft( parentTag ); //@04C
         var launchOffsetY = getTop( parentTag ); //@04C

         posX = launchOffsetX + getLeft( launchTag ) + launchTagWidth; //@04C
         posY = launchOffsetY + getTop( launchTag ); //@04C

         if ( !this.isLTR ) {
            posX -= launchTagWidth;
            posX -= menuWidth;
         }

         // try to keep it in the window
         if ( this.isLTR ) {
            if ( posX + menuWidth > maxX ) {
               // try to show it to the left of the parent menu
               var posX1 = launchOffsetX - menuWidth;
               var posX2 = maxX - menuWidth;
               if ( 0 <= posX1 ) {
                  posX = posX1;
               }
               else {
                  posX = Math.max( minX, posX2 );
               }
            }
         }
         else {
            if ( posX < 0 ) {
               // try to show it to the right of the parent menu
               var posX1 = launchOffsetX + launchTagWidth;
               if ( posX1 + menuWidth < maxX ) {
                  posX = posX1;
               }
               else {
                  posX = Math.min( maxX, maxX - menuWidth );
               }
            }
         }

         if ( posY + menuHeight > maxY ) {
            var posY1 = maxY - menuHeight;
            posY = Math.max( minY, posY1 );
         }
      }
      else {
         // launched from menu link
         var launcherLeft = getLeft( this.launcher, true )
         if ( this.launcher.tagName == "BUTTON" || this.bottomPositioned ) {
			
             posX = launcherLeft;
             
             // bidi
             if ( !this.isLTR ) {
                 //196195 posX += getWidth( this.launcher ) - getWidth( this.menuTag );
                 posX += getWidth( this.launcher ) - menuWidth; //196195
             }

             if (this.isLTR) {
                 if ((posX + menuWidth) > maxX) {
                     //196195 begins
                     if ((posX + getWidth(this.launcher)) > maxX) {
                         posX = Math.max(minX, maxX - menuWidth);
                     }
                     else 
                     //196195 ends
                         posX = Math.max(minX, posX + getWidth( this.launcher ) - menuWidth);
                 }
                 //196195 begins 
                 else if (posX < minX) {
                     posX = minX;
                 }
                 //196195 ends 
             }
             else{
                 if (posX < minX) {
                     //196195 if ((launcherLeft + menuWidth) < maxX) {
                     if ((launcherLeft > minX) && ((launcherLeft + menuWidth) < maxX)) { //196195
                         posX = launcherLeft;
                     }
                     else{
                         posX = Math.min(minX, maxX - menuWidth);
                     }
                 }
                 //196195 begins
                 else if ( (posX + menuWidth) > maxX) {
                     if (Math.min(posX, maxX - menuWidth) >= minX)
                         posX = Math.min(posX, maxX - menuWidth);
                 }
                 //196195 ends  
             }
             
             maxUpperPosY = getTop( this.launcher, true ); //196195
             var upperVisibleHeight = maxUpperPosY - minY; //196195
             posY = getTop( this.launcher, true ) + getHeight( this.launcher );
             var lowerVisibleHeight = maxY - posY; //196195
             //196195 if ( posY + menuHeight > maxY ) {
             if ( (posY + menuHeight > maxY) && (lowerVisibleHeight < upperVisibleHeight) ) { //196195
                // top
                posY -= (menuHeight + getHeight( this.launcher ));
                fUseUpperY = true; //196195
             }

             if ( posY < minY ) {
                posY = minY;
             }
         }
         else {

             // left-right
             posX = launcherLeft + this.launcher.offsetWidth;
             posY = getTop( this.launcher, true );

             if ( !this.isLTR ) {
                posX -= this.launcher.offsetWidth;
                posX -= menuWidth;
             }

             // keep it in the window
             if ( this.isLTR ) {
                if ( posX + menuWidth > maxX ) {
                   // try to show it on the left side of the launcher
                   var posX1 = launcherLeft - menuWidth;
                   if ( posX1 > 0 ) {
                      posX = posX1;
                   }
                   else {
                      posX = Math.max( minX, maxX - menuWidth );
                   }
                }
             }
             else {
                if ( posX < minX ) {
                   // try to show it on the right side of the launcher
                   var posX1 = launcherLeft + this.launcher.offsetWidth;
                   if ( posX1 + menuWidth < maxX ) {
                      posX = posX1;
                   }
                   else {
                      posX = Math.min( minX, maxX - menuWidth );
                   }
                }
             }

             if ( posY + menuHeight > maxY ) {
                posY = Math.max( minY, maxY - menuHeight );
             }
         }
         if ( ((posX + menuWidth) > maxX) ||
              (((posY + menuHeight) > maxY) && (fUseUpperY == false)) || 
              (((posY + menuHeight) > maxUpperPosY) && (fUseUpperY == true)) ) {
             if (posX + menuWidth > maxX) {
                 this.menuTag.style.width = (maxX - posX) + "px";
             }
             else{
                 this.menuTag.style.width = menuWidth + "px";
             }

             if (fUseUpperY == false) {
                 if (posY + menuHeight > maxY) {
                     this.menuTag.style.height = (maxY - posY) + "px";
                 }
                 else {
                     this.menuTag.style.height = menuHeight + "px";
                 }
             } else {
                 if (posY + menuHeight > maxUpperPosY) {
                     this.menuTag.style.height = (maxUpperPosY - posY) + "px";
                 }
                 else {
                     this.menuTag.style.height = menuHeight + "px";
                 }
             }

             this.menuTag.style.overflow = "auto";
         } else { //196195 begins
             this.menuTag.style.width = menuWidth + "px";
             this.menuTag.style.height = menuHeight + "px";
             this.menuTag.style.overflow = "visible"; //196195
         } //196196 ends
      }

      debug( 'show ' + this.name + ': ' + posX + ', ' + posY );
      this.menuTag.style.left = posX + "px";
      this.menuTag.style.top = posY + "px";

      // make the context menu visible
      this.menuTag.style.visibility = "visible";
      this.isVisible = true;

      // set focus on the first menu item
      this.items[0].setSelected( true );
      this.items[0].anchorTag.focus();

	  /*
	  // no longer needed since fixed in Opera 9, and no other non-IE browsers need this
      // @01A - Hide any items that intersect this menu
      var coll = document.getElementsByTagName("SELECT");
      if (coll!=null)
      {
         for (i=0; i<coll.length; i++)
         {
            //Hide the element
            if (intersect(this.menuTag,coll[i]) == true ) {
               if (coll[i].style.visibility != "collapse") //@02C
               {
                  coll[i].style.visibility = "collapse"; //@02C
                  this.hiddenItems.push(coll[i]);
               }
            }
         }
      }
      coll = document.getElementsByTagName("IFRAME");
      if (coll!=null)
      {
         for (i=0; i<coll.length; i++)
         {
            //Hide the element
            if (intersect(this.menuTag,coll[i]) == true ) {
               if (coll[i].style.visibility != "hidden")
               {
                  coll[i].style.visibility = "hidden";
                  this.hiddenItems.push(coll[i]);
               }
            }
         }
      }
	  */
      // save old & set new hide action for this menu     
      onmousedown_ = document.onmousedown;
      document.onmousedown = hideCurrentContextMenu;
   }
}

// Test whether two objects overlap
function intersect(obj1 , obj2) //@01A
{
   var left1 =  parseInt(document.defaultView.getComputedStyle(obj1, '').getPropertyValue("left"));
   var right1 = left1 + parseInt(document.defaultView.getComputedStyle(obj1, '').getPropertyValue("width"));
   var top1 = parseInt(document.defaultView.getComputedStyle(obj1, '').getPropertyValue("top"));
   var bottom1 = top1 + parseInt(document.defaultView.getComputedStyle(obj1, '').getPropertyValue("height"));

   var left2 =  parseInt(document.defaultView.getComputedStyle(obj2, '').getPropertyValue("left"));
   var right2 = left2 + parseInt(document.defaultView.getComputedStyle(obj2, '').getPropertyValue("width"));
   var top2 = parseInt(document.defaultView.getComputedStyle(obj2, '').getPropertyValue("top"));
   var bottom2 = top2 + parseInt(document.defaultView.getComputedStyle(obj2, '').getPropertyValue("height"));

    //alert("Comparing: " +left1 + ", " + right1+ ", " +top1 + ", " + bottom1+ " to "  +left2 + ", "  +right2 + ", " +top2 + ", " +bottom2);
   if (lineIntersect(left1,right1, left2,right2)== true &&
       lineIntersect(top1,bottom1,top2,bottom2) == true) {
      return true;
   }
   return false;
}

// Test whether the two line segments a--b and c--d intersect.
function lineIntersect(a, b, c, d) //@01A
{
   //alert (a+"--"+b + "   " + c + "--" + d);
   //Assume that a < b && c < d
   if ( (a <= c  && c <= b) ||
        (a <= d && d <= b) ||
        (c <= a && d >= b ) )
   {
      return true;
   } else {
      return false;
   }
}

// hides the context menu
function UilContextMenuHide() {
   if ( this.menuTag != null ) {
      debug( 'hide ' + this.name );

      // hide any visible submenus first
      for ( var i=0; i<this.items.length; i++ ) {
         if ( this.items[i].submenu != null &&
              this.items[i].submenu.isVisible ) {
            this.items[i].submenu.hide();
         }
      }

      // clear selection
      if ( this.selectedItem != null ) {
         this.selectedItem.setSelected( false );
      }

      // make the context menu hidden
      this.menuTag.style.visibility = "hidden";
      this.isVisible = false;
      this.isDismissable = true;

      // @01A - Show any items that were hidden by this menu
      var itemCount = this.hiddenItems.length;
      for (i=0; i<itemCount; i++)
      {
         var item = this.hiddenItems.pop();
         item.style.visibility = "visible";
      }

      // clear the launcher
      this.launcher = null;
      
      // reset action      
      document.onmousedown = onmousedown_;
   }
}

// creates the context menu html element
function UilContextMenuCreate( recurse ) {
   if ( this.menuTag == null ) {
      this.menuTag = document.createElement( "DIV" );
      this.menuTag.style.position = "absolute";
      this.menuTag.style.cursor = "default";
      this.menuTag.style.visibility = "hidden";
	  this.menuTag.setAttribute("role", "complementary");
      // following line does not work on Mozilla. SPR #PDIK66SJZ4
      //this.menuTag.style.width = "0px"; // this causes dynamic sizing
      //if (!this.isLTR) this.menuTag.dir = "RTL"; //196195
      this.menuTag.onmouseover = contextMenuDismissDisable;
      this.menuTag.onmouseout = contextMenuDismissEnable;
      this.menuTag.oncontextmenu = contextMenuOnContextMenu;

      var numItems = this.items.length;

      // check if this context menu contains icons or submenus
      var hasIcon = false;
      var hasSubmenu = false;
      for ( var i=0; i<numItems; i++ ) {
         if ( !this.items[i].isSeparator ) {
            if ( !hasSubmenu && this.items[i].submenu != null ) {
               hasSubmenu = true;
            }
            if ( !hasIcon && this.items[i].icon != null ) {
               hasIcon = true;
            }
            if ( hasSubmenu && hasIcon ) {
               break;
            }
         }
      }

      // create the menu items
      for ( var i=0; i<numItems; i++ ) {
         this.items[i].isFirst = ( i == 0 );
         this.items[i].isLast = ( i+1 == numItems );
         this.items[i].parentMenu = this;
         this.items[i].create( hasIcon, hasSubmenu );
      }

      // create the context menu border
      var border = document.createElement( "TABLE" );
      if (!this.isLTR) border.dir = "RTL";
      //border.className = "wclPopupMenuBorder"; //@04D
      border.rules = "none";
      border.cellPadding = 0;
      border.cellSpacing = 0;
      //border.width = "100%";
      border.border = 0;
      var borderBody = document.createElement( "TBODY" );
      var borderRow = document.createElement( "TR" );
      var borderData = document.createElement( "TD" );
      var borderDiv = document.createElement( "DIV" ); //@04A
      //borderDiv.className = "pop2"; //@04A   //@06C1
      
      //ARC CHANGES FOR SPECIFYING STYLES - BEGIN
      borderDiv.className = this.menuBorderStyle; 
      //ARC CHANGES FOR SPECIFYING STYLES - END

      borderData.appendChild( borderDiv ); //@04A
      borderRow.appendChild( borderData );
      borderBody.appendChild( borderRow );
      border.appendChild( borderBody );

      // create the context menu
      var table = document.createElement( "TABLE" );
      if (!this.isLTR) table.dir = "RTL";
      //table.className = "wclPopupMenu"; //@04D
      table.rules = "none";
      table.cellPadding = 0;
      table.cellSpacing = 0;
      table.width = "100%";
      table.border = 0;

      // add the menu items
      var tableBody = document.createElement( "TBODY" );
      table.appendChild( tableBody );

      // @04A - create another table for mozilla fix
      // (border styles not hidden correctly if set on table tag)
      var table2 = document.createElement( "TABLE" );
      if (!this.isLTR) table2.dir = "RTL";
      table2.rules = "none";
      table2.cellPadding = 0;
      table2.cellSpacing = 0;
      table2.width = "100%";
      table2.border = 0;
      var tableRow = document.createElement( "TR" );
      var tableData = document.createElement( "TD" );
      var tableDiv = document.createElement( "DIV" );
      //tableDiv.className = "pop1";     //@06C1

      //ARC CHANGES FOR SPECIFYING STYLES - BEGIN
      tableDiv.className = this.menuTableStyle;     //@06C1
      //ARC CHANGES FOR SPECIFYING STYLES - END

      var tableBody2 = document.createElement( "TBODY" );
      tableBody.appendChild( tableRow );
      tableRow.appendChild( tableData );
      tableData.appendChild( tableDiv );
      tableDiv.appendChild( table2 );
      table2.appendChild( tableBody2 );

      for ( var i=0; i<numItems; i++ ) {
         if ( this.items[i].isSeparator ) {
            this.items[i].createSeparator( tableBody2, hasSubmenu ); //@04C
         }
         else {
            tableBody2.appendChild( this.items[i].itemTag ); //@04C
         }
      }

      borderDiv.appendChild( table ); //@04C
      this.menuTag.appendChild( border );

      // add to document
      document.body.appendChild( this.menuTag );
   }

   if ( recurse ) {
      // this is used when cloning dynamic menus
      for ( var i=0; i<this.items.length; i++ ) {
         if ( this.items[i].submenu != null ) {
            this.items[i].submenu.create( recurse );
         }
      }
   }
}

// returns the menu item object associated with the html element
function UilContextMenuGetMenuItem( htmlElement ) {
   if ( htmlElement != null ) {
      if ( htmlElement.nodeType == 3 ) { //@06A
          // text node
          htmlElement = htmlElement.parentNode; //@06A
      }
      var tagName = htmlElement.tagName;
      var menuItemTag = null;
      if ( tagName == "IMG" ||
           tagName == "A" ) {
         menuItemTag = htmlElement.parentNode.parentNode;
      }
      else if ( tagName == "TD" ) {
         menuItemTag = htmlElement.parentNode;
      }
      for ( var i=0; i<this.items.length; i++ ) {
         if ( this.items[i].itemTag != null &&
              this.items[i].itemTag == menuItemTag ) {
            // found the item
            return this.items[i];
         }
         else if ( this.items[i].submenu != null &&
                   this.items[i].submenu.isVisible ) {
            // recurse through any visible submenus
            var item = this.items[i].submenu.getMenuItem( htmlElement );
            if ( item != null ) {
               // found the item
               return item;
            }
         }
      }
   }
   return null;
}

// returns the deepest selected menu item
function UilContextMenuGetSelectedItem() {
   var item = this.selectedItem;
   if ( item != null && item.submenu != null && item.submenu.isVisible ) {
      // recurse through the item's visible submenu
      return item.submenu.getSelectedItem();
   }
   return item;
}

// method called by an event handler (onmouseover for context menu div)
function contextMenuDismissEnable() {
   if ( visibleMenu_ != null ) {
      visibleMenu_.isDismissable = true;
      if (visibleMenu_.isHyperlinkChild) {
         setMenuTimer( ); // @05
      }
   }
}

// method called by an event handler (onmouseout for context menu div)
function contextMenuDismissDisable() {
   if ( visibleMenu_ != null ) {
      visibleMenu_.isDismissable = false;
      clearMenuTimer( ); // @05
   }
}

// method called by an event handler (oncontextmenu for context menu div)
function contextMenuOnContextMenu() {
   return false;
}

// constructor
function UilMenuItem( text, enabled, action, clientAction, submenu, icon, defItem,menuStyle, selectedMenuStyle ) {
   // member variables
   this.text = text;
   this.icon = icon;
   this.action = action;
   this.clientAction = clientAction;
   this.submenu = submenu;
   this.isSeparator = false;
   this.isSelected = false;
   this.isEnabled = ( enabled != null ) ? enabled : true;
   this.isDefault = ( defItem != null ) ? defItem : false;
   this.isFirst = false;
   this.isLast = false;
   this.parentMenu = null;
   
   if ( menuStyle != null ) {
      this.menuStyle = menuStyle; 
   }
   else {
      this.menuStyle = ( this.isEnabled ) ? "lwpMenuItem" : "lwpMenuItemDisabled"; 
   }

   this.selectedMenuStyle = ( selectedMenuStyle != null) ? selectedMenuStyle : "lwpSelectedMenuItem";

   // html variables
   this.itemTag = null;
   this.anchorTag = null;
   this.arrowTag = null;

   // internal methods
   this.create = UilMenuItemCreate;
   this.createSeparator = UilMenuItemCreateSeparator;
   this.setSelected = UilMenuItemSetSelected;
   this.updateStyle = UilMenuItemUpdateStyle;
   this.getNextItem = UilMenuItemGetNextItem;
   this.getPrevItem = UilMenuItemGetPrevItem;

   if ( this.submenu != null ) {
      // menu items with submenus do not have actions
      this.action = null;
   }
}

// creates the menu item html element
function UilMenuItemCreate( menuHasIcon, menuHasSubmenu ) {
   if ( !this.isSeparator ) {
      this.anchorTag = document.createElement( "A" );
      if ( this.action != null ) {
         this.anchorTag.href = "javascript:menuItemLaunchAction();";
         if ( this.clientAction != null && !wclIsOpera_ ) {
            this.anchorTag.onclick = this.clientAction;
         }
      }
      else if ( this.submenu != null ) {
         this.anchorTag.href = "javascript:void(0);";
         this.anchorTag.onclick = menuItemShowSubmenu;
      }
      else if ( this.clientAction != null ) {
         this.anchorTag.href = "javascript:menuItemLaunchAction();";
         if(!wclIsOpera_) this.anchorTag.onclick = this.clientAction;
      }
      this.anchorTag.onfocus = menuItemFocus;
      this.anchorTag.onblur = menuItemBlur;
      this.anchorTag.onkeydown = menuItemKeyDown;
      this.anchorTag.innerHTML = this.text;
//      this.anchorTag.title = this.text; 
      this.anchorTag.title = this.anchorTag.innerHTML; 
      //this.anchorTag.className = "pop5";    //@06C1
      this.anchorTag.className = this.menuStyle;    //@06C1
      if ( this.isDefault ) {
         this.anchorTag.style.fontWeight = "bold";
      }

      var td = document.createElement( "TD" );
      td.noWrap = true;
      td.style.padding = "3px";
      td.appendChild( this.anchorTag );

      // left padding or icon
      var leftPad = document.createElement( "TD" );
      leftPad.noWrap = true;
      leftPad.innerHTML = "&nbsp;";
      leftPad.style.padding = "3px";
      if ( this.icon != null ) {
         var imgTag = document.createElement( "IMG" );
         imgTag.src = this.icon;
         if (imgTag.src == "" || imgTag.src == null) {
             var imgTag1 = "<img src=\"" + this.icon + "\"";
             if ( this.text != null ) {
                imgTag1 += " alt=\'" + this.text + "\'";
                imgTag1 += " title=\'" + this.text + "\'";
             }
             imgTag1 += "/>";
             leftPad.innerHTML = imgTag1;
         } else {
             if ( this.text != null ) {
                imgTag.alt = this.text;
                imgTag.title = this.text;
             }
             leftPad.appendChild( imgTag );
         }
      }
      else {
         leftPad.width = padding_;
      }

      // right padding
      var rightPad = document.createElement( "TD" );
      rightPad.noWrap = true;
      rightPad.width = padding_;
      rightPad.innerHTML = "&nbsp;";
      rightPad.style.padding = "3px";

      this.itemTag = document.createElement( "TR" );
      this.itemTag.onmousemove = menuItemMouseMove;
      this.itemTag.onmousedown = menuItemLaunchAction;
      //this.itemTag.className = "pop5";  //@06C1
      this.itemTag.className = this.menuStyle;
      // put together the table row
      this.itemTag.appendChild( leftPad );
      this.itemTag.appendChild( td );
      this.itemTag.appendChild( rightPad );
      if ( menuHasSubmenu ) {
         // submenu arrow
         var submenuArrow = document.createElement( "TD" );
         submenuArrow.noWrap = true;
         submenuArrow.style.padding = "3px";
         if ( this.submenu != null ) {
            var submenuImg = document.createElement( "IMG" );
            submenuImg.alt = submenuAltText_;
            submenuImg.title = submenuAltText_;
            submenuImg.width = arrowWidth_;
            submenuImg.height = arrowHeight_;
            if (this.parentMenu.isLTR) submenuImg.src = arrowNorm_;
            else submenuImg.src = arrowNormRTL_;
            submenuArrow.appendChild( submenuImg );
            this.arrowTag = submenuImg;
         }
         else {
            submenuArrow.innerHTML = "&nbsp;";
         }
         this.itemTag.appendChild( submenuArrow );
      }

      // update the style of the menu item
      this.updateStyle( this.itemTag );
   }
}

// create the context menu separator html elements
function UilMenuItemCreateSeparator( tableBody, menuHasSubmenu ) {
   // create the context menu separator
   var numCols = ( menuHasSubmenu ) ? 4 : 3;

   for ( var i=0; i<4; i++ ) {
      var tr = document.createElement( "TR" );
      if ( i == 1 ) {
         //tr.className = "pop3";   //@06C1
         tr.className = "portlet-separator";   //@06C1
      }
      else if ( i == 2 ) {
         //tr.className = "pop4";   //@06C1
         tr.className = "lwpMenuBackground";   //@06C1
      }
      else {
         //tr.className = "pop5";   //@06C1
         tr.className = "lwpMenuItem";   //@06C1
      }

      var td = document.createElement( "TD" );
      td.noWrap = true;
      td.width = "100%";
      td.height = "1px";
      td.colSpan = numCols;

      //mmd - 06/09/06 - commenting out this section of code because it causes many additional requests
      //to the server everytime a context menu is opened.  after unit testing, removing piece of code
      //does not appear to affect the function of the menus
      /*var img = document.createElement( "IMG" );
      img.src = transImg_;
      img.width = 1;
      img.height = 1;
      img.style.display = "block";
      td.appendChild( img );*/

      tr.appendChild( td );
      tableBody.appendChild( tr );
   }
}

// changes the selected state for menu item
function UilMenuItemSetSelected( isSelected ) {

   if ( isSelected && !this.isSelected ) {
      debug( 'selected: ' + this.text );
      // handle the previous selection first
      if ( this.parentMenu != null &&
           this.parentMenu.isVisible &&
           this.parentMenu.selectedItem != null &&
           this.parentMenu.selectedItem != this ) {
         // hide previous selection's submenu
         if ( this.parentMenu.selectedItem.submenu != null ) {
            this.parentMenu.selectedItem.submenu.hide();
         }
         // unselect previous selection from parent menu
         this.parentMenu.selectedItem.setSelected( false );
      }

      // select this menu item
      this.isSelected = true;
      if ( this.parentMenu != null && this.parentMenu.isVisible ) {
         this.parentMenu.selectedItem = this;
      }

      // update the styles
      this.updateStyle( this.itemTag );
   }
   else if ( !isSelected && this.isSelected ) {
      debug( 'deselected: ' + this.text );
      // menu item cannot be unselected if its submenu is visible
      if ( this.submenu == null || ( this.submenu != null && !this.submenu.isVisible ) ) {
         // unselect this menu item
         this.isSelected = false;
         if ( this.parentmenu != null ) {
            this.parentmenu.selectedItem = null;
         }

         // update the styles
         this.updateStyle( this.itemTag );
      }
   }
}

// recursively set the style of the menu item html element
function UilMenuItemUpdateStyle( tag, styleID ) {
   if ( tag != null ) {
      if ( styleID == null ) {
         //styleID = "pop5";  //@06C1
         styleID = this.menuStyle;
         if ( !this.isEnabled ) {
            //styleID = "pop7"; //@06C1
            styleID = this.menuStyle; 
         }
         else if ( this.isSelected ) {
            //styleID = "pop6";  //@06C1
            styleID = this.selectedMenuStyle;  //@06C1
         }
         if ( this.arrowTag != null ) {
            if ( this.isEnabled && this.isSelected ) {
               if (this.parentMenu.isLTR) this.arrowTag.src = arrowSel_;
               else this.arrowTag.src = arrowSelRTL_;
            }
            else if ( !this.isEnabled ) {
               if (this.parentMenu.isLTR) this.arrowTag.src = arrowDis_;
               else this.arrowTag.src = arrowDisRTL_;
            }
            else {
               if (this.parentMenu.isLTR) this.arrowTag.src = arrowNorm_;
               else this.arrowTag.src = arrowNormRTL_;
            }
         }
      }
      tag.className = styleID;
      if ( tag.childNodes != null ) {
         for ( var i=0; i<tag.childNodes.length; i++ ) {
            this.updateStyle( tag.childNodes[i], styleID );
         }
      }
   }
}

// returns the next enabled, non-separator menu item after the given item
function UilMenuItemGetNextItem() {
   var menu = this.parentMenu;
   if ( menu != null ) {
      for ( var i=0; i<menu.items.length; i++ ) {
         if ( menu.items[i] == this ) {
            for ( var j=i+1; j<menu.items.length; j++ ) {
               if ( !menu.items[j].isSeparator && menu.items[j].isEnabled ) {
                  return menu.items[j];
               }
            }
            // no next item
            return null;
         }
      }
   }
   return null;
}

// returns the previous enabled, non-separator menu item before the given item
function UilMenuItemGetPrevItem() {
   var menu = this.parentMenu;
   if ( menu != null ) {
      for ( var i=menu.items.length-1; i>=0; i-- ) {
         if ( menu.items[i] == this ) {
            for ( var j=i-1; j>=0; j-- ) {
               if ( !menu.items[j].isSeparator && menu.items[j].isEnabled ) {
                  return menu.items[j];
               }
            }
            // no previous item
            return null;
         }
      }
   }
   return null;
}

// launches the action for a menu item
// method called by an event handler (href for anchor tag)
function menuItemLaunchAction() {
   if ( visibleMenu_ != null ) {
      //var evt = window.event;
      //var item = visibleMenu_.getMenuItem( evt.target );
      var item = visibleMenu_.getSelectedItem();
      if ( item != null && item.isEnabled ) {
         hideCurrentContextMenu( true );
         if ( item.clientAction != null ) {
            eval( item.clientAction );
         }
         if ( item.action != null ) {
            if ( item.action.indexOf( "javascript:" ) == 0 ) {
               eval( item.action );
            }
            else {
               //window.location.href = item.action; //@04D
            }
         }
      }
   }
}

// shows the submenu for a menu item
// method called by an event handler (onclick for anchor tag)
function menuItemShowSubmenu(evt) {
   if ( visibleMenu_ != null ) {
      var item = visibleMenu_.getMenuItem( evt.target );
      if ( item != null && item.isEnabled ) {
         var menu = item.submenu;
         if ( menu != null ) {
            menu.show( item.anchorTag, item );
         }
      }
   }
}

// focus handler for menu item
// method called by an event handler (onfocus for anchor tag)
function menuItemFocus(evt) {
   if ( visibleMenu_ != null ) {
      var item = visibleMenu_.getMenuItem( evt.target );
      if ( item != null ) {
         // select the focused menu item
         //item.anchorTag.hideFocus = item.isEnabled;
         item.setSelected( true );
      }
   }
}

// blur handler for menu item
// method called by an event handler (onblur for anchor tag)
function menuItemBlur(evt) {
   if ( visibleMenu_ != null ) {
      var item = visibleMenu_.getMenuItem( evt.target );
      if ( item != null ) {
         /* //jcp
         if ( item.isFirst && evt.shiftKey ) {
            debug( 'blur = ' + item.text );
            // user is shift tabbing off the beginning of the menu
            // set focus on the launcher
            item.parentMenu.launcher.focus();
            // hide the menu
            item.parentMenu.hide();
         }
         */
      }
   }
}

// key press handler for menu item
// method called by an event handler (onkeydown for anchor tag)
function menuItemKeyDown(evt) {
   var item = null;
   if ( visibleMenu_ != null ) {
      item = visibleMenu_.getMenuItem( evt.target );
   }
   if ( item != null ) {
      var next = null;
      switch ( evt.keyCode ) {
      case 38: // up key
         next = item.getPrevItem();
         if ( next != null ) {
            next.anchorTag.focus();
         }
         else if ( item.parentMenu != visibleMenu_ ) {
            item.parentMenu.launcher.focus();
            item.parentMenu.hide();
         }
         else {
            visibleMenu_.launcher.focus();
            hideCurrentContextMenu( true );
         }
         return false;
         break;
      case 40: // down key
         next = item.getNextItem();
         if ( next != null ) {
            next.anchorTag.focus();
         }
         else if ( item.parentMenu != visibleMenu_ ) {
            item.parentMenu.launcher.focus();
            item.parentMenu.hide();
         }
         else {
            visibleMenu_.launcher.focus();
            hideCurrentContextMenu( true );
         }
         return false;
         break;
      case 39: // right key
         if ( visibleMenu_.isLTR ) {
            if ( item.submenu != null ) {
               menuItemShowSubmenu(evt);
               item.submenu.items[0].anchorTag.focus();
            }
         }
         else {
            if ( item.parentMenu != visibleMenu_ ) {
               item.parentMenu.launcher.focus();
               item.parentMenu.hide();
            }
         }
         return false;
         break;
      case 37: // left key
         if ( visibleMenu_.isLTR ) {
            if ( item.parentMenu != visibleMenu_ ) {
               item.parentMenu.launcher.focus();
               item.parentMenu.hide();
            }
         }
         else {
            if ( item.submenu != null ) {
               menuItemShowSubmenu(evt);
               item.submenu.items[0].anchorTag.focus();
            }
         }
         return false;
         break;
      case 9: // tab key
         visibleMenu_.launcher.focus();
         hideCurrentContextMenu( true );
         break;
      case 27: // escape key
         visibleMenu_.launcher.focus();
         hideCurrentContextMenu( true );
         break;
      case 13: // enter key
         break;
      default:
         break;
      }
   }
}

// handle mouse move for menu item
// method called by an event handler (onmousemove for item tag)
function menuItemMouseMove(evt) {
   if ( visibleMenu_ != null ) {
      var item = visibleMenu_.getMenuItem( evt.target );
      if ( item != null ) {
         if ( !item.isSelected ) {
            // set focus on the anchor and select the menu item
            item.anchorTag.focus();
         }
         if ( item.submenu != null && !item.submenu.isVisible && item.isEnabled ) {
            // show the submenu
            item.submenu.show( item.anchorTag, item );
         }
      }
   }
}

// handle mouse down event for menu item
// method called by an event handler (onmousedown for item tag)
function menuItemMouseDown(evt) {
   /* //@08D
   if ( visibleMenu_ != null ) {
      var item = visibleMenu_.getMenuItem( evt.target );
      if ( item != null ) {
         item.setSelected( true );
      }
      else { //@03A
         item = visibleMenu_.getSelectedItem();
      }
      if ( item != null && item.anchorTag != evt.target ) {
         //item.anchorTag.click();
         menuItemLaunchAction();
      }
   }
   */
   menuItemLaunchAction(); //@08A
}

var allMenus_ = new Array();

//ARC CHANGES FOR SPECIFYING STYLES - BEGIN
//ARC CHANGES FOR SPECIFIYING EMPTY MENU TEXT - BEGIN
function createContextMenu( name, isLTR, width, borderStyle, tableStyle, noActionsText, noActionsTextStyle, positionUnder ) {
   var menu = new UilContextMenu( name, isLTR, width, borderStyle, tableStyle, noActionsText, noActionsTextStyle, positionUnder );
   allMenus_[ allMenus_.length ] = menu;
   return menu;
}
//ARC CHANGES FOR SPECIFIYING EMPTY MENU TEXT - END
//ARC CHANGES FOR SPECIFYING STYLES - END

function getContextMenu( name ) {
   for ( var i=0; i<allMenus_.length; i++ ) {
      if ( allMenus_[i].name == name ) {
         return allMenus_[i];
      }
   }
   return null;
}

function showContextMenu( name, isDynamic, isCacheable ) {
   contextMenuShow( name, isDynamic, isCacheable, event.target, true );
}

function showContextMenu( name, launcher ) {
   contextMenuShow( name, false, false, launcher, true );
}

function contextMenuShow( name, isDynamic, isCacheable, launcher, doLoad ) {
   debug( "***** showContextMenu: " + name )

   //  We mnight need to find a suitable launcher...
   var oldLauncher = launcher;
   while ((null != launcher) && (null == launcher.tagName)) {
      launcher = launcher.parentNode;
   }
   if (null == launcher) { //  shouldn't happen, but...
      launcher = oldLauncher;
   }

   if ( eval( isDynamic ) ) {
      debug( 'showContextMenu: dynamic=true, load=' + eval( doLoad ) + ', cache=' + eval( isCacheable ) );
      // dynamically loaded menu
      if ( eval( doLoad ) ) {
         // load the url into hidden frame
         loadDynamicMenu( name );
      }

      // clone the dynamic menu from hidden frame
      menu = getDynamicMenu( name, eval( isCacheable ) );

      if ( menu == null && top.isContextMenuManager_ != null ) {
         // menu not done loading yet
         debug( 'showContextMenu: ' + name + ' added to queue' );
         top.contextMenuManagerRequest( name, window, launcher, isCacheable );
      }
   }
   else {
      debug( 'showContextMenu: static context menu' );
      // statically defined menu
      menu = getContextMenu( name );
      if ( menu == null ) {
         menu = createContextMenu( name, 150 );
      }
   }

   if ( menu != null ) {
      hideCurrentContextMenu( true );
      menu.show( launcher );
      visibleMenu_ = menu;
   }
   else {
      debug( 'showContextMenu: ' + name + ' unavailable' );
   }
   clearMenuTimer( ); // @05
}

// method called by an event handler (onmousedown for document)
function hideCurrentContextMenu( forceHide ) {
   if ( visibleMenu_ != null && ( forceHide == true || visibleMenu_.isDismissable ) ) {
//      contextMenuDismissEnable();
      if ( visibleMenu_.isVisible ) {
         visibleMenu_.hide();
      }
      if ( visibleMenu_.isDynamic && !visibleMenu_.isCacheable ) {
         uncacheContextMenu( visibleMenu_ );
      }
      visibleMenu_ = null;
   }
}

function uncacheContextMenu( menu ) {
   debug( 'uncache menu: ' + menu.name );
   // recurse
   for ( var i=0; i<menu.items.length; i++ ) {
      if ( menu.items[i].submenu != null ) {
         uncacheContextMenu( menu.items[i].submenu );
      }
   }

   // remove from all menus array
   for ( var i=0; i<allMenus_.length; i++ ) {
      if ( allMenus_[i] == menu ) {
         var temp = new Array();
         var index = 0;
         for ( var j=0; j<allMenus_.length; j++ ) {
            if ( j != i ) {
               temp[ index ] = allMenus_[ j ];
               index++;
            }
         }
         allMenus_ = temp;
         break;
      }
   }
}

function contextMenuSetIcons( transparentImage,
                              arrowDefault, arrowSelected, arrowDisabled,
                              launcherDefault, launcherSelected,
                              arrowDefaultRTL, arrowSelectedRTL, arrowDisabledRTL,
                              launcherDefaultRTL, launcherSelectedRTL ) {
   transImg_ = transparentImage;

   arrowNorm_ = arrowDefault;
   arrowSel_ = arrowSelected;
   arrowDis_ = arrowDisabled;
   launchNorm_ = launcherDefault;
   launchSel_ = launcherSelected;

   arrowNormRTL_ = arrowDefaultRTL;
   arrowSelRTL_ = arrowSelectedRTL;
   arrowDisRTL_ = arrowDisabledRTL;
   launchNormRTL_ = launcherDefaultRTL;
   launchSelRTL_ = launcherSelectedRTL;

   contextMenuPreloadImage( transImg_ );

   contextMenuPreloadImage( arrowNorm_ );
   contextMenuPreloadImage( arrowSel_ );
   contextMenuPreloadImage( arrowDis_ );
   contextMenuPreloadImage( launchNorm_ );
   contextMenuPreloadImage( launchSel_ );

   contextMenuPreloadImage( arrowNormRTL_ );
   contextMenuPreloadImage( arrowSelRTL_ );
   contextMenuPreloadImage( arrowDisRTL_ );
   contextMenuPreloadImage( launchNormRTL_ );
   contextMenuPreloadImage( launchSelRTL_ );
}

function contextMenuSetArrowIconDimensions( width, height ) {
   arrowWidth_ = width;
   arrowHeight_ = height;
}

function contextMenuPreloadImage( imgsrc ) {
   var preload = new Image();
   preload.src = imgsrc;
}

function toggleLauncherIcon( popupID, selected, isLTR ) {
   if ( selected ) {
      if ( isLTR ) {
         document.images[ popupID ].src = launchSel_;
      }
      else {
         document.images[ popupID ].src = launchSelRTL_;
      }
   }
   else {
      if ( isLTR ) {
         document.images[ popupID ].src = launchNorm_;
      }
      else {
         document.images[ popupID ].src = launchNormRTL_;
      }
   }
   return true;
}

function contextMenuSetNoActionsText( noActionsText, submenuAltText ) {
   noActionsText_ = noActionsText;
   submenuAltText_ = submenuAltText;
}

function contextMenuGetNoActionsText() {
   return noActionsText_;
}

function getWidth( tag ) {
   return tag.offsetWidth;
}

function getHeight( tag ) {
   return tag.offsetHeight;
}

function getLeft( tag, recurse ) {
   var size = 0;
   if ( tag != null ) {
      //size = parseInt( document.defaultView.getComputedStyle(tag, null).getPropertyValue("left") ); //@04D

      //@04A
      if ( recurse && tag.offsetParent != null ) {
         size += getLeft( tag.offsetParent, recurse );
      }
      if ( tag != null ) {
         size += tag.offsetLeft;
      }

   }
   return size;
}

function getTop( tag, recurse ) {
   var size = 0;
   if ( tag != null ) {
      //size = parseInt( document.defaultView.getComputedStyle(tag, null).getPropertyValue("top") ); //@04D

      //@04A
      if ( recurse && tag.offsetParent != null ) {
         size += getTop( tag.offsetParent, recurse );
      }
      if ( tag != null ) {
         size += tag.offsetTop;
      }

   }
   return size;
}

/*****************************************************
* code for dynamically loaded menus
*****************************************************/
function loadDynamicMenu( menuURL ) {
   debug( '* loadDynamicMenu: ' + menuURL );
   var menu = getContextMenu( menuURL );
   if ( menu != null ) {
      if ( menu.isVisible ) {
         // dynamic menu requested, but it's currently showing
         menu.hide();
      }
      if ( !menu.isCacheable ) {
         // make sure it's not in the cache
         uncacheContextMenu( menu );
      }
   }
   if ( getContextMenu( menuURL ) == null ) {
      if ( top.isContextMenuManager_ != null ) {
         debug( 'loadDynamicMenu: loading' );
         top.contextMenuManagerLoadDynamicMenu( menuURL );
      }
   }
}

function getDynamicMenu( menuURL, cache ) {
   debug( '* getDynamicMenu: ' + menuURL );
   var clone = getContextMenu( menuURL );
   if ( clone == null ) {
      if ( top.isContextMenuManager_ != null ) {
         if ( top.contextMenuManagerIsDynamicMenuLoaded() ) {
            var menu = top.contextMenuManagerGetDynamicMenu();
            debug( 'getDynamicMenu: fetched menu from other frame' );
            clone = cloneMenu( menu, menuURL, cache );
            if ( clone.items.length == 0 ) {
               contextMenuSetNoActionsText( top.contextMenuManagerGetNoActionsText() );
            }
         }
         else {
            debug( 'getDynamicMenu: menu not loaded' );
         }
      }
      else {
         debug( 'getDynamicMenu: menu manager not present' );
      }
   }
   else {
      debug( 'getDynamicMenu: menu previously loaded' );
   }
   return clone;
}

function cloneMenu( menu, name, cache ) {
   var clone = getContextMenu( name );
   if ( clone == null ) {
      if ( menu != null ) {
         clone = createContextMenu( name, menu.width );
      }
      else {
         clone = createContextMenu( name, 150 );
      }
      clone.isDynamic = true;
      clone.isCacheable = cache;
      if ( menu != null ) {
         for ( var i=0; i<menu.items.length; i++ ) {
            clone.add( cloneMenuItem( menu.items[i], name + "_sub" + i, cache ) );
         }
      }
   }
   return clone;
}

function cloneMenuItem( item, submenuName, cache ) {
   var submenu = null;
   if ( item.submenu != null ) {
      submenu = cloneMenu( item.submenu, submenuName, cache );
   }
   var clone = new UilMenuItem( item.text, item.isEnabled, item.action, item.clientAction, submenu, item.icon, null, null, null );
   clone.isEnabled = item.isEnabled;
   clone.isSelected = item.isSelected;
   clone.isSeparator = item.isSeparator;
   return clone;
}


//////////////////////////////////////////////////////////////////
// begin BrowserDimensions object definition
ContextMenuBrowserDimensions.prototype				= new Object();
ContextMenuBrowserDimensions.prototype.constructor = ContextMenuBrowserDimensions;
ContextMenuBrowserDimensions.superclass			= null;

function ContextMenuBrowserDimensions(){

    this.body = document.body;
    if (this.isStrictDoctype() && !this.isSafari()) {
        this.body = document.documentElement;
    }

}

ContextMenuBrowserDimensions.prototype.getScrollFromLeft = function(){
    return this.body.scrollLeft ;
}

ContextMenuBrowserDimensions.prototype.getScrollFromTop = function(){
    return this.body.scrollTop ;
}

ContextMenuBrowserDimensions.prototype.getViewableAreaWidth = function(){
    return this.body.clientWidth ;
}

ContextMenuBrowserDimensions.prototype.getViewableAreaHeight = function(){
    return this.body.clientHeight ;
}

ContextMenuBrowserDimensions.prototype.getHTMLElementWidth = function(){
    return this.body.scrollWidth ;
}

ContextMenuBrowserDimensions.prototype.getHTMLElementHeight = function(){
    return this.body.scrollHeight ;
}

ContextMenuBrowserDimensions.prototype.isStrictDoctype = function(){

    return (document.compatMode && document.compatMode != "BackCompat");

}

ContextMenuBrowserDimensions.prototype.isSafari = function(){

    return (navigator.userAgent.toLowerCase().indexOf("safari") >= 0);

}

ContextMenuBrowserDimensions.prototype.isOpera = function(){

    return /Opera/.test(navigator.userAgent);;

}

// end BrowserDimensions object definition
//////////////////////////////////////////////////////////////////

