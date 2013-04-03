/*********************************************************** {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM                                               
* Tivoli Presentation Services                                   
*                                                    
* (C) Copyright IBM Corp. 2000,2003 All Rights Reserved.                            
*                                                               
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
************************************************************ {COPYRIGHT-END} ***
* Change Activity on 6/26/03 version 1.3:
* @00=WCL, V3R4, 02/10/2003, NFE: Initial version
* @01=D113660, V3R4, 06/26/2003, NFE: Fix HTTPS content loading issue
*******************************************************************************/

/**
 * This is a concrete extension of WLayer tailored to a non-FRAME,
 * DIV-capable Internet Explorer environment.
 */


/**
 * WIEDivLayer - Constructor
 *
 * @param id Unique ID. Collision problems may occur if this ID is not
 *        globally unique. Therefore, it is suggested you use the
 *        WUtilities.getGUID( .. ) method to generate a unique ID.
 * @param parentWindow Parent HTML Window element in which WLayer will be
 *        created. Default is self.
 * @param scrollable Whether or not layer is scrollable. Default is false.
 * @param sizeToContent Whether or not layer should size itself to match
 *        the dimention of its content. Default is true.
 * @param allowTransparency Whether or not to allow transparency. Default is
 *        false.
 * @param secureURL URL pointing to content served using HTTPS. This URL will
 *        be used to set the src attribute of a transparent IFRAME that is used
 *        to fix bleeding of HTMLSelectFormElements through absolutely
 *        positioned HTMLElements. If using a secure server, this URL must be
 *        specified at the risk of experiencing "Secure/Non-Secure"
 *        warnings issued by the browser. The URL must be secure and from the
 *        same domain as parentWindow.
 */
function WIEDivLayer( id, parentWindow, scrollable, sizeToContent, allowTransparency, secureURL ) // @01C1
{
    // extend WDivLayer by invoking superclass constructor
    this.superclass = WDivLayer;
    this.superclass( id, parentWindow, scrollable, sizeToContent, allowTransparency );
    delete this.superclass;

    this.transparentGUID    = WUtilities.getGUID( this.id + '_transparent' );
    this.secureURL            = secureURL; // @01A1

    this.render             = WIEDivLayer_render;
    this.getContentDimension= WIEDivLayer_getContentDimension;
    this.setDimension       = WIEDivLayer_setDimension;
    this.setHTML            = WIEDivLayer_setHTML;
    this.setHTMLElement     = WIEDivLayer_setHTMLElement;
    this.setPosition        = WIEDivLayer_setPosition;
    this.setVisible         = WIEDivLayer_setVisible;

    //this.sizeTransparentToContent = WIEDivLayer_sizeTransparentToContent;
}


/**
 * Render layer
 */
function WIEDivLayer_render()
{
    var container = this.getContainer();
    if ( !container )
    {
        // render tranparent, drop-down-masking IFRAME
        var iframeElement = this.parentWindow.document.createElement( "IFRAME" );
        with ( iframeElement )
        {
            id = this.transparentGUID;
            name = this.transparentGUID;
            src = ( this.secureURL != null ? this.secureURL : "about:blank" ); // @01A1
            //allowTransparency = false;
            with ( style )
            {
                filter      = "Alpha(Opacity=0)";
                position    = "absolute";
                left        = this.position.getX() + "px";
                top         = this.position.getY() + "px";
                zIndex      = this.position.getZ() - 1;
                width       = this.dimension.getWidth() + "px";
                height      = this.dimension.getHeight() + "px";
                visibility  = ( this.visible ? "visible" : "hidden" );
            }
        }
        this.parentWindow.document.body.appendChild( iframeElement );

        // render container DIV
        container = this.parentWindow.document.createElement( "DIV" );

        with ( container )
        {
            id = this.containerGUID;
            innerHTML = ( this.html != null ? this.html : "" );

            with ( style )
            {
                position    = "absolute";
                overflow    = ( this.scrollable ? "auto" : "hidden" );
                left        = this.position.getX() + "px";
                top         = this.position.getY() + "px";
                zIndex      = this.position.getZ();
                width       = this.dimension.getWidth() + "px";
                height      = this.dimension.getHeight() + "px";
                visibility  = ( this.visible ? "visible" : "hidden" );
                if ( this.sizeToContent )
                {
                    whiteSpace  = "nowrap";
                }
                if ( !this.allowTransparency )
                {
                    backgroundColor = "#ffffff";
                }
            }
        }
        this.parentWindow.document.body.appendChild( container );

        if ( this.htmlElement != null )
        {
            container = this.parentWindow.document.getElementById( this.containerGUID );
            container.appendChild( this.htmlElement );
        }

        if ( this.sizeToContent )
        {
            this.sizeContainerToContent();
            //this.sizeTransparentToContent();
        }

        // setup timeout
        this.setTimeout( this.timeout, this.timeoutType );

        this.rendered = true;
    }
}

/**
 * Destroy layer
 */
function WDivLayer_destroy()
{
    var container = this.getContainer();
    if ( container )
    {
        this.parentWindow.document.body.removeChild( container );
    }
    var transparentElement = this.parentWindow.document.getElementById( this.transparentGUID );
    if ( transparentElement )
    {
        this.parentWindow.document.body.removeChild( transparentElement );
    }
    WLayerManager.removeWLayer( this );
}

/**
 * Set layer content as HTML string
 *
 * @param html A String of HTML
 */
function WIEDivLayer_setHTML( html )
{
    if ( this.html != html )
    {
        this.html = html;

        if ( this.isRendered() )
        {
            var container = this.getContainer();
            // remove current element
            if (container.childNodes.length > 0) {
               var currentElement = container.childNodes.item(0);
               if ( currentElement != null )
               {
                  container.removeChild( currentElement );
                  this.htmlElement = null;
               }
            }
            // set new html
            container.innerHTML = ( this.html != null ? this.html : "" );

            if ( this.sizeToContent )
            {
                this.sizeContainerToContent();
                //this.sizeTransparentToContent();
            }
        }
    }
}

/**
 * Set layer content as HTMLElement
 *
 * @param htmlElement A reference to an HTMLElement
 */
function WIEDivLayer_setHTMLElement( htmlElement )
{
    if ( this.htmlElement != htmlElement )
    {
        this.htmlElement = htmlElement;

        if ( this.isRendered() )
        {
            var container = this.getContainer();
            // remove old element
            if (container.childNodes.length > 0) {
               var currentElement = container.childNodes.item(0);
               if ( currentElement != null )
               {
                   container.removeChild( currentElement );
                   this.html = null;
               }
            }
            // add new element
            container.appendChild( htmlElement );

            if ( this.sizeToContent )
            {
                this.sizeContainerToContent();
                //this.sizeTransparentToContent();
            }
        }
    }
}

/**
 * Get dimension of WLayer content
 *
 * @return Dimension of content as Dimension object
 */
function WIEDivLayer_getContentDimension()
{
    var contentDimension = null;
    var container = this.getContainer();
    if ( container )
    {
        //177672_f1 container.style.width = "0px";
        //177672_f1 container.style.height = "0px";
        container.style.width = ""; //177672_f1
        container.style.height = ""; //177672_f1
        
        if (container.childNodes.length > 0) {
           var contentElement = container.childNodes.item(0);
           if ( contentElement )
           {
               //170732 begins
               var maxWidth = contentElement.offsetWidth;
               var maxHeight = contentElement.offsetHeight;
               if (this.scrollable == false) {
                   if ( contentElement.scrollWidth != undefined ) {
                       maxWidth = ((maxWidth > contentElement.scrollWidth) ? maxWidth : contentElement.scrollWidth);
                   }
                   if ( contentElement.scrollHeight != undefined ) {
                       maxHeight = ((maxHeight > contentElement.scrollHeight) ? maxHeight : contentElement.scrollHeight);
                   }                
               }
               contentDimension = new Dimension( maxWidth, maxHeight );
               //170732 ends;
               //170732 contentDimension = new Dimension( contentElement.offsetWidth, contentElement.offsetHeight );
           }
        }
    }
    return contentDimension;
}

/**
 * Set dimension of layer container
 *
 * @param dimension Instance of Dimension object
 */
function WIEDivLayer_setDimension( dimension )
{
    this.dimension = ( dimension ? dimension : new Dimension( 200, 100 ) );
    this.sizeToContent = false;
    
    var container = this.getContainer();
    if ( container )
    {
        container.style.width = this.dimension.getWidth() + "px";
        container.style.height = this.dimension.getHeight() + "px";
    }
    var transparentElement = this.parentWindow.document.getElementById( this.transparentGUID );
    if ( transparentElement )
    {
        transparentElement.style.width = this.dimension.getWidth() + "px";
        transparentElement.style.height = this.dimension.getHeight() + "px";
    }
}

/**
 * Set position of layer
 *
 * @param position Instance of Position object
 */
function WIEDivLayer_setPosition( position )
{
    this.position = ( position ? position : new WclPosition( 0, 0, 100 ) );

    var container = this.getContainer();
    if ( container )
    {
        container.style.left = this.position.getX() + "px";
        container.style.top = this.position.getY() + "px";
        container.style.zIndex = this.position.getZ();
    }
    var transparentElement = this.parentWindow.document.getElementById( this.transparentGUID );
    if ( transparentElement )
    {
        transparentElement.style.left = this.position.getX() + "px";
        transparentElement.style.top = this.position.getY() + "px";
        transparentElement.style.zIndex = this.position.getZ();
    }
}

/*
 * Set visibility of layer
 *
 * @param visible True if visible, false otherwise
 */
function WIEDivLayer_setVisible( visible )
{
    if ( this.visible != visible )
    {
        this.visible = ( visible && visible == true ? true : false );

        var container = this.getContainer();
        var transparentElement = this.parentWindow.document.getElementById( this.transparentGUID );

        if ( container && transparentElement )
        {
            if ( this.visible )
            {
                //this.sizeContainerToContent();
                container.style.visibility = "visible";
                transparentElement.style.visibility = "visible";
            }
            else
            {
                container.style.visibility = "hidden";
                transparentElement.style.visibility = "hidden";
            }
        }
    }
}
