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
* @00=WCL, V3R4, 01/24/2003, NFE: Initial version
* @01=D109151, V3R4, 02/05/2003, NFE: Add BIDI support for sliding portfolio
* @02=D109279, V3R4, 02/07/2003, NFE: Fix sliding animation
*******************************************************************************/


/**
 * Singleton instance of WccPortfolioSupportManager, used to manage a series
 * of WccPortfolioSupport objects
 */
if ( !self.WccPortfolioSupportManager )
{
    self.WccPortfolioSupportManager = new Array();
}
 
 
/**
 * WccPortfolioSupport Constructor
 *
 * @param id A unique identifier for this object
 * @param console A reference to window containing console frameset
 * @param container A reference to the FRAME containing WccCanvas and WccPortfolio
 * @param canvas A reference to the WccCanvas IFRAME HTMLElement
 * @param portfolio A reference to the WccPortfolio IFRAME HTMLElement
 * @param minVisibleWidth The minimum visible width of the WccPortfolio. Optional.
 * @param speed The speed at which WccPortfolio will slide in and out. A number
 *              in set [1..10]. Optional.
 * @param orientation The page orientation for BIDI purposes. A String in set
 *                  ['LTR','RTL']. Optional.
 * @param initOut Whether or not portfolio should be initialized to start in the
 *                out position.
 */
function WccPortfolioSupport( id, console, container, canvas, portfolio, minVisibleWidth, speed, orientation, initOut )
{
    // private members
    this.id             = id;
    this.console        = console;
    this.container      = container;
    this.canvas         = canvas;
    this.portfolio      = portfolio;
    this.minVisibleWidth= ( minVisibleWidth ? minVisibleWidth : 0 );
    this.speed          = ( speed ? speed : 6 );
    this.slideAmount    = parseInt( Math.max( 1, this.speed ) );
    this.slideDelay     = 5;//10 * ( 10 - this.slideAmount ) + 1;  // @02
    this.orientation    = ( orientation && orientation.toUpperCase() == "RTL" ? "RTL" : "LTR" );
    this.initOut        = ( initOut ? initOut : false );
    this.isSlidingOut   = false;
    this.isSlidingIn    = false;
    this.isOut          = false;
    this.isIn           = false;
    this.timer          = null;
    this.containerWidth = 0;

    // public methods
    this.slideOut               = WccPortfolioSupport_slideOut;
    this.slideIn                = WccPortfolioSupport_slideIn;
    this.toggleSlide            = WccPortfolioSupport_toggleSlide;

    // private methods
    this.sizeToContainer           = WccPortfolioSupport_sizeToContainer;
    this.getTotalFixedHeight    = WccPortfolioSupport_getTotalFixedHeight;
    this.getContainerWidth      = WccPortfolioSupport_getContainerWidth;
    this.getContainerHeight     = WccPortfolioSupport_getContainerHeight;
    this.init                   = WccPortfolioSupport_init;
    this.destroy                = WccPortfolioSupport_destroy;
    this.setListeners           = WccPortfolioSupport_setListeners;

    this.init();
}

/**
 * Initialize portfolio support
 */
function WccPortfolioSupport_init()
{
    // store reference in manager
    self.WccPortfolioSupportManager[ this.id ] = this;
    
    var width = parseInt( this.portfolio.style.width );
    this.containerWidth = this.getContainerWidth();
    if ( this.initOut )
    {
        // start portfolio out
        if ( this.orientation == "LTR" )
        {
            this.portfolio.style.left = 0 + "px";
        }
        else
        {
            this.portfolio.style.left = ( this.getContainerWidth() - width ) + "px";
        }
        this.isOut = true;
    }
    else
    {
        // start portfolio in
        if ( this.orientation == "LTR" )
        {
            this.portfolio.style.left = ( this.minVisibleWidth - width ) + "px";
        }
        else
        {
            this.portfolio.style.left = ( this.getContainerWidth() - this.minVisibleWidth ) + "px";
        }
        this.isIn = true;
    }
    
    // push canvas out
    if ( this.orientation == "LTR" )
    {
        this.canvas.style.left = this.minVisibleWidth + "px";
    }
    else
    {
        this.canvas.style.left = 0 + "px";
    }
    
    // size to content
    this.sizeToContainer( this.id, true );
    
    // set resize & destroy listeners
    this.setListeners();
}

/**
 * Destroy portfolio support
 */
function WccPortfolioSupport_destroy( id )
{
    var support = ( id ? WccPortfolioSupportManager[ id ] : this );
    WccPortfolioSupportManager[ support.id ] = null;
}

/**
 * Set event listeners/handlers
 */
function WccPortfolioSupport_setListeners()
{
    this.console.onresize = new Function( "", "WccPortfolioSupport_sizeToContainer( '" + this.id + "', false )" );
    this.console.onunload = new Function( "", "WccPortfolioSupport_destroy( '" + this.id + "' )" );
}

/**
 * Toggle slide of portfolio
 */
function WccPortfolioSupport_toggleSlide()
{
    if ( this.isSlidingOut || this.isOut )
    {
        if ( this.isSlidingOut )
        {
            clearTimeout( this.timer );
            this.timer = null;
        }
        this.slideIn();
    }
    else if ( this.isSlidingIn || this.isIn )
    {
        if ( this.isSlidingIn )
        {
            clearTimeout( this.timer );
            this.timer = null;
        }
        this.slideOut();
    }
}

/**
 * Slide portfolio out, i.e. make it visible
 */
function WccPortfolioSupport_slideOut( id )
{
    var support = ( id ? WccPortfolioSupportManager[ id ] : this );

    var xPos = parseInt( support.portfolio.style.left );
    var yPos = parseInt( support.portfolio.style.top );
    var width = parseInt( support.portfolio.style.width );
    var minXPos = support.getContainerWidth() - width;

    if ( ( support.orientation == "LTR" && xPos < 0 ) ||
         ( support.orientation == "RTL" && xPos > minXPos ) )
    {
        support.isIn = false;
        support.isSlidingIn = false;
        support.isOut = false;
        support.isSlidingOut = true;
        
        var leftPosition = 0;
        if ( support.orientation == "LTR" )
        {
            leftPosition = ( xPos + support.slideAmount < 0 ? xPos + support.slideAmount : 0 );
        }
        else
        {
            leftPosition = ( xPos - support.slideAmount > minXPos ? xPos - support.slideAmount : minXPos );
        }
        support.portfolio.style.left = leftPosition + "px";
        
        if ( support.timer != null )
        {
            clearTimeout( support.timer );
        }
        support.timer = setTimeout( "WccPortfolioSupport_slideOut('" + support.id + "')", support.slideDelay );
    }
    else
    {
        support.isSlidingOut = false;
        support.isOut = true;
    }
}

/**
 * Slide portfolio in, i.e. make it hidden
 */
function WccPortfolioSupport_slideIn( id )
{
    var support = ( id ? WccPortfolioSupportManager[ id ] : this );

    var xPos = parseInt( support.portfolio.style.left );
    var yPos = parseInt( support.portfolio.style.top );
    var width = parseInt( support.portfolio.style.width );
    var containerWidth = support.getContainerWidth();

    if ( ( support.orientation == "LTR" && xPos > ( support.minVisibleWidth - width ) ) ||
         ( support.orientation == "RTL" && xPos < containerWidth ) )
    {
        support.isOut = false;
        support.isSlidingOut = false;
        support.isIn = false;
        support.isSlidingIn = true;
        
        var leftPosition = 0;
        if ( support.orientation == "LTR" )
        {
            leftPosition = ( xPos - support.slideAmount > ( support.minVisibleWidth - width ) ? xPos - support.slideAmount : support.minVisibleWidth - width );
        }
        else
        {
            leftPosition = ( xPos + support.slideAmount < containerWidth ? xPos + support.slideAmount : containerWidth );
        }
        support.portfolio.style.left = leftPosition + "px";
        
        if ( support.timer != null )
        {
            clearTimeout( support.timer );
        }
        support.timer = setTimeout( "WccPortfolioSupport_slideIn('" + support.id + "')", support.slideDelay );
    }
    else
    {
        support.isSlidingIn = false;
        support.isIn = true;
    }
}

/**
 * Size both portfolio and canvas IFRAMEs to size of containing I/FRAME
 */
function WccPortfolioSupport_sizeToContainer( id, isInit )
{
    var support = ( id ? WccPortfolioSupportManager[ id ] : this );
    var containerWidth = support.getContainerWidth();
    var containerHeight = support.getContainerHeight();

    if ( support.canvas && support.canvas.style )
    {
        support.canvas.style.width = ( containerWidth - support.minVisibleWidth ) + 'px';
        support.canvas.style.height = containerHeight + 'px';

        if ( isInit )
        {
            support.canvas.style.visibility = 'visible';
        }
    }
    if ( support.portfolio && support.portfolio.style )
    {
        // adjust portfolio width if orientation is RTL
        if ( support.containerWidth != containerWidth &&
             support.orientation == "RTL" )
        {
            // adjust position
            var difference = containerWidth - support.containerWidth;
            var portfolioXPos = parseInt( support.portfolio.style.left );
            support.portfolio.style.left = ( portfolioXPos + difference ) + "px";
            // store new container width
            support.containerWidth = containerWidth;
        }
        // adjust portfolio height
        support.portfolio.style.height = containerHeight + 'px';
        if ( isInit )
        {
            support.portfolio.style.visibility = 'visible';
        }
    }
}

/**
 * Get width of containing I/FRAME
 */
function WccPortfolioSupport_getContainerWidth()
{
    if ( WClient.isBrowserInternetExplorer() )
    {
        // NOTE: this value must come from frameset document that holds actual
        //       container FRAME in order to get correct values post resize.
        return this.console.document.body.clientWidth;
    }
    else
    {
        return this.container.innerWidth;
    }
}

/**
 * Get height of containing I/FRAME
 */
function WccPortfolioSupport_getContainerHeight()
{
    if ( WClient.isBrowserInternetExplorer() )
    {
        // NOTE: this value must come from frameset document that holds actual
        //       container FRAME in order to get correct values post resize.
        return ( this.console.document.body.clientHeight - this.getTotalFixedHeight() );
    }
    else
    {
        return this.container.innerHeight;
    }
}

/**
 * Get total height of fixed height rows in bounding FRAMESET
 */
function WccPortfolioSupport_getTotalFixedHeight()
{
    var totalHeight = 0;
    var frameSet = document.getElementsByTagName( 'FRAMESET' ).item( 0 );
    var rowValues = frameSet.rows.split( ',' );
    
    for ( var i = 0; i < rowValues.length; i++ )
    {
        if ( rowValues[i].indexOf( '%' ) == -1 )
        {
            var rowHeight = parseInt( rowValues[i] );
            if ( !isNaN( rowHeight ) )
            {
                totalHeight += rowHeight;
            }
        }
    }
    return totalHeight;
}

