/*********************************************************** {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM                                               
* Tivoli Presentation Services                                   
*                                                    
* (C) Copyright IBM Corp. 2000,2003 All Rights Reserved.                            
*                                                               
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
************************************************************ {COPYRIGHT-END} ***
* Change Activity on 6/30/03 version 1.3.1.2:
* @00=D107400, V3R4, 12/16/2002, NFE: Initial version
* @01=D109442, V3R4, 02/11/2003, NFE: Add DIV-based WLayer support
* @02=D112993, V3R4, 06/18/2003, NFE: Add check for Mozilla browser
* @03=D113660, V3R4, 06/27/2003, NFE: Fix HTTPS issue
*******************************************************************************/

/**
 * This static class provides a method for creating concrete WLayers.
 * All browser detection is handled here and the appropriate concrete ,
 * browser-specific class will be instantiated.
 */

/**
 * Static Constructor
 */
if ( !self.WLayerFactory )
{
    self.WLayerFactory = new WLayerFactoryImpl();
}

function WLayerFactoryImpl()
{
    // private methods
    this.init               = WLayerFactory_init;

    // public methods
    this.createWLayer       = WLayerFactory_createWLayer;
    
    // initialize factory
    this.init();
}

/**
 * init - Initialize factory
 */
function WLayerFactory_init()
{
}

/**
 * Create instance of WLayer appropriate for current client/environment.
 * This method will also place a reference to the returned WLayer object in
 * WLayerManager which may be retrieved via the WLayerManager.getWLayerById
 * method.
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
 *        to fix bleeding of HTMLSelectElements through absolutely
 *        positioned HTMLElements in Internet Explorer. If using a secure
 *        server, this URL must be specified at the risk of experiencing
 *        "Secure/Non-Secure" warnings issued by the browser. The URL must
 *        be secure and from the same domain as the containing window/frame.
 *
 * @note Associated HTMLElements will not actually be created/rendered in DOM
 *       until the WLayer.render() method is called.
 *
 * @return New instance of WLayer
 */
function WLayerFactory_createWLayer( id, parentWindow, scrollable, sizeToContent, allowTransparency, secureURL ) // @03C1
{
    var layer = null;

    // create appropriate instance of WLayer based on browser type
    if ( WClient.isBrowserInternetExplorer() )
    {
        layer = new WIEDivLayer( id, parentWindow, scrollable, sizeToContent, allowTransparency, secureURL ); // @03C1
    }
    else if ( WClient.isBrowserNetscape() )
    {
        layer = new WNSDivLayer( id, parentWindow, scrollable, sizeToContent, allowTransparency );
    }
    // @02A4
    else if ( WClient.isBrowserMozilla() )
    {
        layer = new WNSDivLayer( id, parentWindow, scrollable, sizeToContent, allowTransparency );
    }
    else
    {
        layer = new WDivLayer( id, parentWindow, scrollable, sizeToContent, allowTransparency );
    }
    // add layer to manager
    WLayerManager.addWLayer( layer );
    
    return layer;
}
