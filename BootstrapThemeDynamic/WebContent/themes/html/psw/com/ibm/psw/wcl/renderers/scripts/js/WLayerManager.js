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
* @00=D107400, V3R4, 12/16/2002, NFE: Initial version
* @01=D109442, V3R4, 02/11/2003, NFE: Add DIV-based WLayer support
*******************************************************************************/

/**
 * This static class manages a collection of WLayers and is designed for
 * internal tracking of WLayers.
 */

/**
 * Static Constructor
 */
if ( !self.WLayerManager )
{
    self.WLayerManager = new WLayerManagerImpl();
}
function WLayerManagerImpl()
{
    // private variables
    this.layers = new Object();

    // public methods
    this.addWLayer      = WLayerManager_addWLayer;
    this.removeWLayer   = WLayerManager_removeWLayer;
    this.getWLayerByID  = WLayerManger_getWLayerByID;
}

/**
 * Add WLayer
 *
 * @param wLayer The WLayer object to add
 *
 * @return The previous WLayer associated with wLayer's id, or null if none 
 */
function WLayerManager_addWLayer( wLayer )
{
    var oldLayer = null;

    if ( wLayer != null )
    {
        oldLayer = this.layers[ wLayer.getID() ];
        this.layers[ wLayer.getID() ] = wLayer;
    }
    return oldLayer;
}

/**
 * Remove WLayer
 *
 * @param wLayer The WLayer object to remove
 *
 * @return The removed WLayer associated with wLayer's id, or null if none 
 */
function WLayerManager_removeWLayer( wLayer )
{
    var oldLayer = null;

    if ( wLayer != null )
    {
        oldLayer = this.layers[ wLayer.getID() ];
        this.layers[ wLayer.getID() ] = null;
    }
    return oldLayer;
}

/**
 * Get WLayer by ID
 *
 * @param id The unique ID of a WLayer
 *
 * @return The WLayer associated with id, or null if none
 */
function WLayerManger_getWLayerByID( id )
{
    return this.layers[ id ];
}
