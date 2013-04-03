/*********************************************************** {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM                                               
* Tivoli Presentation Services                                   
*                                                    
* (C) Copyright IBM Corp. 2000,2003 All Rights Reserved.                            
*                                                               
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
************************************************************ {COPYRIGHT-END} ***
* Change Activity on 6/23/03 version 1.8.1.1:
* @00=D107400, V3R4, 12/16/2002, NFE: Initial version
* @01=D108605, V3R4, 01/24/2003, KDK: Add image/style/positioning methods
* @02=D109442, V3R4, 02/11/2003, NFE: Convert WLayerUtilities to WUtilties
* @03=D109928, V3R4, 02/18/2003, NFE: Handle failed downloads in WConnection
* @04=D109955, V3R4, 03/03/2003, JHF: Added generic event methods
* @05=D111484, V3R4, 03/18/2003, KDK: WConnection content not being loaded sometimes in IE
* @05=D113426, V3R4, 04/30/2003, NFE: Clean up
* @06=D112993, V3R4, 06/18/2003, NFE: Add check for Mozilla browser
*******************************************************************************/

/**
 * This static class provides utility methods
 */

/**
 * Static, Singleton Constructor
 */
if ( !self.WUtilities )
{
    self.WUtilities = new WUtilitiesImpl();
}
function WUtilitiesImpl()
{
    // private variables
    this.events             = null;

    this.cloneHTMLElement   = WUtilities_cloneHTMLElement;
    this.mergeAttributes    = WUtilities_mergeAttributes;
    this.mergeEventHandlers = WUtilities_mergeEventHandlers;
    this.getElementById     = WUtilities_getElementById;
    this.getOwnerWindow     = WUtilities_getOwnerWindow;
    //this.getOwnerWLayer     = WUtilities_getOwnerWLayer;
    this.getOuterHTML       = WUtilities_getOuterHTML;
    this.getGUID            = WUtilities_getGUID;
    this.containsFrames     = WUtilities_containsFrames;
    this.appendHTMLElement  = WUtilities_appendHTMLElement;

    this.getOffsetWidth     = WUtilities_getOffsetWidth;
    this.getWidth           = WUtilities_getWidth;
    this.getHeight          = WUtilities_getHeight;
    this.getLeft            = WUtilities_getLeft;
    this.getTop             = WUtilities_getTop;

    this.alert              = WUtilities_alert;  
    this.debug              = WUtilities_debug;  
    this.status             = WUtilities_status;  

    // private methods
    this.init               = WUtilities_init;  
    this.init();
}

/**
 * Initialize environment
 */
function WUtilities_init()
{

    // initialize list of events
    this.events = [
                  "activate",
                  "afterupdate",
                  "beforeactivate",
                  "beforecopy",
                  "beforecut",
                  "beforedeactivate",
                  "beforeeditfocus ",
                  "beforepaste",
                  "beforeupdate",
                  "blur",
                  "change",
                  "click",
                  "close",
                  "contextmenu",
                  "controlselect",
                  "copy",
                  "cut",
                  "dblclick",
                  "deactivate",
                  "drag",
                  "dragend",
                  "dragenter",
                  "dragleave",
                  "dragover",
                  "dragstart",
                  "drop",
                  "error",
                  "errorupdate",
                  "filterchange",
                  "focus",
                  "focusin",
                  "focusout",
                  "help",
                  "keydown",
                  "keypress",
                  "keyup",
                  "layoutcomplete",
                  "load",
                  "losecapture",
                  "mousedown",
                  "mouseenter",
                  "mouseleave",
                  "mousemove",
                  "mouseout",
                  "mouseover",
                  "mouseup",
                  "mousewheel",
                  "move",
                  "moveend",
                  "movestart",
                  "paste",
                  "propertychange",
                  "readystatechange",
                  "reset",
                  "resize",
                  "resizeend",
                  "resizestart",
                  "scroll",
                  "selectstart",
                  "submit",
                  "timeerror",
                  "unload"
                  ];
}

/**
 * Display alert dialog
 *
 * @param text Text to display in alert dialog
 */
function WUtilities_alert( text )
{
    alert( text );
}

/**
 * Display debug message
 *
 * @param message Text message to display
 */
function WUtilities_debug( message )
{
    if ( WLayerConstants.DEBUG )
    {
        this.alert( "DEBUG: " + message );
    }
}

/**
 * Set window status
 *
 * @param text Text to display in window status
 */
function WUtilities_status( text )
{
    window.status = "" + text;
}

/**
 * Get HTML for HTMLElement and its content
 *
 * @param element An HTMLElement
 *
 * @return HTML for HTMLElement and its content 
 */ 
function WUtilities_getOuterHTML( element )
{
    var outerHTML = "";
    if ( WClient.isBrowserInternetExplorer() )
    {
        outerHTML = element.outerHTML;
    }
    else
    {
        var doc = element.ownerDocument;
        var tempDIV = doc.createElement( "DIV" );
        tempDIV.style.visibility = "hidden";
        doc.body.appendChild( tempDIV );

        tempDIV.appendChild( element );
        outerHTML = tempDIV.innerHTML;
    }
    return outerHTML;
}

/**
 * Get a Globally Unique Identifier (GUID) by making baseID globally unique
 *
 * @param baseID The base ID to make globally unique
 *
 * @return A globally unique ID
 */
function WUtilities_getGUID( baseID )
{
    var date = (new Date()).valueOf();
    var random = parseInt(1000*Math.random());

    return( '' + baseID + date + random );
}

/**
 * cloneHTMLElement - Recursivly clone an HTMLElement, creating
 * the new HTMLElement in doc's DOM structure.
 *
 * @param doc The HTMLDocument to which clone will be appended
 * @param element The HTMLElement to clone.
 * @param cloneIdentity Whether or not to clone element's ID attribute
 */
function WUtilities_cloneHTMLElement( doc, element, cloneIdentity )
{
    var clone = null;
    if ( element.tagName )
    {
        // clone element
        clone = doc.createElement( element.tagName );
        
        // special case for form input elements
        if ( element.tagName == "INPUT" )
        {
            clone.type = element.type;
        }

        // merge attributes
        this.mergeAttributes( element, clone, cloneIdentity );

        // merge event handlers
        this.mergeEventHandlers( element, clone );

        var children = element.childNodes;
        for ( var i = 0; i < children.length; i++ )
        {
            clone.appendChild( this.cloneHTMLElement( doc, children[i], true ) );
        }
    }
    else if ( element.data )
    {
        clone = doc.createTextNode( element.data );
    }
    else
    {
        clone = doc.createTextNode( "" );
    }
    return clone;
}

/**
 * Copies all attributes from source element to target element.
 *
 * @note For correct results, use this method instead of IE's proprietary
 *       JScript version.
 *
 * @param source Source HTMLElement to copy from
 * @param target Target HTMLElement to copy to
 * @param mergeIdentity Whether or not to merge source element's ID attribute
 */
function WUtilities_mergeAttributes( source, target, mergeIdentity )
{
    for ( var i = 0; i < source.attributes.length; i++ )
    {
        var attribute = source.attributes[i];
        if ( attribute.nodeValue != "" && ( mergeIdentity || ( attribute.nodeName != "id" && attribute.nodeName != "name" ) ) )
        {
            target.setAttribute( attribute.nodeName, attribute.nodeValue );
        }
    }
    if ( source.style != null && source.style.cssText != null )
    {
        target.style.cssText = source.style.cssText;
    }
    if ( source.className != null )
    {
        target.className = source.className;
    }
}

/**
 * Copies all event handlers from source element to target element.
 *
 * @param source Source HTMLElement to copy from
 * @param target Target HTMLElement to copy to
 */
function WUtilities_mergeEventHandlers( source, target )
{
    for ( var i = 0; i < this.events.length; i++ )
    {
        var onEvent = "on" + this.events[i];

        if ( eval( "source." + onEvent ) )
        {
            var sourceScript = "" + eval( "source." + onEvent );
            if ( WClient.isBrowserInternetExplorer() &&
                 sourceScript.toLowerCase().indexOf( "function" ) != 0 )
            {
                eval( 'target.' + onEvent + '=new Function("", "' + source.getAttribute( onEvent ) + '")' );
            }
            else
            {
                eval( "target." + onEvent + "=source." + onEvent );
            }
        }
    }
}

/**
 * Get owner HTMLWindow of an HTMLElement
 *
 * @param element The element to evaluate
 *
 * @return The owner window of element, or null
 */
function WUtilities_getOwnerWindow( element )
{
    var ownerWindow = null;

    if ( element != null )
    {
        var tempElement = element;
        
        if ( WClient.isBrowserInternetExplorer() && tempElement.ownerDocument )
        {
            ownerWindow = tempElement.ownerDocument.parentWindow;
        }
        else if ( !tempElement.ownerWindow )
        {
            var tempID = tempElement.id;
            var guid = this.getGUID( tempElement.id );
            tempElement.id = guid;
            var updatedElement = this.getElementById( top, guid );
            if ( updatedElement && updatedElement.ownerDocument )
            {
                tempElement = updatedElement;
            }
            tempElement.id = tempID;
            ownerWindow = tempElement.ownerWindow;
        }
    }
    return ownerWindow;
}

/**
 * Recursively traverse entire DOM and return element that has matching id. 
 * Side effect: attributes 'ownerWindow' and 'ownerDocument' will be set on 
 * returned element.
 *
 * @param root The root window to traverse from
 * @param id The HTMLElement id to match on
 *
 * @return The HTMLElement with matching id, or null if none exists
 */
function WUtilities_getElementById( root, id )
{
    var element = null;

    if ( root != null )
    {
        var rootDocument = root.document;
        if ( rootDocument != null )
        {
            var tempElement = rootDocument.getElementById( id );
            if ( tempElement )
            {
                if ( !tempElement.ownerDocument )
                {
                    tempElement.ownerDocument = rootDocument;
                }
                if ( !tempElement.ownerWindow )
                {
                    tempElement.ownerWindow = root;
                }
                element = tempElement;
            }
            else if ( root.frames )
            {
                for ( var i = 0; i < root.frames.length; i++ )
                {
                    var frame = root.frames[i];
                    element = this.getElementById( frame, id );
                    if ( element != null )
                    {
                        break;
                    }
                }
            }
        }
    }
    return element;
}

/**
 * Get owner WLayer of an HTMLElement.
 *
 * @param element The element to evaluate
 * @return Reference to owner WLayer or null, if HTMLElement is not
 *         contained within a WLayer or the containing WLayer has
 *         not been initialized/rendered via WLayer.render().
 */
/*
function WUtilities_getOwnerWLayer( element )
{
    var ownerWLayer = null;

    var ownerWindow = this.getOwnerWindow( element );
    if ( ownerWindow )
    {
        ownerWLayer = ownerWindow.getOwnerWLayer();
    }
    return ownerWLayer;
}
*/

/**
 * Check whether a HTMLWindowElement is parent to any I/FRAMEs 
 *
 * @param windowElement The HTMLWindowElement to check
 *
 * @return True if HTMLWindowElement is parent to any I/FRAMEs,
 *         false otherwise
 */
function WUtilities_containsFrames( windowElement )
{
    var containsFrames = false;

    if ( windowElement != null )
    {
        //var containsIFrames = ( windowElement.document.getElementsByTagName( "IFRAME" ) == null );
        containsFrames = (  windowElement.frames && windowElement.frames.length != 0 );
    }

    return containsFrames;
}

/**
 * Append a source HTMLElement to a target HTMLElement
 *
 * @param source The source HTMLElement
 * @param target The target HTMLElement
 * @return True if source successfully appended to target, false otherwise
 */
function WUtilities_appendHTMLElement( source, target )
{
    var success = false;

    // try appending element
    try
    {
        target.appendChild( source );
        success = true;
    }
    catch ( e )
    {
        success = false;
    }
    // try cloning element and then appending
    if ( !success )
    {
        try
        {
            var doc = this.getOwnerWindow( target ).document;
            var clone = this.cloneHTMLElement( doc, source, true );
            target.appendChild( clone );
            success = true;
        }
        catch ( e )
        {
            success = false;
        }
    }
    // copy element HTML
    if ( !success )
    {
        try
        {
            var elementHTML = this.getOuterHTML( source );
            target.innerHTML = elementHTML;
            success = true;
        }
        catch ( e )
        {
            success = false;
        }
    }
    return success;
}

///////////////////////////////////////////////////////////////////////////////
// generic element positioning methods
///////////////////////////////////////////////////////////////////////////////
function WUtilities_getWidth( element )
{
    return element.offsetWidth;
}

function WUtilities_getHeight( element )
{
    return element.offsetHeight;
}

function WUtilities_getLeft( element, recurse )
{
    var value = 0;
    if ( recurse && element.offsetParent != null )
    {
        value += this.getLeft( element.offsetParent, recurse );
    }
    if ( element != null )
    {
        value += element.offsetLeft;
    }
    return value;
}

function WUtilities_getTop( element, recurse )
{
    var value = 0;
    if ( recurse && element.offsetParent != null )
    {
        value += this.getTop( element.offsetParent, recurse );
    }
    if ( element != null )
    {
        value += element.offsetTop;
    }
    return value;
}


/**
 * Compute offsetWidth
 */
function WUtilities_getOffsetWidth( element, document )
{
	var offsetW = element.parentNode.offsetWidth;
	if (WClient.isBrowserMozilla() && offsetW == 0) {
		// note that the returned value is a string (eg. 100px) so do parseInt
		offsetW = parseInt(document.defaultView.getComputedStyle(element, null).getPropertyValue("width"));
		if (isNaN(offsetW))
			offsetW = 0; // for fail safe
	}
    return offsetW;
}

/**
 * Event wrapper for cross-browser access to event properties
 */
function WEvent( eventObject )
{
    // private members
    this.eventObject        = ( eventObject ? eventObject : window.event );
    this.cancelBubble       = false;
    this.returnValue        = true;

    // public methods
    this.getEventType       = new Function( "", "return this.eventObject.type;" );
    this.getDispatchElement = WEvent_getDispatchElement;
    this.getTargetElement   = WEvent_getTargetElement;
    this.getCancelBubble    = new Function( "", "return this.cancelBubble;" );
    this.setCancelBubble    = WEvent_setCancelBubble;
    this.getReturnValue     = new Function( "", "return this.returnValue;" );
    this.setReturnValue     = WEvent_setReturnValue;
    
    this.isMouseEvent       = WEvent_isMouseEvent;
    this.getOffsetPosition  = WEvent_getOffsetPosition;
    this.getPagePosition    = WEvent_getPagePosition;
    this.getScreenPosition  = new Function( "", "return new WclPosition(this.eventObject.screenX,this.eventObject.screenY,0);" );
    this.getButtonCode      = new Function( "", "return this.eventObject.button;" );

    this.isKeyEvent         = WEvent_isKeyEvent;
    this.isAltKeyPressed    = new Function( "", "return this.eventObject.altKey;" );
    this.isCtrlKeyPressed   = new Function( "", "return this.eventObject.ctrlKey;" );
    this.isShiftKeyPressed  = new Function( "", "return this.eventObject.shiftKey;" );
    this.getKeyCode         = WEvent_getKeyCode;
}



/**
 * Get HTMLElement to which event was originally dispatched, i.e. the 
 * HTMLElement that initially fired this event. This will always
 * return a reference to an Element. Event handlers registered at
 * the window level will return a reference to their HTMLDocumentElement.
 * the window or document level will return a reference to the HTMLBodyElement.
 */
function WEvent_getDispatchElement()
{
    if ( WClient.isBrowserInternetExplorer() )
    {
        return ( this.eventObject.srcElement ? this.eventObject.srcElement : window.document );
    }
    else if ( WClient.isBrowserMozilla() ) // @06C1
    {
        //var element = ( this.eventObject.currentTarget ? this.eventObject.currentTarget : this.eventObject.target );
        var element =  this.eventObject.target;
        if ( element )
        {
            // HTMLWindowElement
            if ( element.frames )
            {
                return element.document;
            }
            // HTMLDocumentElement or other Element
            else
            {
                return element;
            }
        }
        else
        {
            return null;
        }
    }
    else
    {
        return null;
    }
}

/**
 * Get element registered as the target for the event. This will always
 * return a reference to an Element. Event handlers registered at
 * the window level will return a reference to their HTMLDocumentElement.
 * @note Internet Explorer will always return the dispatch element therefore
 *       invalidating calls to getTargetElement on WEvents that wrap
 *       propogated/bubbled events.
 */
function WEvent_getTargetElement()
{
    if ( WClient.isBrowserInternetExplorer() )
    {
        return ( this.eventObject.srcElement ? this.eventObject.srcElement : window.document );
    }
    else if ( WClient.isBrowserMozilla() ) // @06C1
    {
        var element = this.eventObject.currentTarget;
        if ( element )
        {
            // HTMLWindowElement
            if ( element.frames )
            {
                return element.document;
            }
            // HTMLDocumentElement or other Element
            else
            {
                return element;
            }
        }
        else
        {
            return null;
        }
    }
    else
    {
        return null;
    }
}

function WEvent_setCancelBubble( cancelBubble )
{
    this.cancelBubble = cancelBubble;
    this.eventObject.cancelBubble = this.cancelBubble;
}

function WEvent_setReturnValue( returnValue )
{
    this.returnValue = returnValue;
    if ( WClient.isBrowserInternetExplorer() )
    {
        this.eventObject.returnValue = this.returnValue;
    }
}

function WEvent_isMouseEvent()
{
    return ( this.getKeyCode() == 0 );
}

function WEvent_getOffsetPosition()
{
    if ( WClient.isBrowserInternetExplorer() )
    {
        return new WclPosition( this.eventObject.offsetX, this.eventObject.offsetY, 0 );
    }
    else if ( WClient.isBrowserMozilla() ) // @06C1
    {
        return new WclPosition( this.eventObject.clientX, this.eventObject.clientY, 0 );
    }
    else
    {
        return null;
    }
}

function WEvent_getPagePosition()
{
    if ( WClient.isBrowserInternetExplorer() )
    {
        return new WclPosition( this.eventObject.clientX, this.eventObject.clientY, 0 );
    }
    else if ( WClient.isBrowserMozilla() ) // @06C1
    {
        return new WclPosition( this.eventObject.pageX, this.eventObject.pageY, 0 );
    }
    else
    {
        return null;
    }
}

function WEvent_isKeyEvent()
{
    return ( this.getKeyCode() != 0 );
}

function WEvent_getKeyCode()
{
    if ( WClient.isBrowserInternetExplorer() )
    {
        return this.eventObject.keyCode;
    }
    else if ( WClient.isBrowserMozilla() ) // @06C1
    {
        return ( this.eventObject.keyCode != 0 ? this.eventObject.keyCode : this.eventObject.charCode );
    }
    else
    {
        return null;
    }
}

///////////////////////////////////////////////////////////////////////////////
// image
///////////////////////////////////////////////////////////////////////////////

function WImage( srcLTR, srcRTL, width, height, alt )
{
    this.srcLTR = srcLTR;
    this.srcRTL = srcRTL;
    this.width = width;
    this.height = height;
    this.alt = alt;

    this.createElement = WImage_createElement;
    this.preloadImage = WImage_preloadImage;
    this.getSrc = WImage_getSrc;

    this.preloadImage( this.srcLTR );
    this.preloadImage( this.srcRTL );
}

function WImage_getSrc( isLTR )
{
    if ( isLTR != null && isLTR == false && this.srcRTL != null )
    {
        return this.srcRTL;
    }
    else
    {
        return this.srcLTR;
    }
}

function WImage_createElement( isLTR )
{
    var img = document.createElement( "IMG" );
    img.src = this.getSrc( isLTR );
    img.width = this.width;
    img.height = this.height;
    img.alt = ( this.alt ? this.alt : "" );
    img.border = 0;
    img.style.display = "block";
    return img;
}

function WImage_preloadImage( src )
{
    if ( src != null )
    {
        var preload = new Image();
        preload.src = src;
    }
}

///////////////////////////////////////////////////////////////////////////////
// style
///////////////////////////////////////////////////////////////////////////////

function WStyle( styleLTR, styleRTL )
{
    this.styleLTR = styleLTR;
    this.styleRTL = styleRTL;

    if ( this.styleRTL == null )
    {
        this.styleRTL = this.styleLTR;
    }

    this.applyStyle = WStyle_applyStyle;
}

function WStyle_applyStyle( tag, isLTR )
{
    if ( tag != null )
    {
        if ( isLTR != null && isLTR == false )
        {
            if ( this.styleRTL != null )
            {
                tag.style.cssText = this.styleRTL;
                tag.setAttribute( "style", this.styleRTL );
            }
        }
        else
        {
            if ( this.styleLTR != null )
            {
                tag.style.cssText = this.styleLTR;
                tag.setAttribute( "style", this.styleLTR );
            }
        }
        // clear out the class name
        tag.className = null;
    }
}

if ( !self.WConnectionManager )
{
    self.WConnectionManager = new Object();
}

/**
 * WConnection class for downloading and uploading content from same-domain
 * URLs.
 */
function WConnection()
{
    // connection properties
    this.id                 = WUtilities.getGUID( "WConnection" );
    
    // download properties
    this.downloadId         = WUtilities.getGUID( "WConnection_download" );
    this.downloadCallback   = null;
    this.maxDownloadWaitTime= -1;
    this.downloadStartTime  = 0;
    this.downloadTimer      = null;
    this.downloadTimeoutTimer = null;
    this.downloadComplete   = false;
    
    /*
    // upload properties
    this.uploadId           = WUtilities.getGUID( "WConnection_upload" );
    this.uploadCallback     = null;
    this.maxUploadWaitTime  = 10000;
    this.uploadStartTime    = 0;
    */

    // public methods
    this.destroy            = WConnection_destroy;
    this.isDestroyed        = WConnection_isDestroyed;
    this.download           = WConnection_download;
    this.isDownloadComplete = WConnection_isDownloadComplete;
    //this.upload             = WConnection_upload;
    //this.isUploadComplete   = WConnection_isUploadComplete;

    // add connection to connection manager
    WConnectionManager[ this.id ] = this;
}

/**
 * Destroy this connection
 */
function WConnection_destroy()
{
    WConnectionManager[ this.id ] = null;
}

/**
 * Check whether this connection has been destroyed
 */
function WConnection_isDestroyed()
{
    return ( WConnectionManager[ this.id ] == null );
}

/**
 * Download content from specified url and receive callback upon completion.
 * Downloaded content will be passed as String argument to callback method.
 *
 * @param url The url to load content from
 * @param callback A Function reference for callback when download is complete
 *        This function will be called as follows: callback( content, elapsedTime )
 *        where content is a String and elapsedTime is in milliseconds.
 * @param maxWaitTime Maximum time in milliseconds to wait for download to
 *        complete. If timeout occurs, callback will be called and passed a value
 *        of null. A value of -1 (default) indicates infinite wait time.
 */
function WConnection_download( url, callback, maxWaitTime )
{
    this.downloadCallback = callback;
    this.maxDownloadWaitTime = ( maxWaitTime ? maxWaitTime : -1 );
    this.downloadStartTime = (new Date()).valueOf();
    this.downloadComplete = false;
    
    var commFrame = document.getElementById( this.id );
    if ( commFrame != null )
    {
        if ( WClient.isBrowserInternetExplorer() )
        {
            // remove old IFRAME
            document.body.removeChild( commFrame );
        }
        else
        {
            // create new id to force creation of new IFRAME
            this.downloadId = WUtilities.getGUID( "WConnection_download" );
        }
    }
    // create IFRAME
    commFrame = document.createElement( "IFRAME" );

    // set IFRAME attributes
    with ( commFrame )
    {
        id = this.downloadId;
        name = this.downloadId;
        src = url;
        frameBorder = 0;
        marginHeight = 0;
        marginWidth = 0;

        // set IFRAME style
        with ( style )
        {
            position = "absolute";
            visibility = "hidden";
        }
    }

    // append IFRAME to document body
    document.body.appendChild( commFrame );

    if ( WClient.isBrowserInternetExplorer() )
    {
        WConnection_waitForDownload( this.id );
    }
    else
    {
        WConnection_checkDownloadTimeout( this.id );
        var frame = window.frames[ this.downloadId ];
        frame.onload = new Function( "", "WConnection_waitForDownload('" + this.id + "');" );
    }
}

/**
 * Handle completed download
 */
function WConnection_downloadCompleted( connectionId )
{
    var connection = ( connectionId ? WConnectionManager[connectionId] : this );
    var frame = window.frames[ connection.downloadId ];
    var root = frame.document.documentElement;
    var content = null;

    // @03 - clear timers
    clearTimeout( connection.downloadTimer );
    clearTimeout( connection.downloadTimeoutTimer );

    var currentTime = (new Date()).valueOf();
    var elapsedTime = ( currentTime - connection.downloadStartTime );

    // Since we can't grab outer HTML in Netscape, must rebuild top level tag
    if ( WClient.isBrowserMozilla() ) // @06C1
    {
        var startTag = "<" + root.tagName;
        var endTag = "</" + root.tagName + ">";

        for ( var i = 0; i < root.attributes.length; i++ )
        {
            var attribute = root.attributes.item(i);
            startTag += " " + attribute.name + "=\"" + attribute.value + "\"";
        }
        startTag += ">";

        content = startTag + root.innerHTML + endTag;

        var commFrame = document.getElementById( connection.id );
        if ( commFrame != null )
        {
            commFrame.disabled = true;
        }
    }
    else
    {
        content = root.outerHTML;
    }

    connection.downloadComplete = true;
    connection.downloadCallback( content, elapsedTime );
}

/**
 * Handle failed download
 */
function WConnection_downloadFailed( connectionId )
{
    var connection = ( connectionId ? WConnectionManager[connectionId] : this );
    var currentTime = (new Date()).valueOf();
    var elapsedTime = ( currentTime - connection.downloadStartTime );

    // @03 - clear timers
    clearTimeout( connection.downloadTimer );
    clearTimeout( connection.downloadTimeoutTimer );

    connection.downloadComplete = true;
    connection.downloadCallback( null, elapsedTime );
}

/**
 * Wait for download to either complete or for timeout to occur
 */
function WConnection_waitForDownload( connectionId )
{
    var connection = ( connectionId ? WConnectionManager[connectionId] : this );
    var currentTime = (new Date()).valueOf();
    var elapsedTime = ( currentTime - connection.downloadStartTime );
    
    clearTimeout( connection.downloadTimer );

    if ( !connection.downloadComplete )
    {
        if ( connection.maxDownloadWaitTime != -1 && 
             elapsedTime > connection.maxDownloadWaitTime )
        {
            WConnection_downloadFailed( connection.id );
        }
        else if ( !connection.isDownloadComplete() )
        {
            connection.downloadTimer = setTimeout( "WConnection_waitForDownload('" + connectionId + "')", 20 ); 
        }
        else
        {
            WConnection_downloadCompleted( connection.id );
        }
    }
}

/**
 * Check that timeout has not occured during download
 */
function WConnection_checkDownloadTimeout( connectionId )
{
    var connection = ( connectionId ? WConnectionManager[connectionId] : this );
    var currentTime = (new Date()).valueOf();
    var elapsedTime = ( currentTime - connection.downloadStartTime );
    
    clearTimeout( connection.downloadTimeoutTimer );

    if ( !connection.downloadComplete )
    {
        if ( connection.maxDownloadWaitTime != -1 && 
             elapsedTime > connection.maxDownloadWaitTime )
        {
            WConnection_downloadFailed( connection.id );
        }
        else
        {
            connection.downloadTimeoutTimer = setTimeout( "WConnection_checkDownloadTimeout('" + connection.id + "')", 20 );
        }
    }
}

/**
 * Check whether download is complete
 *
 * @return True if download has completed, been aborted due to timeout, or
 *         otherwise failed.
 */
function WConnection_isDownloadComplete( connectionId )
{
    var connection = ( connectionId ? WConnectionManager[connectionId] : this );
    var isComplete = false;
    if ( connection.downloadComplete )
    {
        isComplete = true;
    }
    else
    {
        try
        {
            var frame = window.frames[ connection.downloadId ];
            if ( WClient.isBrowserInternetExplorer() )			//@05A6
            {               
                isComplete = ( frame && frame.document && frame.document.documentElement && frame.document.readyState == 'complete');
            }
            else
            {
                isComplete = ( frame && frame.document && frame.document.documentElement);            
            }			//@05A1
        }
        catch ( e )
        {
            // @03 - IE will throw an 'Access denied' exception if it is unable
            // to access the requested URL. It throws the exception
            // because it attempts to load an IE-system-generated error page,
            // which comes from a different domain and cross-domain access is
            // illegal with unsigned/untrusted JavaScript. Therefore, we can
            // safely fail this download.
            WConnection_downloadFailed( connection.id );
        }
    }
    return isComplete;
}

/**
 * This class encapsulates the position of an HTMLElement.
 */

/**
 * Position - Constructor
 *
 * @param x WLayer position along the x-axis
 * @param y WLayer position along the y-axis
 * @param z WLayer position along the z-axis
 */
function WclPosition( x, y, z )
{
    this.x = ( x ? x : 0 );
    this.y = ( y ? y : 0 );
    this.z = ( z ? z : 100 );
    this.getX = new Function( "", "return this.x" );
    this.getY = new Function( "", "return this.y" );
    this.getZ = new Function( "", "return this.z" );
    this.toString = new Function( '', 'return ("[x="+this.x+",y="+this.y+",z="+this.z+"]")' );
}

/**
 * This class encapsulates the dimension of an HTMLElement.
 */

/**
 * Dimension - Constructor
 *
 * @param width The width of the HTMLElement
 * @param height The height of the HTMLElement
 */
function Dimension( width, height )
{
    this.width = ( width ? width : 0 );
    this.height = ( height ? height : 0 );
    this.getWidth = new Function( "", "return this.width" );
    this.getHeight = new Function( "", "return this.height" );
    this.toString = new Function( '', 'return ("[width="+this.width+",height="+this.height+"]")' );
}

/**
 * DEPRECATED: This class encapsulates the size of an HTMLElement.
 */

/**
 * Size - Constructor
 *
 * @param width The width of the WLayer
 * @param height The height of the WLayer
 */
function Size( width, height )  /** deprecated after 3.4 */
{
    this.width = ( width ? width : 0 );
    this.height = ( height ? height : 0 );
    this.toString = new Function( '', 'return ("[width="+this.width+",height="+this.height+"]")' );
}


///////////////////////////////////////////////////////////////////////////////
// generic event methods
///////////////////////////////////////////////////////////////////////////////

/**
 * Returns the event object. In NS, returns the event object parameter.
 * In IE, it checks for window.event. If window.event is null, it searches
 * child frames for window.event (the event originated in a layer).
 * event - the event passed to the handler
 */
function getEvent( event ) {
    if ( event != null ) {
        return event;
    }
    else if ( window.event != null ) {
        return window.event;
    }
    else {
        // IE event is coming from layer
        for ( var i=0; i<document.frames.length; i++ ) {
            if ( document.frames[i].window.event != null ) {
                return document.frames[i].window.event;
            }
        }
    }
    return null;
}

/**
 * Returns the html tag target of the given event. Uses getEvent(event)
 * to find the real event object.
 * event - the event passed to the handler
 */
function getEventTarget( event ) {
    var aEvent = getEvent( event );
    if ( aEvent != null ) {
        if ( aEvent.target != null ) {
            return aEvent.target;
        }
        else if ( aEvent.srcElement != null ) {
            return aEvent.srcElement;
        }
    }
    return null;
}

/**
 * Returns the html document of the given event. Uses getEventTarget(event)
 * and getEvent(event) to find the real event object and target.
 * event - the event passed to the handler
 */
function getEventDocument( event ) {
    var target = getEventTarget( event );
    if ( target != null ) {
        return target.ownerDocument;
    }
    return null;
}

