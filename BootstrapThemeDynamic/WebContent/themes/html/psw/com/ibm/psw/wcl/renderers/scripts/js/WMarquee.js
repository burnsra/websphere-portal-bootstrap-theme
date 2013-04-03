/*********************************************************** {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM                                               
* Tivoli Presentation Services                                   
*                                                    
* (C) Copyright IBM Corp. 2000,2003 All Rights Reserved.                            
*                                                               
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
************************************************************ {COPYRIGHT-END} ***
* Change Activity on 12/16/02 version 1.1:
* @00=WCL, V3R4, 01/03/2003, NFE: Initial version
* @01=D109117, V3R4, 02/05/2003, NFE: Removed dependency on content
* @02=D109735, V3R4, 02/28/2003, NFE: Accessibility
* @03=D112994, V3R4, 06/18/2003, NFE: Add check for Mozilla browser
*******************************************************************************/

/**
 * Static delcaration of WMarqueeManager Array, used to hold/manage a series
 * of WMarquees.
 */
if ( !self.WMarqueeManager )
{
    self.WMarqueeManager = new Array();
}

/**
 * Constructor
 *
 * @param id Unique identifier
 * @param width The width of the resulting HTMLElement as a Number 
 *        (default is 400)
 * @param height The height of the resulting HTMLElement as a Number 
 *        (default is height of corner image)
 * @param speed The speed of movement as a Number [1..10] (default is 6)
 * @param direction Component orientation, not direction of movement. Either
 *        LTR or RTL as a String (default is LTR)
 * @param loop Number of times marquee should loop, -1 for infinite (default is -1)
 */
function WMarquee( id, width, height, speed, direction, loop )
{
    // private variables
    this.id             = id;
    this.width          = ( width != null ? width : 400 );
    this.height         = ( height != null ? height : null );
    this.speed          = parseInt( Math.min( 10, ( speed != null ? speed : 6 ) ) );
    this.scrollAmount   = parseInt( Math.max( 1, this.speed ) );
    this.scrollDelay    = 20 * ( 11 - this.scrollAmount );
    this.direction      = ( direction && direction.toUpperCase() == "RTL" ? "RTL" : "LTR" ); // @02
    this.loop           = ( loop != null ? loop : -1 );
    this.element        = null;
    this.timer          = null;
    this.currentLoop    = 0;
    this.isFirstLoop    = true;

    // public methods
    this.start          = WMarquee_start;
    this.stop           = WMarquee_stop;

    // private methods
    this.scroll         = WMarquee_scroll;
    this.getContentWidth=WMarquee_getContentWidth;

    WMarqueeManager[ this.id ] = this;
}

/**
 * Start scrolling
 */
function WMarquee_start()
{
    clearTimeout( this.timer );
    this.timer = setTimeout( 'WMarquee_scroll("' + this.id + '")', this.scrollDelay );
}

/**
 * Stop scrolling
 */
function WMarquee_stop()
{
    clearTimeout( this.timer );
}

/**
 * Perform scroll
 */
function WMarquee_scroll()
{
    var id = ( arguments[0] ? arguments[0] : this.id );
    var element = document.getElementById( id );
    var wMarquee = WMarqueeManager[ id ];
    var doScroll = true;
    var doRecurse = true;

    clearTimeout( wMarquee.timer );

    if ( element )
    {
        var contentWidth = wMarquee.getContentWidth();
        var scrollAmount = wMarquee.scrollAmount;
        scrollAmount *= ( wMarquee.direction == "LTR" ? -1 : 1 );

        var leftPosition = parseInt( element.style.left );

        if ( wMarquee.direction == "LTR" && leftPosition <= ( -1 * contentWidth ) )
        {
            leftPosition = wMarquee.width;// + scrollAmount;
            doScroll = ( wMarquee.loop == -1 || ++wMarquee.currentLoop < wMarquee.loop );
        }
        // @02
        else if ( WClient.isBrowserMozilla() && // @03C1
                  wMarquee.direction == "RTL" &&
                  leftPosition >= 0  )
        {
            leftPosition = ( -1 * ( contentWidth + wMarquee.width ) );
            doScroll = ( wMarquee.loop == -1 || ++wMarquee.currentLoop <= wMarquee.loop );
        }
        else if ( WClient.isBrowserInternetExplorer() &&
                  wMarquee.direction == "RTL" &&
                  ( wMarquee.isFirstLoop || 
                    leftPosition >= contentWidth ) )
        {
            leftPosition = ( -1 * wMarquee.width );
            doScroll = ( wMarquee.loop == -1 || ++wMarquee.currentLoop <= wMarquee.loop );
        }
        else
        {
            leftPosition += scrollAmount;
            doScroll = ( wMarquee.loop != 0 );
        }
        if ( doScroll )
        {
            element.style.left = leftPosition + "px";
        }
        doRecurse = doScroll;
        wMarquee.isFirstLoop = false;
    }
    if ( doRecurse )
    {
        wMarquee.timer = setTimeout( 'WMarquee_scroll("' + id + '")', wMarquee.scrollDelay + 50 );
    }
}

/**
 * Get width of content DIV
 *
 * @return Width of content
 */
function WMarquee_getContentWidth()
{
    var element = document.getElementById( this.id );

    return element.offsetWidth;
}
