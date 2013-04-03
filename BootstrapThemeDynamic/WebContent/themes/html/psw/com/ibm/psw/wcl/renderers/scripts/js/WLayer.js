/*********************************************************** {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM                                               
* Tivoli Presentation Services                                   
*                                                    
* (C) Copyright IBM Corp. 2000,2003 All Rights Reserved.                            
*                                                               
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
************************************************************ {COPYRIGHT-END} ***
* Change Activity on 3/28/03 version 1.4:
* @00=D107400, V3R4, 12/16/2002, NFE: Initial version
* @01=D108605, V3R4,  01/24/2003, KDK: Add Timeout ability to hide
* @02=D109442, V3R4, 02/11/2003, NFE: Add DIV-based WLayer support
*******************************************************************************/

/**
 * This is an abstract class defining base functionality for a WLayer.
 * Concrete classes will tailor WLayer functionality to the appropriate
 * environment, e.g. Frame v. Non-Frame, Netscape v. Internet Explorer.
 * Use WLayerFactory to create instances of WLayer.
 */

/**
 * WLayer - Constructor
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
function WLayer( id, parentWindow, scrollable, sizeToContent, allowTransparency )
{
    // private instantiation-time properties
    this.id                 = id;
    this.parentWindow       = ( parentWindow ? parentWindow : self );
    this.scrollable         = ( scrollable ? scrollable : false );
    this.sizeToContent      = ( sizeToContent ? sizeToContent : true );
    this.allowTransparency  = ( allowTransparency ? allowTransparency : false );
    
    // private constant properties
    this.containerGUID      = WUtilities.getGUID( this.id + '_container' );
    
    // private run-time properties
    this.rendered           = false;
    this.timeout            = -1;
    this.timeoutType        = "destroy";
    this.setEventListeners  = false;
    this.timer              = null;

    // private mutable properties
    this.dimension          = new Dimension( 200, 100 );
    this.html               = null;
    this.htmlElement        = null;
    this.position           = new WclPosition( 0, 0, 0 );
    this.visible            = true;

    // private methods
    this.init                   = WLayer_init;
    this.getContentDimension    = WLayer_getContentDimension;
    this.sizeContainerToContent = WLayer_sizeContainerToContent;

    // public setter methods
    this.setHTML            = WLayer_setHTML;
    this.setHTMLElement     = WLayer_setHTMLElement;
    this.setDimension       = WLayer_setDimension;
    this.setPosition        = WLayer_setPosition;
    this.setVisible         = WLayer_setVisible;
    //this.setSizeToContent   = new Function( "sizeToContent", "this.sizeToContent=sizeToContent;" ); /* deprecated after 3.4 */
    //this.setScrollable      = new Function( "scrollable", "this.scrollable=scrollable;" ); /* deprecated after 3.4 */
    //this.setStyleSheet      = new Function( "styleSheet", "" ); /* deprecated after 3.4 */
    //this.setSize            = new Function( "size", "this.setDimension(new Dimension(size.width, size.height));" ); /* deprecated after 3.4 */
    this.setTimeout         = WLayer_setTimeout;
    this.clearTimeout       = WLayer_clearTimeout;

    // public getter methods
    this.getID              = WLayer_getID;
    //this.getRendered        = WLayer_isRendered; /* deprecated after 3.4 */
    this.isRendered         = WLayer_isRendered;
    this.getDimension       = new Function( "", "return this.dimension;" );
    this.getPosition        = new Function( "", "return this.position;" );
    this.isVisible          = new Function( "", "return this.visible;" );
    this.isSizeToContent    = new Function( "", "return this.sizeToContent;" );
    this.isScrollable       = new Function( "", "return this.scrollable;" );
    this.getContainer       = WLayer_getContainer;
    //this.getSize            = new Function( "", "if (this.dimension == null ) return null;return new Size( this.dimension.getWidth(), this.dimension.getHeight() );" ); /* deprecated after 3.4 */

    // public action methods
    this.render             = WLayer_render;
    this.update             = WLayer_update;
    this.destroy            = WLayer_destroy;

    // private method invokation
    this.init();
}

/**
 * Initialize layer
 */
function WLayer_init()
{
}

/**
 * Get dimension of WLayer content
 *
 * @return Dimension of content as Dimension object
 */
function WLayer_getContentDimension()
{
    var contentDimension = null;
    var container = this.getContainer();
    
    if ( container )
    {
        //177672_f1 container.style.width = "0px";
        //177672_f1 container.style.height = "0px";
        container.style.width = ""; //177672_f1
        container.style.height = ""; //177672_f1
        
        var contentElement = container.childNodes.item(0);
        if ( contentElement )
        {
            contentDimension = new Dimension( contentElement.offsetWidth, contentElement.offsetHeight );
        }
    }
    return contentDimension;
}

/**
 * Set dimension of layer container
 *
 * @param dimension Instance of Dimension object
 * @note Netscape 6.2.x will clip incorrectly if contents of WLayer 
 *       contain IFRAMEs and WLayer scrolling is not enabled.
 */
function WLayer_setDimension( dimension )
{
    this.dimension = ( dimension ? dimension : new Dimension( 200, 100 ) );
    this.sizeToContent = false;
    
    var container = this.getContainer();
    if ( container )
    {
        container.style.width = this.dimension.getWidth() + "px";
        container.style.height = this.dimension.getHeight() + "px";
    }
}

/**
 * Set layer content as HTML string
 *
 * @param html A String of HTML
 */
function WLayer_setHTML( html )
{
    this.html = html;
    // derived class should override this method
}

/**
 * Set layer content as HTMLElement
 *
 * @param htmlElement A reference to an HTMLElement
 */
function WLayer_setHTMLElement( htmlElement )
{
    this.htmlElement = htmlElement;
    // derived class should override this method
}

/**
 * Set position of layer
 *
 * @param position Instance of Position object
 */
function WLayer_setPosition( position )
{
    this.position = ( position ? position : new WclPosition( 0, 0, 100 ) );

    var container = this.getContainer();
    if ( container )
    {
        container.style.left = this.position.getX() + "px";
        container.style.top = this.position.getY() + "px";
        container.style.zIndex = this.position.getZ();
    }
}

/*
 * Set visibility of layer
 *
 * @param visible True if visible, false otherwise
 */
function WLayer_setVisible( visible )
{
    if ( this.visible != visible )
    {
        this.visible = ( visible && visible == true ? true : false );

        var container = this.getContainer();
        if ( container )
        {
            container.style.visibility = ( this.visible ? "visible" : "hidden" );
        }
    }
}

/**
 * Get layer ID
 */
function WLayer_getID()
{
    return this.id;
}

/**
 * Check whether layer has been rendered
 */
function WLayer_isRendered()
{
    return this.rendered;
}

/**
 * Get reference to innermost container HTMLElement
 */
function WLayer_getContainer()
{
    return this.parentWindow.document.getElementById( this.containerGUID );
}

/**
 * Render layer. This method is responsible for rendering HTMLElements
 * used to build layer.
 */
function WLayer_render()
{
    // derived class should override this method
}

/**
 * Update layer. This method is responsible for updating HTMLElements
 * used to build layer. A common use of this method would be to resize
 * layer's container to size of its content after a content mutation.
 */
function WLayer_update()
{
    // derived class should override this method
}

/**
 * Destroy layerThis method is responsible for destroying HTMLElements
 * used to build layer.
 */
function WLayer_destroy()
{
    // derived class should override this method
}

/**
 * Size layer container to the dimension of its content
 */
function WLayer_sizeContainerToContent()
{
    var contentDimension = this.getContentDimension();
    if ( contentDimension != null )
    {
        var tempSizeToContent = this.sizeToContent;
        this.setDimension( contentDimension );
        this.sizeToContent = tempSizeToContent;
    }
}


/**
 * Set number of milliseconds after which WLayer will either hide or destroy
 * itself. If use of default event listeners is specified, WLayer will stop
 * timeout with mouseover or focus event and will start timeout with mouseout
 * or blur event. WLayer will only listen for these events on the container
 * HTMLElement.
 *
 * @note Mouse events will not be captured by WLayer if contents contain 
 *       IFRAMEs
 *
 * @param milliseconds The number of milliseconds after which WLayer 
 *        will destroy itself.
 * @param type The type of timeout, i.e. 'destroy' or 'hide'.
 * @param setEventListeners True if WLayer should set mouse and focus event
 *        listeners on container, false if application will handle listeners
 *        or listeners are not desired.
 */
function WLayer_setTimeout( milliseconds, type, setEventListeners )
{
    // store timeout value
    this.timeout = milliseconds;
    // store timeout type
    this.timeoutType = ( type ? type : "destroy" );
    // store whether to set event listeners
    this.setEventListeners = ( setEventListeners ? setEventListeners : false );

    if ( !this.isRendered() )
    {
        // set listeners/handlers
        if ( this.setEventListeners )
        {
            var container = this.getContainer();
            container.onmouseover = new Function( "", "WLayer_stopTimer('" + this.id + "');" );
            container.onfocus = new Function( "", "WLayer_stopTimer('" + this.id + "');" );
            container.onmouseout = new Function( "", "WLayer_startTimer('" + this.id + "');" );
            container.onblur = new Function( "", "WLayer_startTimer('" + this.id + "');" );
        }
    }
    if ( this.timeout >= 0 )
    {
        // clear timer
        clearTimeout( this.timer );
        // start timer
        this.timer = setTimeout( 'WLayer_handleTimeout("' + this.id + '")', this.timeout );
    }
}

/**
 * clearTimeout - Clear/Abort WLayer timeout.
 */
function WLayer_clearTimeout()
{
    if ( this.timer != null )
    {
        clearTimeout( this.timer );
        this.timer = null;
        this.timeout = -1;
    }
}

/**
 * Stop timer
 *
 * @param id Unique WLayer ID.
 */
function WLayer_stopTimer( id )
{
    var layer = WLayerManager.getWLayerByID( id );
    if ( layer )
    {
        layer.tempTimeout = new Number( layer.timeout );
        layer.clearTimeout();
    }
}

/**
 * Re/Start timer
 *
 * @param id Unique WLayer ID.
 */
function WLayer_startTimer( id )
{
    var layer = WLayerManager.getWLayerByID( id );
    if ( layer )
    {
        var timeout = ( layer.tempTimeout ? layer.tempTimeout : layer.timeout );
        layer.setTimeout( timeout );
    }
}

/**
 * Timeout WLayer, thus destroying it
 *
 * @param id Unique WLayer ID.
 */
function WLayer_handleTimeout( id )
{
    var layer = WLayerManager.getWLayerByID( id );
    if ( layer )
    {
        layer.clearTimeout();
        // destroy
        if ( this.timeoutType == "destroy" )
        {
            layer.destroy();        
        }
        // hide
        else
        {
            layer.setVisible( false );
        }
    }
}
