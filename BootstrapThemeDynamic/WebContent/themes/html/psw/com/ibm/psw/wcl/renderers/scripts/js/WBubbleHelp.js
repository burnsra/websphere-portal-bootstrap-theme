/*********************************************************** {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM                                               
* Tivoli Presentation Services                                   
*                                                    
* (C) Copyright IBM Corp. 2000,2003 All Rights Reserved.                            
*                                                               
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
************************************************************ {COPYRIGHT-END} ***
* Change Activity on 6/26/03 version 1.9:
* @00=WCL, V3R4, 01/24/2003, KDK: Initial version
* @01=D109662, V3R4, 02/14/2003, KDK: Bubble Help frame needs a title for accessibility
* @02=D109442, V3R4, 02/18/2003, NFE: Add DIV-based WLayer support
* @03=D110785, V3R4, 03/10/2003, KDK: Escape to Close broken in IE when the cursor is placed inside the bubble help content.
* @04=D110991, V3R4, 03/10/2003, KDK: Flyover (ie: title) for target element shows up when it should not
* @05=D110782, V3R4, 03/10/2003, KDK: Mousing back to launch target from the bubble help hides the bubble help when it should not.
* @06=D111264, V3R4, 03/14/2003, KDK: Fix bidi for content frame
* @07=D113641, V3R4, 04/29/2003, LSR: Requirement #258 Shorten CSS Names
* @08=D112993, V3R4, 06/18/2003, NFE: Check for Mozilla browser
* @09=D113660, V3R4, 06/26/2003, NFE: Fix HTTPS content loading issue
*******************************************************************************/

/**
 * This is a class used to create/show/hide a WBubbleHelp on the client.
 */

if ( !self.WBubbleHelpManager )
{
    self.WBubbleHelpManager = new Object();
}

/**
 * WBubbleHelp - Constructor
 *
 * @param url URL used to load content
 * @param title Title for content IFRAME
 * @param isLTR indicates bidi direction for the bubble help
 * @param isPortletRequest Whether or not request is PortletRequest
 * @param secureURL URL pointing to content served using HTTPS. This URL will
 *        be used to initially set the src attribute of the content IFRAME
 *        prior to content download. If using a secure server, this URL must be
 *        specified at the risk of experiencing "Secure/Non-Secure"
 *        warnings issued by the browser. The URL must be secure and from the
 *        same domain as parentWindow.
 */
function WBubbleHelp( url, title, isLTR, isPortletRequest, secureURL ) // @09C1
{
    // private members
    this.id             = WUtilities.getGUID( "WBubbleHelp" );
    this.containerGUID  = this.id + "_container";
    this.contentGUID    = this.id + "_content";
    //this.anchorGUID     = this.id + "_anchor";
    this.url        = ( url ? url : "about:blank" );
    this.secureURL    = ( secureURL ? secureURL : null ); // @09A1
    this.title      = ( title ? title : "" );
    this.srcTitle = null;  //@04A1
    this.isLTR      = ( isLTR && isLTR == true ? true : false );
    this.isPortletRequest = (isPortletRequest ? isPortletRequest : false);
    this.layer      = WLayerFactory.createWLayer( this.id, self, false, false, true );		  
    
	 this.content    = null;
    this.dimension  = null;
    this.topLeftBorderDimension = null;
    this.bottomRightBorderDimension = null;
    
    this.styles     = new Array();
    //this.styleSheets = new Array();
    this.images     = new Array();
    //this.focusSrc = null;
    this.isFocusEvent = false;
    this.focusEventTarget = null;
    
    // public methods
    this.show               = WBubbleHelp_show;
    this.hide               = WBubbleHelp_hide; 
    this.destroy            = WBubbleHelp_destroy; 
    this.setDimension       = WBubbleHelp_setDimension;
    this.setContent         = WBubbleHelp_setContent;
    this.setVisible         = WBubbleHelp_setVisible;

    // private methods
    this.setVisibleRecursive= WBubbleHelp_setVisibleRecursive;
    this.buildContainer     = WBubbleHelp_buildContainer;
    this.updateContainer    = WBubbleHelp_updateContainer;
    this.downloadContent    = WBubbleHelp_downloadContent;
    this.setEventHandlers   = WBubbleHelp_setEventHandlers;
	 this.handleOffContent = WBubbleHelp_handleOffContent;
    this.applyStyle         = WBubbleHelp_applyStyle;
    this.getStyle           = WBubbleHelp_getStyle;
    this.setStyle           = WBubbleHelp_setStyle;
    this.getImage           = WBubbleHelp_getImage;
    this.setImage           = WBubbleHelp_setImage;

    // add to manager
    WBubbleHelpManager[this.id] = this;
}

/**
 * Set dimension of bubble help content
 */
function WBubbleHelp_setDimension( dimension )
{
    this.dimension = dimension;

    if ( this.layer != null && this.layer.isRendered() )
    {
        var layerDimension = new Dimension( this.dimension.getWidth() + this.topLeftBorderDimension.getWidth() + this.bottomRightBorderDimension.getWidth(),
                                            this.dimension.getHeight() + this.topLeftBorderDimension.getHeight() + this.bottomRightBorderDimension.getHeight() );
        this.layer.setDimension( layerDimension );
    }
}

/**
 * Set bubble help content
 *
 * @param content Downloaded content as String
 * @param contentAreaId The id of the content area to populate [optional]
 */
function WBubbleHelp_setContent( content )
{
    this.content = content;

    //Set style of bubble help frame 
    var frame = window.frames[ this.contentGUID ];
    if ( frame.document && frame.document.body )
    {
        var body = frame.document.body;
        body.innerHTML = "" + content;
        if(!this.isLTR)														 //@06A8
        {
           body.dir = "RTL";
        }
        else
        {
           body.dir = "LTR";
        }


        // apply style to IFRAME inline since stylesheet is not
        // guaranteed to be included in IFRAME page
        for ( var i = 0; i < document.styleSheets.length; i++ )
        {
            var styleSheet = document.styleSheets.item(i);
            var rules = null;
            if ( WClient.isBrowserInternetExplorer() )
            {
                rules = styleSheet.rules;
            }
            else if ( WClient.isBrowserMozilla() )  // @08C1
            {
                rules = styleSheet.cssRules;
            }
            for ( var j = 0; j < rules.length; j++ ){
                var rule = rules[j];
                if ( rule.selectorText.indexOf("bh5") != -1 )   //@07C1
                {
                    if ( WClient.isBrowserInternetExplorer() )
                    {
                        body.style.cssText = rule.style.cssText;
                    }
                    else if ( WClient.isBrowserMozilla() ) // @08C1
                    {
                        body.setAttribute( "style", rule.style.cssText );
                    }
                    break;
                }
            }
        }
    }
    else
    {
        // recurse until iframe is accessible
        setTimeout( "WBubbleHelpManager['" + this.id + "'].setContent('" + content + "')", 20 );
    }
}

/**
 * Show bubble help
 */
function WBubbleHelp_show( event )
{	
    this.isFocusEvent = false;

    if ( !this.isReturningFocus )
    {
        var wEvent = new WEvent( event );
		  
        //blank out title so that the fly over for it will not show up
        this.srcTitle = wEvent.getTargetElement().title;  //@04A2
        wEvent.getTargetElement().title = "";

        // check whether we're handling a focus event
        this.isFocusEvent = ( wEvent.getEventType().toLowerCase() == "focus" );
		  this.focusEventTarget = wEvent.getTargetElement();
        
        if ( !this.layer.isRendered() )
        {
            // ensure we have a valid dimension
            if ( this.dimension == null )
            {
                this.dimension = new Dimension( 150, 50 );
            }
            // build container
            var container = this.buildContainer();
            this.layer.setHTMLElement( container );
            this.layer.setVisible( false );
            this.layer.render();
            
				// override WLayer's setVisible method
            this.layer.setLayerVisible = this.layer.setVisible;
            this.layer.setVisible = new Function( "visible", "WBubbleHelpManager['" + this.id + "'].setVisible(visible);" );
            // update container            
			   this.updateContainer( wEvent );
            // download content
            this.downloadContent( this.url ); 				
        }
        else if(!this.isOnContent)
        {
            // update container
            this.updateContainer( wEvent );
            // set it visible
				if(this.isFocusEvent && 
					 WClient.isBrowserMozilla() && // @08C1
					(WClient.getBrowserVersion() == "6.x" || // @08A1
                     WClient.getBrowserVersion() == "6.2" || 
                     WClient.getBrowserVersion() == "6.2.1" || 
                     WClient.getBrowserVersion() == "6.2.2" || 
					 this.isPortletRequest))
				{
                this.downloadContent( this.url);         
				}            
				else
				{
                this.layer.clearTimeout();		//@05A1
					 this.setVisible( true );				
				}
		  }
    }
	 this.isReturningFocus = false;
}

/**
 * Hide bubble help
 */
function WBubbleHelp_hide( event )
{
    var wEvent = new WEvent( event );
    
    //set title back to its original state
    this.focusEventTarget.title = this.srcTitle;  //@04A1

    // set timeout
    this.layer.clearTimeout();		
    this.layer.setTimeout( 400, "hide", false );
}

/**
 * Destroy bubble help.
 */
function WBubbleHelp_destroy()
{
    if ( this.layer != null )
    {
        this.layer.destroy();
    }
    WBubbleHelpManager[this.id] = null;
}

/**
 * Set visibility of bubble help
 */
function WBubbleHelp_setVisible( visible )
{
    if ( !visible )
    {
        // hide all pointer image div
        var topLeftPointerDiv = document.getElementById( this.id + "topLeftPointerDiv" );
        if ( topLeftPointerDiv )
        {
            topLeftPointerDiv.style.visibility = "hidden";
        }

        var topRightPointerDiv = document.getElementById( this.id + "topRightPointerDiv" );
        if ( topRightPointerDiv )
        {
            topRightPointerDiv.style.visibility = "hidden";
        }

        var bottomLeftPointerDiv = document.getElementById( this.id + "bottomLeftPointerDiv" );
        if ( bottomLeftPointerDiv )
        {
            bottomLeftPointerDiv.style.visibility = "hidden";
        }

        var bottomRightPointerDiv = document.getElementById( this.id + "bottomRightPointerDiv" );
        if ( bottomRightPointerDiv )
        {
            bottomRightPointerDiv.style.visibility = "hidden";
        }
    }
    // set layer visibility
    this.layer.setLayerVisible( visible );

    // set nested elements visibility
    if ( WClient.isBrowserMozilla() && parseInt( WClient.getBrowserVersion() ) >= 7 ) // @08C1
    {
        var container = this.layer.getContainer();
        this.setVisibleRecursive( container, visible );
    }

    // set focus on content
    if ( this.isFocusEvent && visible )
    {
        var content = null;
        if ( WClient.isBrowserMozilla() ) // @08C1
        {
            content = window.frames[ this.contentGUID ];					 
        }
        else  // is IE
        {
            content = document.getElementById( this.contentGUID );
        }
        try
        {		 			   
            content.focus();
        }
        catch ( e )
        {
            // Netscape will throw exception if focus() called on HTMLDivElement
            throw e;
        }
    }
}

/**
 * Recurse through layer and set visibility of all nested HTMLElements
 */
function WBubbleHelp_setVisibleRecursive( root, visible )
{
    if ( root )
    {
        if ( root.id &&
             root.id != this.id + "topLeftPointerDiv" &&
             root.id != this.id + "topRightPointerDiv" &&
             root.id != this.id + "bottomLeftPointerDiv" &&
             root.id != this.id + "bottomRightPointerDiv" )
        {
            if ( root.style ) //root.tagName && 
            {
                root.style.visibility = ( visible ? "visible" : "hidden" );
            }
            var children = root.childNodes;
            for ( var i = 0; i < children.length; i++ )
            {
                var child = root.childNodes.item( i );
                this.setVisibleRecursive( child, visible );
            }
        }
    }
}

/**
 * Set event handlers
 */
function WBubbleHelp_setEventHandlers()
{
    var container = this.layer.getContainer();

    container.onmouseover = new Function("event", "WBubbleHelp_handleOnContent( event,'" + this.id + "')" );
    container.onmouseout = new Function("event", "WBubbleHelp_handleOffContent( event,'" + this.id + "')" );

    var isError = false;
    var iframe = null;

    if ( WClient.isBrowserMozilla() ) // @08C1
    {
        iframe = window.frames[ this.contentGUID ];
        isError = ( !iframe || !iframe.document || !iframe.document.body );
        if ( !isError )
        {
            iframe.document.BUBBLE_HELP_ID = this.id;
            iframe.document.onmouseover = new Function("event", "WBubbleHelp_handleOnContent( event,'" + this.id + "')" );
            iframe.document.onmouseout = new Function("event", "WBubbleHelp_handleOffContent( event,'" + this.id + "')" );
            iframe.document.onfocus = new Function("event", "WBubbleHelp_handleOnContent( event,'" + this.id + "')" );
            iframe.document.onblur = new Function("event", "WBubbleHelp_handleOffContent( event,'" + this.id + "')" );
            iframe.document.onkeypress = new Function("event", "WBubbleHelp_handleKeyPress( event,'" + this.id + "')" );
        }
    }
    else
    {
        iframe = document.getElementById( this.contentGUID );
        isError = ( !iframe );
        if ( !isError )
        {
            iframe.BUBBLE_HELP_ID = this.id;
            iframe.onmouseover = new Function("event", "WBubbleHelp_handleOnContent( event,'" + this.id + "')" );
            iframe.onmouseout = new Function("event", "WBubbleHelp_handleOffContent( event,'" + this.id + "')" );
            iframe.onfocus = new Function("event", "WBubbleHelp_handleOnContent( event,'" + this.id + "')" );					 
            iframe.onblur = new Function("event", "WBubbleHelp_handleOffContent( event,'" + this.id + "')" );					 
            iframe.document.onkeypress = new Function("event", "WBubbleHelp_handleKeyPress( event,'" + this.id + "')" );
            window.frames[ this.contentGUID ].document.onkeypress = new Function("event", "WBubbleHelp_handleKeyPress( window.frames[ '" + this.contentGUID + "' ].event,'" + this.id + "');" );  //@03A1
        }
    }

    if ( isError )
    {			   
        setTimeout( "WBubbleHelpManager['" + this.id + "'].setEventHandlers()", 20 );
    }
}

function WBubbleHelp_handleKeyPress( event, bubbleHelpId)
{
	var wEvent = new WEvent(event);
	//Put focus back to target element if key pressed is the escape key
	if(wEvent.getKeyCode() == 27)
	{
		var bubbleHelp = WBubbleHelpManager[bubbleHelpId];		
		bubbleHelp.layer.setVisible(false);
		bubbleHelp.isReturningFocus = true;      
		bubbleHelp.isOnContent = false;
		bubbleHelp.focusEventTarget.focus();	
	}	
}

/**
 * Handle on-content-area events
 */
function WBubbleHelp_handleOnContent( event, bubbleHelpId )
{
	 
    var wEvent = new WEvent( event );
    var bubbleHelp = WBubbleHelpManager[bubbleHelpId];
    var targetElement = wEvent.getTargetElement();

    // content area threw event
    if ( (WClient.isBrowserInternetExplorer()  && !bubbleHelp.isOnContent) ||
		   (targetElement.BUBBLE_HELP_ID &&
         targetElement.BUBBLE_HELP_ID == bubbleHelpId &&
         !bubbleHelp.isOnContent) )
    {
        bubbleHelp.layer.clearTimeout();
        bubbleHelp.isOnContent = true;
    }
    // container threw event
    else if ( (WClient.isBrowserInternetExplorer()  && !bubbleHelp.isOnContainer) || 
				  (targetElement.id == bubbleHelp.layer.getContainer().id && !bubbleHelp.isOnContainer) )
    {
        bubbleHelp.layer.clearTimeout();
        bubbleHelp.isOnContainer = true;
    }
}

/**
 * Handle off-content-area events
 */
function WBubbleHelp_handleOffContent( event, bubbleHelpId )
{
    var wEvent = new WEvent( event );
    var bubbleHelp = WBubbleHelpManager[bubbleHelpId];
    var targetElement = wEvent.getTargetElement();

    // check where event occurred
    if ( (WClient.isBrowserInternetExplorer() && bubbleHelp.isOnContent) ||
		   (targetElement.BUBBLE_HELP_ID &&
         targetElement.BUBBLE_HELP_ID == bubbleHelpId &&
         bubbleHelp.isOnContent) )
    {
        bubbleHelp.isOnContent = false;
    }
    else if ( (WClient.isBrowserInternetExplorer() && bubbleHelp.isOnContainer) || 
		         (targetElement.id == bubbleHelp.layer.getContainer().id && bubbleHelp.isOnContainer) )
    {
        bubbleHelp.isOnContainer = false;
    }

    // hide
    if ( !bubbleHelp.isOnContent && !bubbleHelp.isOnContainer )
    {
		  bubbleHelp.layer.setTimeout( 400, "hide", false );
        // return focus
        if ( bubbleHelp.isFocusEvent && WClient.isBrowserInternetExplorer())
        {			            
			  bubbleHelp.isReturningFocus = true;
           bubbleHelp.focusEventTarget.focus();
			  bubbleHelp.layer.setVisible(false);
        }
    }
}

/**
 * Build bubble help container
 */
function WBubbleHelp_buildContainer()
{
    // load all images for sizing
    var topLeftImg      = this.getImage( "TOP_LEFT" ).createElement( this.isLTR );
    var topRightImg     = this.getImage( "TOP_RIGHT" ).createElement( this.isLTR );
    var middleLeftImg   = this.getImage( "LEFT" ).createElement( this.isLTR );
    var middleRightImg  = this.getImage( "RIGHT" ).createElement( this.isLTR );
    var bottomLeftImg   = this.getImage( "BOTTOM_LEFT" ).createElement( this.isLTR );
    var bottomRightImg  = this.getImage( "BOTTOM_RIGHT" ).createElement( this.isLTR );
    
    // get border area dimensions
    var leftAreaWidth       = middleLeftImg.width;
    var rightAreaWidth      = middleRightImg.width;
    var topAreaHeight       = topLeftImg.height;
    var bottomAreaHeight    = bottomLeftImg.height;

    var contentAreaWidth    = this.dimension.getWidth();
    var contentAreaHeight   = this.dimension.getHeight();

    var totalAreaWidth      = contentAreaWidth + leftAreaWidth + rightAreaWidth;
    var totalAreaHeight     = contentAreaHeight + topAreaHeight + bottomAreaHeight;

    this.layer.setDimension( new Dimension( totalAreaWidth, totalAreaHeight ) );
    
    /*
    var contentAreaWidth    = this.dimension.getWidth() - leftAreaWidth - rightAreaWidth;
    var contentAreaHeight   = this.dimension.getHeight() - topAreaHeight - bottomAreaHeight;

    // check dimension
    if ( contentAreaWidth <= 20 )
    {
        this.dimension.width = leftAreaWidth + rightAreaWidth + 20;
        contentAreaWidth = 20;
    }
    if ( contentAreaHeight <= 20 )
    {
        this.dimension.height = topAreaHeight + bottomAreaHeight + 20;
        contentAreaHeight = 20;
    }

    //alert( contentAreaWidth + "," + contentAreaHeight + "," + this.dimension.getHeight() + "," + topAreaHeight + "," + bottomAreaHeight );
    */

    // save border dimensions
    this.topLeftBorderDimension = new Dimension( leftAreaWidth, topAreaHeight );
    this.bottomRightBorderDimension = new Dimension( rightAreaWidth, bottomAreaHeight );

    var container = document.createElement( "DIV" );
    container.id = this.containerGUID;
    // must set div width to zero for WLayer.sizeContainerToContent to work

    if ( !WClient.isBrowserMozilla() || WClient.isBrowserNetscape() ) //@08A1
    {
        container.style.width = "0px";
    }

    var tableElement = document.createElement( "TABLE" );
    container.appendChild( tableElement );
    tableElement.dir = "LTR";
    tableElement.border=0;
    tableElement.cellSpacing=0;
    tableElement.cellPadding=0; 

    var tbodyElement = document.createElement( "TBODY" );
    tableElement.appendChild(tbodyElement);

    var topTrElement = document.createElement("TR");
    tbodyElement.appendChild(topTrElement);

    var topLeftTdElement = document.createElement("TD");
    topTrElement.appendChild(topLeftTdElement);
    topLeftTdElement.appendChild( topLeftImg );

    topMiddleTdElement = document.createElement("TD");
    topMiddleTdElement.id = this.id + 'topMiddleTd';
    topMiddleTdElement.style.vAlign = "top";
    topMiddleTdElement.style.whiteSpace = "nowrap";
    topTrElement.appendChild(topMiddleTdElement);
    this.applyStyle("TOP_BACKGROUND", topMiddleTdElement);

    var topRightTdElement = document.createElement("TD");
    topTrElement.appendChild(topRightTdElement);
    topRightTdElement.appendChild( topRightImg );

    var middleTrElement = document.createElement("TR");
    tbodyElement.appendChild(middleTrElement);

    var middleLeftTdElement = document.createElement("TD");
    middleTrElement.appendChild(middleLeftTdElement);
    middleLeftTdElement.appendChild(middleLeftImg);
    this.applyStyle("LEFT_BACKGROUND", middleLeftTdElement);

    var middleTdElement = document.createElement("TD");
    middleTrElement.appendChild(middleTdElement);
    this.applyStyle("MIDDLE", middleTdElement); 

    var contentArea = null;
    contentArea = document.createElement( "IFRAME" );
    with ( contentArea )
    {
        id = this.contentGUID;
        name = this.contentGUID;
        src = ( this.secureURL != null ? this.secureURL : "about:blank" ); // @09C2
        title = this.title;
        frameBorder = "0";
        marginWidth = "0";
        marginHeight = "0";				

        if ( WClient.isBrowserInternetExplorer() )
        {
            allowTransparency = "true";
        }
        with ( style )
        {
            // set actual dimension below
            width = contentAreaWidth + "px";
            height = contentAreaHeight + "px";
        }
    }

    middleTdElement.appendChild( contentArea );

    var middleRightTdElement = document.createElement("TD");
    middleTrElement.appendChild(middleRightTdElement);
    middleRightTdElement.appendChild(middleRightImg);
    this.applyStyle("RIGHT_BACKGROUND", middleRightTdElement);

    var bottomTrElement = document.createElement("TR");
    tbodyElement.appendChild(bottomTrElement);

    var bottomLeftTdElement = document.createElement("TD");
    bottomTrElement.appendChild(bottomLeftTdElement);
    bottomLeftTdElement.appendChild( bottomLeftImg );

    bottomMiddleTdElement = document.createElement("TD");
    bottomMiddleTdElement.id = this.id + 'bottomMiddleTd';
    bottomMiddleTdElement.style.vAlign = "top";
    bottomMiddleTdElement.style.whiteSpace = "nowrap";
    bottomTrElement.appendChild(bottomMiddleTdElement);
    this.applyStyle("BOTTOM_BACKGROUND", bottomMiddleTdElement);

    var bottomRightTdElement = document.createElement("TD");
    bottomTrElement.appendChild(bottomRightTdElement);
    bottomRightTdElement.appendChild( bottomRightImg );

    // top left pointer
    var topLeftPointerDiv = document.createElement( "DIV" );
    var topLeftPointerImage = this.getImage( "POINTER_TOP_LEFT" ).createElement( this.isLTR );
    topMiddleTdElement.appendChild( topLeftPointerDiv );
    with ( topLeftPointerDiv )
    {
        id = this.id + "topLeftPointerDiv";
        align = "left";
        with ( style )
        {
            position = "absolute";
            // actual position set in updateContainer method
            top = "0px";
            left = "0px";
            zIndex = "98";
            width = topLeftPointerImage.width + "px";
            height = topLeftPointerImage.height  + "px";
            visibility = "hidden";
        }
    }
    topLeftPointerDiv.appendChild( topLeftPointerImage );

    // top right pointer
    var topRightPointerDiv = document.createElement( "DIV" );
    var topRightPointerImage = this.getImage( "POINTER_TOP_RIGHT" ).createElement( this.isLTR );
    topMiddleTdElement.appendChild( topRightPointerDiv );
    with ( topRightPointerDiv )
    {
        id = this.id + "topRightPointerDiv";
        align = "left";
        with ( style )
        {
            position = "absolute";
            // actual position set in updateContainer method
            top = "0px";
            left = "0px";
            zIndex = "99";
            width = topRightPointerImage.width + "px";
            height = topRightPointerImage.height  + "px";
            visibility = "hidden";
        }
    }
    topRightPointerDiv.appendChild( topRightPointerImage );

    // bottom left pointer
    var bottomLeftPointerDiv = document.createElement( "DIV" );
    var bottomLeftPointerImage = this.getImage( "POINTER_BOTTOM_LEFT" ).createElement( this.isLTR );
    bottomMiddleTdElement.appendChild( bottomLeftPointerDiv );
    with ( bottomLeftPointerDiv )
    {
        id = this.id + "bottomLeftPointerDiv";
        with ( style )
        {
            position = "absolute";
            // actual position set in updateContainer method
            top = "0px";
            left = "0px";
            width = bottomLeftPointerImage.width + "px";
            height = bottomLeftPointerImage.height + "px";
            zIndex = "98";
            visibility = "hidden";
        }
    }
    bottomLeftPointerDiv.appendChild( bottomLeftPointerImage );

    // bottom right pointer
    var bottomRightPointerDiv = document.createElement( "DIV" );
    var bottomRightPointerImage = this.getImage( "POINTER_BOTTOM_RIGHT" ).createElement( this.isLTR );
    bottomMiddleTdElement.appendChild( bottomRightPointerDiv );
    with ( bottomRightPointerDiv )
    {
        id = this.id + "bottomRightPointerDiv";
        with ( style )
        {
            position = "absolute";
            // actual position set in updateContainer method
            top = "0px";
            left = "0px";
            width = bottomRightPointerImage.width + "px";
            height = bottomRightPointerImage.height + "px";
            zIndex = "99";
            visibility = "hidden";
        }
    }
    bottomRightPointerDiv.appendChild( bottomRightPointerImage );

    return container;
}

/**
 * Update bubble help content container
 */
function WBubbleHelp_updateContainer( wEvent )
{
    /*
    var dimension = this.dimension;
    if ( dimension == null )
    {
        dimension = this.layer.getDimension();
    }
    */
    var dimension = this.layer.getDimension();

    var topLeftPointerDiv = document.getElementById( this.id + "topLeftPointerDiv" );
    var topRightPointerDiv = document.getElementById( this.id + "topRightPointerDiv" );
    var bottomLeftPointerDiv = document.getElementById( this.id + "bottomLeftPointerDiv" );
    var bottomRightPointerDiv = document.getElementById( this.id + "bottomRightPointerDiv" );
    
	 // first hide them all so that only the correct one will be shown
    topLeftPointerDiv.style.visibility = "hidden";
    topRightPointerDiv.style.visibility = "hidden";
    bottomLeftPointerDiv.style.visibility = "hidden";
    bottomRightPointerDiv.style.visibility = "hidden";

	 //Get information needed for positioning the bubble help
    var sourceTop = WUtilities.getTop(wEvent.getTargetElement(), true);
    var sourceLeft = WUtilities.getLeft(wEvent.getTargetElement(), true);
    var sourceWidth = wEvent.getTargetElement().offsetWidth;
    var sourceHeight = wEvent.getTargetElement().offsetHeight;
    if ( WClient.isBrowserInternetExplorer() )
    {
       windowHeight = document.body.clientHeight;
       windowWidth = document.body.clientWidth;
    }
    else
    {
      windowHeight = window.innerHeight;
      windowWidth = window.innerWidth; 
    }

    if((sourceTop - dimension.getHeight()) > 0) //bubble help can fit to top of the source
    {
        //can fit to top right of the source,
       //or if cannot fit to the left either, still put it to right so scroll bars are useful
       if(sourceLeft + sourceWidth + dimension.getWidth() < windowWidth ||
          dimension.getWidth() > sourceLeft)
        {
            bottomLeftPointerDiv.style.visibility = "visible";
            bottomLeftPointerDiv.style.top = ( dimension.getHeight() - this.bottomRightBorderDimension.getHeight() ) + "px";
            bottomLeftPointerDiv.style.left = this.topLeftBorderDimension.getWidth() + "px";
            
            this.layer.setPosition(new WclPosition(sourceLeft, sourceTop-dimension.getHeight(), 100));
        }
        else         //place bubble help above and to the left of the source
        {
            bottomRightPointerDiv.style.visibility = "visible";
            bottomRightPointerDiv.style.top = ( dimension.getHeight() - this.bottomRightBorderDimension.getHeight() ) + "px";
            bottomRightPointerDiv.style.left = ( dimension.getWidth() - this.bottomRightBorderDimension.getWidth() - parseInt( bottomRightPointerDiv.style.width ) ) + "px";

            this.layer.setPosition(new WclPosition(sourceLeft + sourceWidth -dimension.getWidth(), sourceTop-dimension.getHeight(), 100));
        }
    }
    else
    {
        //bubble help can fit to the bottom right of the source
        //or if cannot fit to the left either, still put it to right so scroll bars are useful
        if ( sourceLeft + sourceWidth + dimension.getWidth() < windowWidth ||
             dimension.getWidth() > sourceLeft)
        {
            topLeftPointerDiv.style.visibility = "visible";
            topLeftPointerDiv.style.top = "0px";
            topLeftPointerDiv.style.left = this.topLeftBorderDimension.getWidth() + "px";        

            this.layer.setPosition(new WclPosition(sourceLeft, sourceTop+sourceHeight, 100));
        }

        // setup bottom right pointer
        else       
        {
            topRightPointerDiv.style.visibility = "visible";
            topRightPointerDiv.style.top = "0px";
            topRightPointerDiv.style.left = ( dimension.getWidth() - this.bottomRightBorderDimension.getWidth() - parseInt( topRightPointerDiv.style.width ) ) + "px";                

            this.layer.setPosition(new WclPosition(sourceLeft + sourceWidth -dimension.getWidth(), sourceTop+sourceHeight, 100));
        }
    }
}

/**
 * Download bubble help content
 *
 * @param contentDivId The id for content div to populate
 * @param url The URL to download content from
 */
function WBubbleHelp_downloadContent( url)
{
    var connection = new WConnection();
    connection.download( url, new Function("content,elapsedTime", "WBubbleHelpManager['" + this.id + "'].setContent( content ); WBubbleHelpManager['" + this.id + "'].setEventHandlers(); WBubbleHelpManager['" + this.id + "'].setVisible(true);" ) ); 	 
}

/**
 * Get style
 */
function WBubbleHelp_getStyle( styleKey )
{
    return this.styles[ styleKey ];
}

/**
 * Set style
 */
function WBubbleHelp_setStyle( styleKey, styleObj )
{
    this.styles[ styleKey ] = styleObj;
}

/**
 * Apply style to HTMLElement
 */
function WBubbleHelp_applyStyle( styleKey, tag )
{
    if ( tag != null && styleKey != null )
    {
        var style = this.getStyle( styleKey );
        if ( style != null )
        {
            if ( style.applyStyle != null )
            {
                style.applyStyle( tag, this.isLTR );
            }
            else
            {
                tag.className = null;
                tag.style.cssText = style;
                tag.setAttribute( "style", style );
            }
        }
        else
        {
            // keep these classNames with the real values!
            switch ( styleKey )
            {
            case "TOP_BACKGROUND":
                style = "bh1";      //@07C1
                break;
            case "LEFT_BACKGROUND":
                style = "bh4";     //@07C1
                break;
            case "MIDDLE":
                style = "bh5";     //@07C1
                break;
            case "RIGHT_BACKGROUND":
                style = "bh6";     //@07C1
                break;
            case "BOTTOM_BACKGROUND":
                style = "bh7";    //@07C1
                break;
            }

            if ( style != null )
            {
                tag.className = style;
                tag.style.cssText = null;
                tag.setAttribute( "style", null );
            }
        }
    }
}

/**
 * Set image
 */
function WBubbleHelp_setImage( imgKey, imgObj )
{
    this.images[ imgKey ] = imgObj;
}

/**
 * Get image
 */
function WBubbleHelp_getImage( imgKey )
{
    return this.images[ imgKey ];
}
