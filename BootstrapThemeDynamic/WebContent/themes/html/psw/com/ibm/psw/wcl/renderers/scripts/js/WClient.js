/*********************************************************** {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM                                               
* Tivoli Presentation Services                                   
*                                                    
* (C) Copyright IBM Corp. 2000,2003 All Rights Reserved.                            
*                                                               
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
************************************************************ {COPYRIGHT-END} ***
* Change Activity on 6/23/03 version 1.5.1.1:
* @00=D107400, V3R4, 12/16/2002, NFE: Initial version
* @01=D107787, V3R4, 01/06/2003, NFE: Req 167 WMarquee
* @02=D108616, V3R4, 01/24/2003, NFE: Add animated sliding-portfolio feature
* @03=D113426, V3R4, 04/30/2003, NFE: Rewrite
* @04=D112993, V3R4, 06/18/2003, NFE: Rework check for Mozilla browser
*******************************************************************************/

/**
 * Static delcaration of WClient class.
 */
if ( !self.WClient )
{
    self.WClient = new WClientImpl();  // @02
}

function WClientImpl()  // @02
{
    /**************************************************************************
     * Private Members
     *************************************************************************/
    // user agent
    this.userAgent  = navigator.userAgent.toLowerCase();

    // browser vendors
    this.aol        = ( this.userAgent.indexOf( "aol" ) != -1 );
    this.opera      = ( this.userAgent.indexOf( "opera" ) != -1 );
    this.webtv      = ( this.userAgent.indexOf( "webtv" ) != -1 );

    this.ie         = ( this.userAgent.indexOf( "msie" ) != -1 );
    this.moz        = ( !this.ie &&
                        this.userAgent.indexOf( "mozilla" ) != -1 );
    this.nav        = ( this.moz &&
                        this.userAgent.indexOf( "netscape" ) != -1 );
                        // NOTE: for backwards compatability, allowing unbranded Mozilla browser
                        // to evaluate as Netscape Navigator browser
    // @04D5
    //                  ( this.moz &&
    //                   !this.opera &&
    //                   !this.webtv &&
    //                   this.userAgent.indexOf( "spoofer" ) == -1 &&
    //                   this.userAgent.indexOf( "compatible" ) == -1 ) );

    // minor browser version
    //this.minor      = parseFloat( navigator.appVersion );
    this.minor      = navigator.appVersion;

    if ( this.ie )
    {
        var marker1 = this.userAgent.indexOf( "msie " ) + 5;
        var marker2 = this.userAgent.indexOf( ";", marker1 );
        //this.minor = parseFloat( this.userAgent.substring( marker1, marker2 ) );
        this.minor = this.userAgent.substring( marker1, marker2 );
    }
    else if ( this.nav &&
              navigator.vendor &&
              navigator.vendor.indexOf( "Netscape" ) != -1 )
    {
        //this.minor = parseFloat( navigator.vendorSub );
        this.minor = navigator.vendorSub;
    }
    else if ( this.moz )
    {
        var rvString = "; rv:";
        var rvIndex = this.userAgent.indexOf( rvString );
        if ( rvIndex != -1 )
        {
            var rvLength = rvString.length;
            rvString = this.userAgent.substring( rvIndex + rvLength );
            rvLength = rvString.indexOf( ")" );
            this.mozMinor = rvString.substring( 0, rvLength );
            this.mozMajor = parseInt( this.minor );

            // NOTE: Manually set browser version to match Netscape
            // versions since we know Netscape 6.x is based on Mozilla
            // 0.94 and Netscape 7.x is based on Mozilla 1.0.2. This
            // is not a best practice but will suffice for now.
            this.minor = ( this.mozMajor < 1 ? "6.x" : "7.x" );
        }
        else
        {
            var mozString = "mozilla/";
            var moz = this.userAgent.indexOf( mozString );
            var len = mozString.length;
            //this.minor = parseFloat( this.userAgent.substring( moz+len, moz+len+3 ) );
            this.minor = this.userAgent.substring( moz+len, moz+len+3 );
        }
    }
    // major browser version
    this.major      = parseInt( this.minor );

    // operating systems
    this.aix        = ( this.userAgent.indexOf( "sinix" ) != -1 );
    this.bsd        = ( this.userAgent.indexOf( "bsd" ) != -1 );
    this.dec        = ( this.userAgent.indexOf( "dec" ) != -1 ||
                        this.userAgent.indexOf( "osf1" ) != -1 ||
                        this.userAgent.indexOf( "dec_alpha" ) != -1 ||
                        this.userAgent.indexOf( "alphaserver" ) != -1 ||
                        this.userAgent.indexOf( "ultrix" ) != -1 ||
                        this.userAgent.indexOf( "alphastation" ) != -1 );
    this.freebsd    = ( this.userAgent.indexOf( "freebsd" ) != -1 );
    this.hpux       = ( this.userAgent.indexOf( "hp-ux" ) != -1 );
    this.irix       = ( this.userAgent.indexOf( "irix" ) != -1 );
    this.linus      = ( this.userAgent.indexOf( "inux" ) != -1 );
    this.mac        = ( this.userAgent.indexOf( "mac" ) != -1 );
    this.mpras      = ( this.userAgent.indexOf( "ncr" ) != -1 );
    this.os2        = ( this.userAgent.indexOf( "os/2" ) != -1 ||
                        this.userAgent.indexOf( "ibm-webexplorer" ) != -1 );
    this.reliant    = ( this.userAgent.indexOf( "reliantunix" ) != -1 );
    this.sco        = ( this.userAgent.indexOf( "sco" ) != -1 ||
                        this.userAgent.indexOf( "unix_sv" ) != -1 );
    this.sinix      = ( this.userAgent.indexOf( "sinix" ) != -1 );
    this.sun        = ( this.userAgent.indexOf( "sunos" ) != -1 );
    this.unixware   = ( this.userAgent.indexOf( "unix_system_v" ) != -1 );
    this.unix       = ( this.userAgent.indexOf( "x11" ) != -1 ||
                        this.aix || this.linux ||
                        this.bsd || this.sun ||
                        this.irix || this.hpux ||
                        this.sco || this.unixware ||
                        this.mpras || this.reliant ||
                        this.dec || this.sinix ||
                        this.freebsd );
    this.win32      = ( this.userAgent.indexOf( "win" ) != -1 ||
                        this.userAgent.indexOf( "16bit" ) != -1 );

    /**************************************************************************
     * Public Methods
     *************************************************************************/
    // user agent
    this.getUserAgent                   = new Function( "", "return navigator.userAgent" ); // @04

    // browser vendor
    this.isBrowserInternetExplorer      = new Function( "", "return this.ie" );
    this.isBrowserNetscape              = new Function( "", "return this.nav" );
    this.isBrowserMozilla               = new Function( "", "return this.moz" );
    this.isBrowserOpera                 = new Function( "", "return this.opera" );

    // browser version
    this.getBrowserVersion              = new Function( "", "return this.minor" );
    this.isBrowserVersion5Up            = new Function( "", "return ( this.major >= 5 )" );
    this.isBrowserVersion6Up            = new Function( "", "return ( this.major >= 6 )" );
    this.isBrowserVersion7Up            = new Function( "", "return ( this.major >= 7 )" );

    // OS Platform
    this.isOSPlatformWindows            = new Function( "", "return this.win32" );
    this.isOSPlatformMacintosh          = new Function( "", "return this.mac" );
    this.isOSPlatformOS2                = new Function( "", "return this.os2" );
    this.isOSPlatformUnix               = new Function( "", "return this.unix" );
    this.isOSPlatformLinux              = new Function( "", "return this.linux" );
    this.isOSPlatformAIX                = new Function( "", "return this.aix" );
}
