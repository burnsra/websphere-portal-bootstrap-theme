/*********************************************************** {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM                                               
* Tivoli Presentation Services                                   
*                                                    
* (C) Copyright IBM Corp. 2000,2003 All Rights Reserved.                            
*                                                               
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
************************************************************ {COPYRIGHT-END} ***
* Change Activity on 3/28/03 version 1.3:
* @00=WCL, V3R4, 02/10/2003, NFE: Initial version
* @01=D111074, V3R4, 03/12/2003, NFE: Fix BIDI issue
*******************************************************************************/

/**
 * This is a concrete extension of WLayer tailored to a non-FRAME,
 * DIV-capable environment.
 */


/**
 * WDivLayer - Constructor
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
 */
function WDivLayer( id, parentWindow, scrollable, sizeToContent, allowTransparency )
{
    // extend WLayer by invoking superclass constructor
    this.superclass = WLayer;
    this.superclass( id, parentWindow, scrollable, sizeToContent, allowTransparency );
    delete this.superclass;

    this.render                 = WDivLayer_render;
    this.update                 = WDivLayer_update;
    this.destroy                = WDivLayer_destroy;
    this.setHTML                = WDivLayer_setHTML;
    this.setHTMLElement         = WDivLayer_setHTMLElement;
}


/**
 * Render layer
 */
function WDivLayer_render()
{
    var container = this.getContainer();
    if ( !container )
    {
        container = this.parentWindow.document.createElement( "DIV" );

        with ( container )
        {
            id          = this.containerGUID;
            innerHTML   = ( this.html != null ? this.html : "" );
            dir         = "LTR";  // @01

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
        }

        // setup timeout
        this.setTimeout( this.timeout, this.timeoutType );

        this.rendered = true;
    }
}

/**
 * Update layer
 */
function WDivLayer_update()
{
    if ( this.sizeToContent )
    {
        this.sizeContainerToContent();
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
    WLayerManager.removeWLayer( this );
}

/**
 * Set layer content as HTML string
 *
 * @param html A String of HTML
 */
function WDivLayer_setHTML( html )
{
    if ( this.html != html )
    {
        this.html = html;
        this.htmlElement = null;

        if ( this.isRendered() )
        {
            var container = this.getContainer();
            // remove current element
            var currentElement = container.childNodes.item(0);
            if ( currentElement != null )
            {
                container.removeChild( currentElement );
            }
            container.innerHTML = ( this.html != null ? this.html : "" );

            if ( this.sizeToContent )
            {
                this.sizeContainerToContent();
            }
            // Netscape 6.2.x bug: touch container to force repaint
            else if ( parseInt( WClient.getBrowserVersion() ) == 6 )
            {
                var tempPosition = this.position;
                this.setPosition( new WclPosition( this.position.getX()+1, this.position.getY()+1, this.position.getZ()+1) );
                this.setPosition( tempPosition );
            }
        }
    }
}

/**
 * Set layer content as HTMLElement
 *
 * @param htmlElement A reference to an HTMLElement
 */
function WDivLayer_setHTMLElement( htmlElement )
{
    if ( this.htmlElement != htmlElement )
    {
        this.htmlElement = htmlElement;
        this.html = null;

        if ( this.isRendered() )
        {
            var container = this.getContainer();
            // remove old element
            var currentElement = container.childNodes.item(0);
            if ( currentElement != null )
            {
                container.removeChild( currentElement );
            }
            // add new element
            container.appendChild( this.htmlElement );

            if ( this.sizeToContent )
            {
                this.sizeContainerToContent();
            }
            // Netscape 6.2.x bug: touch container to force repaint
            else if ( parseInt( WClient.getBrowserVersion() ) == 6 )
            {
                var tempPosition = this.position;
                this.setPosition( new WclPosition( this.position.getX()+1, this.position.getY()+1, this.position.getZ()+1) );
                this.setPosition( tempPosition );
            }
        }
    }
}
