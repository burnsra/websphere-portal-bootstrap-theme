/*********************************************************** {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM                                               
* Tivoli Presentation Services                                   
*                                                    
* (C) Copyright IBM Corp. 2000,2003 All Rights Reserved.                            
*                                                               
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
************************************************************ {COPYRIGHT-END} ***
* Change Activity on 3/28/03 version 1.2:
* @00=D107400, V3R4, 12/16/2002, NFE: Initial version
*******************************************************************************/

/**
 * This static class contains all constant variables
 */
 
 /**
  * Static Constructor
  */
WLayerConstants = new WLayerConstants();
function WLayerConstants()
{
    // global properities
    this.DEBUG  = true;

    // Default window properties
    this.WLAYER_DEFAULT_HEIGHT             = 100;
    this.WLAYER_DEFAULT_WIDTH              = 250;

    // Default Netscape properties
    this.WLAYER_NS_MAX_NUM_WRITE_ATTEMPTS     = 20;
    this.WLAYER_NS_TIME_BETWEEN_WRITE_ATTEMPTS= 100; // milliseconds
    this.WLAYER_NS_DEFAULT_VERTICAL_SCROLLBAR_WIDTH    = 14;
    this.WLAYER_NS_DEFAULT_HORIZONTAL_SCROLLBAR_WIDTH    = 14;

    // Default Internet Explorer properties
    this.WLAYER_IE_MAX_NUM_WRITE_ATTEMPTS     = 20;
    this.WLAYER_IE_TIME_BETWEEN_WRITE_ATTEMPTS= 10; // milliseconds
    this.WLAYER_IE_DEFAULT_VERTICAL_SCROLLBAR_WIDTH    = 16;
    this.WLAYER_IE_DEFAULT_HORIZONTAL_SCROLLBAR_WIDTH    = 16;

    // Default error messages
    this.WLAYER_ERROR_UNSUPPORTED_BROWSER         = "Unknown or unsupported browser vendor or version.";
    this.WLAYER_ERROR_UNABLE_TO_WRITE             = "Error while attempting to write to WLayer.";
}
