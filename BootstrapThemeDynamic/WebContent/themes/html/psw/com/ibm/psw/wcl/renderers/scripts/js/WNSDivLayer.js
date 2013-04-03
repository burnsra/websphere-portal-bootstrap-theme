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
* @01=D109928, V3R4, 02/19/2003, NFE: Fix inline image positioning
*******************************************************************************/

/**
 * This is a concrete extension of WLayer tailored to a non-FRAME,
 * DIV-capable Netscape environment.
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
 */
function WNSDivLayer( id, parentWindow, scrollable, sizeToContent, allowTransparency )
{
    // extend WDivLayer by invoking superclass constructor
    this.superclass = WDivLayer;
    this.superclass( id, parentWindow, scrollable, sizeToContent, allowTransparency );
    delete this.superclass;

    this.sizeContainerToContent     = WNSDivLayer_sizeContainerToContent;
    this.sizeContainerToContentImpl = WNSDivLayer_sizeContainerToContentImpl;
    this.getContentDimension        = WNSDivLayer_getContentDimension;
    this.setVisible                 = WNSDivLayer_setVisible;
}

/**
 * Size layer container to the dimension of its content
 */
function WNSDivLayer_sizeContainerToContent()
{
    if ( this.isRendered() || this.html == null )
    {
        this.sizeContainerToContentImpl();
    }
    // handle initial sizing problem (when setHTML used) by reseting content
    else
    {
        this.sizeContainerToContentImpl();

        this.setVisible( false );
        var originalHTML = this.html;
        var tempHTML = "<div>temporary content</div>";
        
        setTimeout( "WLayerManager.getWLayerByID('" + this.id + "').setHTML('" + tempHTML + "')", 100 );
        setTimeout( "WLayerManager.getWLayerByID('" + this.id + "').setHTML('" + originalHTML + "')", 200 );
        setTimeout( "WLayerManager.getWLayerByID('" + this.id + "').setVisible(true)", 210 );
    }
}

/**
 * Size layer container to the dimension of its content
 */
function WNSDivLayer_sizeContainerToContentImpl()
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
 * Get dimension of WLayer content
 *
 * @return Dimension of content as Dimension object
 */
function WNSDivLayer_getContentDimension()
{
    var contentDimension = null;
    var container = this.getContainer();
    
    if ( container )
    {
        var containerWidth = container.style.width;
        container.style.width = "";
        container.style.height = ""; //177672_f1

        var contentElement = container.childNodes.item(0);
        if ( contentElement )
        {
            if ( this.scrollable )
            {
                container.style.overflow = "visible";
                var width = parseInt(Math.max( contentElement.offsetWidth, container.offsetWidth ) );
                var containerHeight = 0;
                if ( this.isRendered() )
                {
                    containerHeight = container.style.height;
                    container.style.height = "0px";
                }
                var height = parseInt(Math.max( contentElement.offsetHeight, container.offsetHeight ) );
                container.style.overflow = "auto";
                contentDimension = new Dimension( width, height );
                if ( this.isRendered() )
                {
                    container.style.height = containerHeight;
                }
            }
            else
            {
            //177672_f1 begins
            var maxWidth = contentElement.offsetWidth;
            var maxHeight = contentElement.offsetHeight;
            if (this.scrollable == false) {
                if ( contentElement.scrollWidth != undefined ) {
                    maxWidth = ((maxWidth > contentElement.scrollWidth) ? maxWidth : contentElement.scrollWidth);
                }
                if ( contentElement.scrollHeight != undefined ) {
                    maxHeight = ((maxHeight > contentElement.scrollHeight) ? maxHeight : contentElement.scrollHeight);
                }
                if (maxWidth == 0) {
                    maxWidth = ((maxWidth > container.scrollWidth) ? maxWidth : container.scrollWidth);
                }
                if (maxHeight == 0) {
                    maxHeight = ((maxHeight > container.scrollHeight) ? maxHeight : container.scrollHeight);
                }
            }
            contentDimension = new Dimension( maxWidth, maxHeight );
            ////177672_f1 ends;
            ////177672_f1 contentDimension = new Dimension( contentElement.offsetWidth, contentElement.offsetHeight );
            }
        }
        container.style.width = containerWidth;
    }
    return contentDimension;
}

/*
 * Set visibility of layer
 *
 * @param visible True if visible, false otherwise
 */
function WNSDivLayer_setVisible( visible )
{
    if ( this.visible != visible )
    {
        this.visible = ( visible && visible == true ? true : false );

        var container = this.getContainer();

        if ( container )
        {
            if ( this.visible )
            {
                //this.sizeContainerToContent();
                container.style.visibility = "visible";
            }
            else
            {
                container.style.visibility = "hidden";
            }
        }
    }
}


