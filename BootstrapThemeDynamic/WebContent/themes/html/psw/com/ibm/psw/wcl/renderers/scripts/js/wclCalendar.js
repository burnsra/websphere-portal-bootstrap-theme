/*********************************************************** {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM
* Tivoli Presentation Services
*
* (C) Copyright IBM Corp. 2000,2003 All Rights Reserved.
*
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
************************************************************ {COPYRIGHT-END} ***
*******************************************************************************/

///////////////////////////////////////////////////////////////////////////////
// calendar model
///////////////////////////////////////////////////////////////////////////////

/**
 * Calendar model. This uses the Gregorian Calendar that is
 * implemented in javascript, as well as its built-in Date object.
 * monthNames - translated month names separated by "|"
 * dayNames - translated day of the week names separated by "|"
 * firstDay - the first day of the week (1 == Sunday)
 * weekendDays - weekend days separated by "|" (1 == Sunday)
 */
function Calendar( monthNames, dayNames, firstDay, weekendDays ) {
    // private member data
    this.monthNames = monthNames.split("|");
    this.dayNames = dayNames.split("|");
    this.weekendDays = (weekendDays != null && weekendDays.length > 0) ? weekendDays.split("|") : null;
    this.firstDay = parseInt( firstDay );

    // public functions
    // all of these methods must be implemented to create a new
    // calendar model
    this.getMonth = Calendar_getMonth;
    this.getDay = Calendar_getDay;
    this.getMonthsInYear = Calendar_getMonthsInYear;
    this.getDaysInWeek = Calendar_getDaysInWeek;
    this.getDaysInMonth = Calendar_getDaysInMonth;
    this.getFirstDayInWeek = Calendar_getFirstDayInWeek;
    this.getDayInWeek = Calendar_getDayInWeek;
    this.isWeekendDay = Calendar_isWeekendDay;
    this.getToday = Calendar_getToday;
}

/**
 * Returns the name of the month.
 * month - zero-based index of the month
 */
function Calendar_getMonth( month ) {
    return this.monthNames[ month ];
}

/**
 * Returns the name of the day of the week.
 * day - zero-based index of the day of the week
 */
function Calendar_getDay( day ) {
    return this.dayNames[ day ];
}

/**
 * Returns the number of months in a year.
 */
function Calendar_getMonthsInYear() {
   return this.monthNames.length;
}

/**
 * Returns the number of days in a week.
 */
function Calendar_getDaysInWeek() {
   return this.dayNames.length;
}

/**
 * Returns the number of days in a specific month.
 * month - zero-based index of the month
 * year - the year
 */
function Calendar_getDaysInMonth( month, year ) {
    if ( month != null && year != null ) {
        var aDate;
        for ( var i=31; i>=0; i-- ) {
            aDate = new Date( year, month, i );
            if ( i == aDate.getDate() ) {
                return i;
            }
        }
    }
    return 0;
}

/**
 * Returns the first day of the week (1 == Sunday).
 */
function Calendar_getFirstDayInWeek() {
    return this.firstDay;
}

/**
 * Returns the day of the week for a specific date.
 * year - the year of the date
 * month - the zero-based index of the month
 * date - the date
 */
function Calendar_getDayInWeek( year, month, date ) {
    if ( year != null && month != null && date != null ) {
        var aDate = new Date( year, month, date );
        return aDate.getDay();
    }
    return this.firstDay;
}

/**
 * Returns true if the day of the week is a weekend day.
 * day - the day of the week (1 == Sunday)
 */
function Calendar_isWeekendDay( day ) {
    if ( this.weekendDays != null ) {
        for ( var i=0; i<this.weekendDays.length; i++ ) {
            if ( day == this.weekendDays[i] ) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Returns the current date as an array {year, month, date}.
 */
function Calendar_getToday() {
    var aDate = new Date();
    return new Array( aDate.getFullYear(), aDate.getMonth(), aDate.getDate() );
}

///////////////////////////////////////////////////////////////////////////////
// date format
///////////////////////////////////////////////////////////////////////////////

/**
 * DateFormat used to parse strings into dates and format dates into strings.
 * The pattern is resticted to a simple set. The only allowable characters
 * are 'y', 'M', and 'd', and any other characters are considered date
 * separators.
 * cal - calendar model
 * pattern - date format pattern
 * yearStart - the year used to resolve ambiguous 2 digit years
 */
function DateFormat( cal, pattern, yearStart ) {
    // "public" functions
    this.parseDate = DateFormat_parseDate;
    this.formatDate = DateFormat_formatDate;
    // "private" functions
    this.getPaddedValue = DateFormat_getPaddedValue;
    this.setOrder = DateFormat_setOrder;

    // private member data
    this.cal = cal;
    this.yearStart = yearStart;
    this.order = new Array(3);
    this.separator = new Array(2);
    this.sizes = new Array(3);

    // populate arrays above by parsing the pattern. this assumes that
    // the only allowable characters are 'y', 'M', and 'd', and any
    // other characters are considered date separators.
    var year = 0;
    var month = 0;
    var date = 0;
    var sep = 0;
    for ( var i=0; i<pattern.length; i++ ) {
        var c = pattern.charAt(i);
        switch (c) {
        case 'y':
            this.setOrder( 0 );
            year++;
            break;
        case 'M':
            this.setOrder( 1 );
            month++;
            break;
        case 'd':
            this.setOrder( 2 );
            date++;
            break;
        default:
            this.separator[ sep ] = c;
            sep++;
            break;
        }
    }
    this.sizes[0] = year;
    this.sizes[1] = month;
    this.sizes[2] = date;
}

/**
 * Stores the value into the next available slot in the order.
 * val - 0 == year, 1 == month, 2 == date
 */
function DateFormat_setOrder( val ) {
    if ( this.order[0] == null ) {
        this.order[0] = val;
    }
    else if ( this.order[0] != val ) {
        if ( this.order[1] == null ) {
            this.order[1] = val;
        }
        else if ( this.order[1] != val ) {
            if ( this.order[2] == null ) {
                this.order[2] = val;
            }
        }
    }
}

/**
 * Returns the date as an array {year, month, date}. The string must follow
 * the pattern the dateFormat was constructed with. If the string does not
 * follow the pattern, parsing fails and null is returned.
 * sDate - the date as a string
 */
function DateFormat_parseDate( sDate ) {
    if ( sDate != null && sDate.length > 0 ) {
        // find the separators
        var sep0, sep1;
        sep0 = sDate.indexOf( this.separator[0] );
        sep1 = sDate.lastIndexOf( this.separator[1] );

        var aYear = "-1";
        var aMonth = "-1";
        var aDate = "-1";

        // parse out the values as strings
        if ( sep0 > -1 && sep1 > -1 && sep0 != sep1 ) {
            var num0, num1, num2;
            num0 = sDate.substring( 0, sep0 );
            num1 = sDate.substring( sep0+1, sep1 );
            num2 = sDate.substring( sep1+1 );

            // make sure we have digits only
            if ( isNaN(num0) ) { num0 = "-1" }
            if ( isNaN(num1) ) { num1 = "-1" }
            if ( isNaN(num2) ) { num2 = "-1" }

            // use the pattern order to get values
            var aVal = new Array( num0, num1, num2 );
            for ( var i=0; i<this.order.length; i++ ) {
                switch ( this.order[i] ) {
                case 0:
                    aYear = aVal[i];
                    break;
                case 1:
                    aMonth = aVal[i];
                    break;
                case 2:
                    aDate = aVal[i];
                    break;
                }
            }
        }

        // convert the values into ints
        var year = parseInt( aYear, 10 );
        var month = parseInt( aMonth, 10 );
        var date = parseInt( aDate, 10 );

        // make sure values are in range
        if ( year >= 0 && month > 0 && date > 0 ) {
            // note: the ambiguous date handling below is hardcoded to
            // resolve only 2 digit years to maintain consistency with
            // java.text.SimpleDateFormat
            if ( aYear.length == 2 && aYear.length <= this.sizes[0] ) {
                // we have an ambiguous two digit year,
                // so use the century of the start year
                var aYearStart = this.getPaddedValue( ""+this.yearStart, this.sizes[0], false );
                var aCent;
                if ( aYear.length == this.sizes[0] ) {
                    aCent = aYearStart.substring( 0, aYear.length );
                }
                else {
                    aCent = aYearStart.substring( 0, (this.sizes[0]-aYear.length) );
                }
                year = parseInt( (aCent + aYear), 10 );
                if ( year < this.yearStart ) {
                    aCent = "" + (parseInt(aCent, 10)+1);
                    year = parseInt( (aCent + aYear), 10 );
                }
            }

            if ( month > this.cal.getMonthsInYear() ) {
                // adjust the years accordingly
                //year += ( month / this.cal.getMonthsInYear() );
                //month = ( month % this.cal.getMonthsInYear() );

                // we could adjust the months forward with the code
                // above, but then it would be inconsistent with the
                // date validation below. ..
                // set it to the highest month for now
                month = this.cal.getMonthsInYear()-1;
            }
            else {
                // month is zero-based in javascript
                month = month-1;

                if ( date > this.cal.getDaysInMonth( month, year ) ) {
                    // we could try to figure out the number of days forward
                    // to go, but that is too much work for right now since
                    // it could affect months and years...
                    // set it to the latest date for now
                    date = this.cal.getDaysInMonth( month, year );
                }
            }
        }

        if ( year >= 0 && month >= 0 && date > 0 ) {
            // return the date as an array
            var rDate = new Array( year, month, date );
            return rDate;
        }
    }

    return null;
}

/**
 * Returns the date as a string based on the pattern the dateFormat was
 * constructed with.
 * year - the year
 * month - the zero-based index of the month
 * date - the date
 */
function DateFormat_formatDate( year, month, date ) {
    // month is zero-based in javascript
    month = month+1;

    var sYear = this.getPaddedValue( ""+year, this.sizes[0], true );
    var sMonth = this.getPaddedValue( ""+month, this.sizes[1], false );
    var sDate = this.getPaddedValue( ""+date, this.sizes[2], false );
    var sVal = new Array( sYear, sMonth, sDate );

    var fDate = "";
    for ( var i=0; i<this.order.length; i++ ) {
        fDate += sVal[ this.order[i] ];
        if ( i<this.separator.length ) {
            fDate += this.separator[i];
        }
    }

    return fDate;
}

/**
 * Returns the value front padded with zeros if necessary.
 * val - the value
 * size - the number of digits to return
 * trim - whether the value should be trimmed it has more digits than necessary
 */
function DateFormat_getPaddedValue( val, size, trim ) {
    var vlen = val.length;
    var rVal = val;
    if ( vlen < size ) {
        // pad front with zeros
        for ( var i=0; i<size-vlen; i++ ) {
            rVal = "0" + rVal;
        }
    }
    else if ( trim && vlen > size ) {
        // use the trailing digits
        rVal = rVal.substring( rVal.length - size );
    }
    return rVal;
}

///////////////////////////////////////////////////////////////////////////////
// date chooser
///////////////////////////////////////////////////////////////////////////////

/**
 * DateChooser component.
 * id - id of the date chooser
 * textId - the id of the text entry field
 * buttonId - the id of the launcher button
 * isLTR - whether the orientation is left-to-right
 * isReadOnly - whether the chooser is read only
 * tabIndex - tabindex of the text entry field
 * cal - the calendar model
 * df - the date format
 * yearSize - the number of years to display in the dropdown
 * selDate - the selected date (formatted with the date format) or null
 * firstDate - the first selectable date (formatted with the date format) or null
 * lastDate - the last selectable date (formatted with the date format) or null
 * secureURL - URL pointing to content served using HTTPS. This URL will
 *        be used to set the src attribute of a transparent IFRAME that is used
 *        to fix bleeding of HTMLSelectElements through absolutely
 *        positioned HTMLElements in Internet Explorer. If using a secure
 *        server, this URL must be specified at the risk of experiencing
 *        "Secure/Non-Secure" warnings issued by the browser. The URL must
 *        be secure and from the same domain as the containing window/frame.
 */
function WDateChooser( id, textId, buttonId, isLTR, isReadOnly, tabIndex,
                       cal, df, yearSize, selDate, firstDate, lastDate, secureURL ) {
    // functions
    this.buildCalendarBody = WDateChooser_buildCalendarBody;
    this.buildCalendarDiv = WDateChooser_buildCalendarDiv;
    this.updateCalendarView = WDateChooser_updateCalendarView;
    this.updateSelectedDate = WDateChooser_updateSelectedDate;
    this.updateCurrentDate = WDateChooser_updateCurrentDate;
    this.setVisible = WDateChooser_setVisible;
    this.selectDate = WDateChooser_selectDate;
    this.nextMonth = WDateChooser_nextMonth;
    this.prevMonth = WDateChooser_prevMonth;
    this.makeId = WDateChooser_makeId;
    this.getElementById = WDateChooser_getElementById;
    this.setText = WDateChooser_setText;
    this.getText = WDateChooser_getText;
    this.setImage = WDateChooser_setImage;
    this.getImage = WDateChooser_getImage;
    this.setStyle = WDateChooser_setStyle;
    this.getStyle = WDateChooser_getStyle;
    this.applyStyle = WDateChooser_applyStyle;
    this.applyCursorStyle = WDateChooser_applyCursorStyle;
    this.addStyleSheet = WDateChooser_addStyleSheet;

    // member data
    this.id = id;
    this.textId = textId;
    this.buttonId = buttonId;
    this.isLTR = isLTR;
    this.isReadOnly = isReadOnly;
    this.tabIndex = tabIndex;
    this.cal = cal;
    this.df = df;
    this.yearSize = yearSize;
    this.selDate = this.df.parseDate( selDate );
    this.firstDate = this.df.parseDate( firstDate );
    this.lastDate = this.df.parseDate( lastDate );
    this.secureURL = ( secureURL ? secureURL : null );
    this.layer = null;
    this.useLayer = true;
    if ( this.useLayer && this.layer == null ) {
        // try/catch so component will still work without the layer code
        try {
            if ( WLayerFactory != null ) {
                this.layer = WLayerFactory.createWLayer( this.id + "_calLayer", self, false, true, false, this.secureURL );
            }
        }
        catch (e) { }
    }

    // selection mode: 0 = select, dismiss; 1 = select, ok, dismiss
    this.selMode = 1;
    // navigation mode: 0 = dropdowns; 1 = buttons; 2 = dropdowns, buttons
    this.navMode = 2;
    // stores text
    this.text = new Array();
    // stores images
    this.images = new Array();
    // stores styles
    this.styles = new Array();
    // stores styles
    this.styleSheets = new Array();
    // stores elements by id
    this.elementsById = new Array();
}

/**
 * Returns a "unique" id within the html document. The id generated is
 * based on the id of the date chooser which should also be unique within
 * the html document.
 * id - the id to generate
 * element - the element the id is associated with
 */
function WDateChooser_makeId( id, element ) {
    var eid = this.id + "_" + id;
    if ( element != null ) {
        this.elementsById[ eid ] = element;
    }
    return eid;
}

/**
 * Returns the element for the given id.
 * id - the id
 * aDoc - html document that contains the date chooser
 */
function WDateChooser_getElementById( id, aDoc ) {
    /*
    if ( this.layer != null ) {
        if ( id == this.textId || id == this.buttonId ) {
            // these elements are the same document as this script
            return document.getElementById( id );
        }
        else if ( aDoc != null ) {
            return aDoc.getElementById( id );
        }
        else {
            return this.elementsById[ id ];
        }
    }
    */
    if ( aDoc != null ) {
        return aDoc.getElementById( id );
    }
    else {
        return document.getElementById( id );
    }
}

/**
 * Sets an image for the component.
 * imgKey - identifier for the image
 * imgObj - a javascript WImage object
 */
function WDateChooser_setImage( imgKey, imgObj ) {
    this.images[ imgKey ] = imgObj;
}

/**
 * Returns a javascript WImage object.
 * imgKey - identifier for the image
 */
function WDateChooser_getImage( imgKey ) {
    return this.images[ imgKey ];
}

/**
 * Sets translated text for the component.
 * textKey - identifier for the text
 * textObj - the translated text
 */
function WDateChooser_setText( textKey, textObj ) {
    this.text[ textKey ] = textObj;
}

/**
 * Returns the translated text for the component.
 * textKey - identifier for the text
 */
function WDateChooser_getText( textKey ) {
    var rText = this.text[ textKey ];
    if ( rText == null ) {
        rText = textKey;
    }
    return rText;
}

/**
 * Sets a customized style for the component.
 * styleKey - identifier for the style
 * styleObj - a javascript WStyle object or the style value as a string
 */
function WDateChooser_setStyle( styleKey, styleObj ) {
    this.styles[ styleKey ] = styleObj;
}

/**
 * Returns the customized style as a javascript WStyle object or a string.
 * styleKey - identifier for the style
 */
function WDateChooser_getStyle( styleKey ) {
    return this.styles[ styleKey ];
}

/**
 * Applies a style to a specific html tag. This method looks up the
 * javascript WStyle object for the styleKey. If a WStyle object is
 * available, we have a custom style and it is applied using the
 * "style" attribute. Otherwise, the default css class name associated
 * with the styleKey is applied using the "className" attribute.
 * styleKey - identifier for the style
 * tag - html tag that will have the styles
 */
function WDateChooser_applyStyle( styleKey, tag ) {
    if ( tag != null && styleKey != null ) {
        var style = this.getStyle( styleKey );
        if ( style != null ) {
            if ( style.applyStyle != null ) {
                style.applyStyle( tag, this.isLTR );
            }
            else {
                tag.className = null;
                tag.style.cssText = style;
                tag.setAttribute( "style", style );
            }
        }
        else {
            // keep these classNames with the real values!
            switch ( styleKey ) {
            case "BORDER":
                style = "dc10";
                break;
            case "CAL_BORDER":
                style = "dc11";
                break;
            case "DAY_NAME":
                style = "dc1";
                break;
            case "DAY":
                style = "dc2";
                break;
            case "DAY_LINK":
                style = "dc3";
                break;
            case "WEEKEND_DAY":
                style = "dc5";
                break;
            case "SELECTED_DAY":
                style = "dc6";
                break;
            case "SELECTED_DAY_LINK":
                style = "dc4";
                break;
            case "EMPTY_DAY":
                style = "dc7";
                break;
            case "CAL_TOP":
                style = "dc8";
                break;
            case "CAL_BOT":
                style = "dc9";
                break;
            case "CAL_TEXT":
                style = "wclDateChooserText";
                break;
            case "BUTTON":
                style = "b1";
                break;
            case "BUTTON_OVER":
                style = "b2";
                break;
            case "COMBO_BOX":
                style = "cb1";
                break;
            }

            if ( style != null ) {
                tag.className = style;
                tag.style.cssText = null;
                tag.setAttribute( "style", null );
            }
        }
    }
}

/**
 * Applies a cursor style to an html tag.
 * pointer - the css cursor style
 * tag - html tag that will have the cursor
 */
function WDateChooser_applyCursorStyle( pointer, tag ) {
    // set the cursor style
    var style = ( document.all ) ? tag.style.cssText : tag.getAttribute( "style" );
    if ( tag.style.cursor || style != null ) {
        var cursor = ( pointer ) ? "pointer" : "default";
        if ( tag.style.cssText == null ) {
            tag.style.cursor = cursor;
        }
        else {
            style += ";cursor:" + cursor + ";";
            tag.style.cssText = style;
            tag.setAttribute( "style", style );
        }
    }
}

/**
 * Adds a style sheet to the component. The style sheet will be
 * added to the layer, if layers are used.
 * css - url of the style sheet
 */
function WDateChooser_addStyleSheet( css ) {
    this.styleSheets[ this.styleSheets.length ] = css;
}

/**
 * Sets whether the date chooser should be shown.
 * visible - whether to show the component
 */
function WDateChooser_setVisible( visible )
{
    // render layer
    if ( !this.layer.isRendered() )
    {
        // create the calendar DIV
        var calendarDiv = this.buildCalendarDiv();
        this.layer.setHTMLElement( calendarDiv );
        this.layer.setVisible( false );
        this.layer.render();
    }

    // if layer is not already visible, make it so
    if ( visible  && !this.layer.isVisible() )
    {
        // import current date from text field
        var dateInput = this.getElementById( this.textId );
        var aDate = this.df.parseDate( dateInput.value );

        // make sure we have a date
        if ( aDate == null || aDate[0] == null || aDate[1] == null || aDate[2] == null )
        {
            // use today as the date, but don't set it as selected
            aDate = this.cal.getToday();
            this.updateSelectedDate( null, null, null );
        }
        else
        {
            // select the date from the text field
            this.updateSelectedDate( aDate[0], aDate[1], aDate[2] );
        }

        // update current date in calendar view
        this.updateCalendarView( aDate[0], aDate[1], aDate[2]  );

        var posX = WUtilities.getLeft( dateInput, true );
        var posY = WUtilities.getTop( dateInput, true ) + WUtilities.getHeight( dateInput );

        if ( !this.isLTR )
        {
            posX += WUtilities.getWidth( dateInput );
            //var divWidth = WUtilities.getWidth( this.layer.getContainer() );
            var divWidth = this.layer.getDimension().getWidth();
            if ( WClient.isBrowserMozilla() )
            {
                //divWidth -= 7;
            }
            posX -= divWidth;
        }

        // set layer position
        this.layer.setPosition( new WclPosition( posX, posY, 100 ) );
        // update layer to re-size to content
        this.layer.update();
        // set layer visible
        this.layer.setVisible( true );

        // focus on first element in calendar view
        if ( this.navMode == 0 )
        {
            document.getElementById( this.makeId("comboMonth") ).focus();
        }
        else
        {
            document.getElementById( this.makeId("prevMonth") ).focus();
        }
    }
    // otherwise, hide it
    else
    {
        this.layer.setVisible( false );
    }
}

/**
 * Updates the calendar view.
 * year - the year
 * month - the zero-based index of the month
 * date - the date
 * aDoc - html document that contains the date chooser
 */
function WDateChooser_updateCalendarView( year, month, date, aDoc ) {

    var selectedYearIndex = -1;
    if ( year == null ) {
        var eSel = this.getElementById( this.makeId("comboYear"), aDoc );
        if ( eSel != null ) {
            year = eSel.value;
        }
        else {
            year = parseInt( this.getElementById( this.makeId("hideYear") ).value );
        }
    }
    if ( month == null ) {
        var eSel = this.getElementById( this.makeId("comboMonth"), aDoc );
        if ( eSel != null ) {
            month = eSel.selectedIndex;
        }
        else {
            month = parseInt( this.getElementById( this.makeId("hideMonth") ).value );
        }
    }

    // update the current date
    this.updateCurrentDate( year, month, date );

    if ( this.navMode == 1 ) {
        // update the text fields
        var eText = this.getElementById( this.makeId("textYear"), aDoc );
        if ( eText != null ) eText.innerHTML = year;
        eText = this.getElementById( this.makeId("textMonth"), aDoc );
        if ( eText != null ) eText.innerHTML = this.cal.getMonth( month );
    }
    else {
        // update the available years in the drop down
        var idx = 0;
        var size = this.yearSize;
        var startYear;
        if ( size%2 != 0 ) {
            startYear = year - ((size-1)/2);
        }
        else {
            startYear = year - (size/2);
        }
        var eYear = this.getElementById( this.makeId("comboYear"), aDoc );
        for ( var i=0; i<size; i++ ) {
            if ( eYear.options[i] == null ) {
                if ( aDoc != null ) {
                    var opt = aDoc.createElement( "OPTION" );
                    opt.appendChild( aDoc.createTextNode( "" ) );
                    eYear.appendChild( opt );
                }
                else {
                    var opt = document.createElement( "OPTION" );
                    opt.appendChild( document.createTextNode( "" ) );
                    eYear.appendChild( opt );
                }
            }
            eYear.options[i].value = startYear + i;
            eYear.options[i].childNodes[0].data = startYear + i;
            idx++;
        }

        // update the selected year in the drop down
        for ( var i=0; i<eYear.options.length; i++)
        {
            if ( eYear.options[i].value == year )
            {
                selectedYearIndex = i;
                if ( WClient.isBrowserMozilla() )
                {
                    eYear.options[i].defaultSelected = true;
                    eYear.selectedIndex = i-1; // mozilla needs a little encouragement
                }
                eYear.selectedIndex = i;
                break;
            }
        }
        // update the selected month in the drop down
        var eMonth = this.getElementById( this.makeId("comboMonth"), aDoc );
        if ( WClient.isBrowserMozilla() )
        {
            eMonth.options[ month ].defaultSelected = true;
        }
        eMonth.selectedIndex = month;
    }

    // rebuild the calendar view
    var calTable, calTableBody;
    calTable = this.getElementById( this.makeId("calTable"), aDoc );
    //calTableBody = this.getElementById( this.makeId("calTableBody"), aDoc );
    calTableBody = calTable.childNodes[0];
    calTable.removeChild( calTableBody );
    calTableBody = this.buildCalendarBody( year, month, date, aDoc )
    calTable.appendChild( calTableBody );

    if ( this.layer != null )
    {
        this.layer.update();
    }
    if ( selectedYearIndex != -1 )
    {
        // set it again in IE to fix initialization bug
        if ( WClient.isBrowserInternetExplorer() )
        {
            var eYear = document.getElementById( this.makeId("comboYear") );
            eYear.selectedIndex = selectedYearIndex;
        }
    }
}

/**
 * Updates the current date in the date chooser. The current date keeps
 * track of the date to show in the calendar view.
 * year - the year
 * month - the zero-based index of the month
 * date - the date
 */
function WDateChooser_updateCurrentDate( year, month, date ) {
    // update the hidden fields
    var hide = this.getElementById( this.makeId("hideYear") );
    hide.value = year;
    hide = this.getElementById( this.makeId("hideMonth") );
    hide.value = month;
    if ( date != null ) {
        hide = this.getElementById( this.makeId("hideDate") );
        hide.value = date;
    }
}

/**
 * Updates the selected date and the current date in the date chooser.
 * The selected date keeps track of the date that will be set in the
 * text entry field. The current date keeps track of the date to show
 * in the calendar view.
 * year - the year
 * month - the zero-based index of the month
 * date - the date
 */
function WDateChooser_updateSelectedDate( year, month, date ) {
    // update the selected date
    if ( date != null ) {
        if ( this.selDate == null ) {
            this.selDate = new Array( 3 );
        }
        this.selDate[0] = year;
        this.selDate[1] = month;
        this.selDate[2] = date;
    }
    else {
        this.selDate = null;
    }

    // update the hidden fields
    if ( this.selMode == 1 ) {
        var hide = this.getElementById( this.makeId("smYear") );
        hide.value = year;
        hide = this.getElementById( this.makeId("smMonth") );
        hide.value = month;
        hide = this.getElementById( this.makeId("smDate") );
        hide.value = date;
    }

    this.updateCurrentDate( year, month, date );
}

/**
 * Builds the calendar view starting from the div tag.
 * year - the year
 * month - the zero-based index of the month
 * date - the date
 */
function WDateChooser_buildCalendarDiv( year, month, date ) {
    var div = this.getElementById( this.makeId("calDiv") );
    if ( div == null ) {
        // create the main div
        div = document.createElement( "DIV" );
        if ( this.layer != null ) {
        }
        else {
            document.body.appendChild( div );
            div.style.visibility = "hidden";
            div.style.position = "absolute";
        }
        div.dir = ( this.isLTR ) ? "LTR" : "RTL";
        div.id = this.makeId("calDiv", div);

        // Allow for dynamic sizing in Netscape and IE
        if ( !WClient.isBrowserMozilla() || WClient.isBrowserNetscape() )
        {
            div.style.width = "0px";
        }

        // this hidden field stores the date chooser's id
        var hideid = document.createElement( "INPUT" );
        hideid.type = "hidden";
        div.appendChild( hideid );
        hideid.value = this.id;

        // primary table layout has 3 rows:
        // 1 = controls, 2 = calendar, 3 = buttons
        var table = document.createElement( "TABLE" );
        div.appendChild( table );
        this.applyStyle( "BORDER", table );
        table.id = this.makeId("calDivTable", table);
        table.border = 0;
        table.cellSpacing = 0;
        table.cellPadding = 0;
        table.dir = ( this.isLTR ) ? "LTR" : "RTL";

        var tb = document.createElement( "TBODY" );
        table.appendChild( tb );

        // primary table row 1 is for the controls
        var tr = document.createElement( "TR" );
        tb.appendChild( tr );

        var td;
        var tdCount = 0;

        td = document.createElement( "TD" );
        tr.appendChild( td );
        tdCount++;
        this.applyStyle( "CAL_TOP", td );

        // header table layout for the controls has 2 cells:
        // 1 = navigation, 2 = close
        var htable = document.createElement( "TABLE" );
        td.appendChild( htable );
        htable.border = 0;
        htable.cellSpacing = 0;
        htable.cellPadding = 0;
        htable.width = "100%";
        htable.dir = ( this.isLTR ) ? "LTR" : "RTL";

        var htb = document.createElement( "TBODY" );
        htable.appendChild( htb );

        var htr = document.createElement( "TR" );
        htb.appendChild( htr );

        // header table cell 1 is for the navigation controls
        var htd = document.createElement( "TD" );
        htd.style.whiteSpace = "nowrap";
        htd.noWrap = true;
        htr.appendChild( htd );

        var hnbsp;

        if ( this.navMode > 0 ) {
            // these links navigate to next/previous month
            var link = document.createElement( "A" );
            htd.appendChild( link );
            link.id = this.makeId("prevMonth", link);
            link.href = "javascript:void(0);";
            link.onclick = WDateChooser_prevMonthHandler;
            if ( this.tabIndex != 0 ) {
                link.tabIndex = this.tabIndex != 0
            }

            var limg = this.getImage( "PREVIOUS_MONTH" );
            var eimg = limg.createElement( this.isLTR );
            eimg.id = this.makeId("prevMonthImg", eimg);
            eimg.onmouseover = WDateChooser_imageOverHandler;
            eimg.onmouseout = WDateChooser_imageOutHandler;
            eimg.style.display = "inline";
            link.appendChild( eimg );
            link.title = limg.alt;

            hnbsp = document.createElement( "SPAN" );
            htd.appendChild( hnbsp );
            hnbsp.innerHTML = "&nbsp;";

            link = document.createElement( "A" );
            htd.appendChild( link );
            link.id = this.makeId("nextMonth", link);
            if ( this.tabIndex != 0 ) {
                link.tabIndex = this.tabIndex != 0
            }
            link.href = "javascript:void(0);";
            link.onclick = WDateChooser_nextMonthHandler;

            limg = this.getImage( "NEXT_MONTH" );
            eimg = limg.createElement( this.isLTR );
            eimg.id = this.makeId("nextMonthImg", eimg);
            eimg.onmouseover = WDateChooser_imageOverHandler;
            eimg.onmouseout = WDateChooser_imageOutHandler;
            eimg.style.display = "inline";
            link.appendChild( eimg );
            link.title = limg.alt;

            hnbsp = document.createElement( "SPAN" );
            htd.appendChild( hnbsp );
            hnbsp.innerHTML = "&nbsp;";
        }

        if ( this.navMode == 1 ) {
            // these spans display the current month and year
            var text = document.createElement( "SPAN" );
            htd.appendChild( text );
            text.id = this.makeId("textMonth", text);
            this.applyStyle( "CAL_TEXT", text );

            text = document.createElement( "SPAN" );
            htd.appendChild( text );
            text.innerHTML = "&nbsp;";

            text = document.createElement( "SPAN" );
            htd.appendChild( text );
            text.id = this.makeId("textYear", text);
            this.applyStyle( "CAL_TEXT", text );

            text = document.createElement( "SPAN" );
            htd.appendChild( text );
            text.innerHTML = "&nbsp;";
        }
        else {
            // these comboboxes display the current month and year
            var sel = document.createElement( "SELECT" );
            htd.appendChild( sel );
            sel.id = this.makeId("comboMonth", sel);
            this.applyStyle( "COMBO_BOX", sel );
            if ( this.tabIndex != 0 ) {
                sel.tabIndex = this.tabIndex != 0
            }
            sel.onchange = WDateChooser_updateCalendarViewHandler;
            var monthSize = this.cal.getMonthsInYear();
            for ( var i=0; i<monthSize; i++ ) {
                var opt = document.createElement( "OPTION" );
                sel.appendChild( opt );
                opt.appendChild( document.createTextNode( this.cal.getMonth(i) ) );
            }

            hnbsp = document.createElement( "SPAN" );
            htd.appendChild( hnbsp );
            hnbsp.innerHTML = "&nbsp;";

            sel = document.createElement( "SELECT" );
            htd.appendChild( sel );
            sel.id = this.makeId("comboYear", sel);
            this.applyStyle( "COMBO_BOX", sel );
            if ( this.tabIndex != 0 ) {
                sel.tabIndex = this.tabIndex != 0
            }
            sel.onchange = WDateChooser_updateCalendarViewHandler;

            hnbsp = document.createElement( "SPAN" );
            htd.appendChild( hnbsp );
            hnbsp.innerHTML = "&nbsp;";
        }

        // these hidden fields store the currently selected date
        var hidden = document.createElement( "INPUT" );
        hidden.type = "hidden";
        td.appendChild( hidden );
        hidden.id = this.makeId("hideYear", hidden);

        hidden = document.createElement( "INPUT" );
        hidden.type = "hidden";
        td.appendChild( hidden );
        hidden.id = this.makeId("hideMonth", hidden);

        hidden = document.createElement( "INPUT" );
        hidden.type = "hidden";
        td.appendChild( hidden );
        hidden.id = this.makeId("hideDate", hidden);

        if ( this.selMode == 1 ) {
            // we have additional hidden fields in this selection mode:
            // the set above is used by the navigation controls
            // the set below is used by the selection and ok button
            var hidden = document.createElement( "INPUT" );
            hidden.type = "hidden";
            td.appendChild( hidden );
            hidden.id = this.makeId("smYear", hidden);

            hidden = document.createElement( "INPUT" );
            hidden.type = "hidden";
            td.appendChild( hidden );
            hidden.id = this.makeId("smMonth", hidden);

            hidden = document.createElement( "INPUT" );
            hidden.type = "hidden";
            td.appendChild( hidden );
            hidden.id = this.makeId("smDate", hidden);
        }

        var showClose = ( this.selMode == 0 );
        if ( showClose ) {
            // header table cell 2 is for the close button
            var ctd = document.createElement( "TD" );
            htr.appendChild( ctd );
            ctd.align =  ( this.isLTR ) ? "right" : "left";
            ctd.vAlign = "top";

            var clink = document.createElement( "A" );
            ctd.appendChild( clink );
            if ( this.tabIndex != 0 ) {
                clink.tabIndex = this.tabIndex != 0
            }
            clink.href = "javascript:void(0);";
            clink.onclick = WDateChooser_closeHandler;

            var cimg = this.getImage( "CLOSE" );
            cimg.style.display = "inline";
            clink.appendChild( cimg.createElement( this.isLTR ) );
            clink.title = cimg.alt;
        }

        // primary table row 2 is for the calendar days
        tr = document.createElement( "TR" );
        tb.appendChild( tr );

        td = document.createElement( "TD" );
        tr.appendChild( td );
        this.applyStyle( "CAL_BOT", td );
        if ( showClose || tdCount > 1 ) {
            td.colSpan = tdCount;
        }

        // calendar table layout for the calendar days
        var ctable = document.createElement( "TABLE" );
        td.appendChild( ctable );
        this.applyStyle( "CAL_BORDER", ctable );
        ctable.id = this.makeId("calTable", ctable);
        ctable.border = 0;
        ctable.cellSpacing = 0;
        ctable.cellPadding = 0;
        ctable.width = "100%";
        ctable.dir = ( this.isLTR ) ? "LTR" : "RTL";

        var ctb = document.createElement( "TBODY" );
        ctable.appendChild( ctb );
        ctb.id = this.makeId("calTableBody", ctb);

        if ( this.selMode == 1 ) {
            // primary table row 3 is for the buttons
            tr = document.createElement( "TR" );
            tb.appendChild( tr );

            td = document.createElement( "TD" );
            tr.appendChild( td );
            this.applyStyle( "CAL_BOT", td );
            if ( showClose || tdCount > 1 ) {
                td.colSpan = tdCount;
            }

            var button = document.createElement( "INPUT" );
            button.type = "button";
            td.appendChild( button );
            this.applyStyle( "BUTTON", button );
            if ( document.all ) {
                button.style.height = "100%";
            }
            if ( this.tabIndex != 0 ) {
                button.tabIndex = this.tabIndex != 0
            }
            button.value = this.getText( "OK" );
            button.onmouseover = WDateChooser_buttonOverHandler;
            button.onmouseout = WDateChooser_buttonOutHandler;
            button.onclick = WDateChooser_buttonOkHandler;

            var text = document.createElement( "SPAN" );
            td.appendChild( text );
            text.innerHTML = "&nbsp;";

            button = document.createElement( "INPUT" );
            button.type = "button";
            td.appendChild( button );
            this.applyStyle( "BUTTON", button );
            if ( document.all ) {
                button.style.height = "100%";
            }
            if ( this.tabIndex != 0 ) {
                button.tabIndex = this.tabIndex != 0
            }
            button.value = this.getText( "CANCEL" );
            button.onmouseover = WDateChooser_buttonOverHandler;
            button.onmouseout = WDateChooser_buttonOutHandler;
            button.onclick = WDateChooser_buttonCancelHandler;
        }
    }
    return div;
}

/**
 * Rebuilds the calendar view starting from the html tbody tag.
 * year - the year
 * month - the zero-based index of the month
 * date - the date
 * aDoc - html document that contains the date chooser
 */
function WDateChooser_buildCalendarBody( year, month, date, aDoc ) {
    if ( aDoc == null ) {
        aDoc = document;
    }

    var tb = aDoc.createElement( "TBODY" );
    tb.id = this.makeId("calTableBody", tb);

    // figure out what day this month starts on
    var fDow = this.cal.getDayInWeek( year, month, 1 );
    // day of the week that should be rendered first
    // should this be settable on date chooser?
    var mDow = this.cal.getFirstDayInWeek();

    var tr, td, link, idx, fidx;
    // add days of week
    tr = aDoc.createElement( "TR" );
    tb.appendChild( tr );
    var daySize = this.cal.getDaysInWeek();
    //var tdw = "" + (100 / daySize) + "%";
    for ( var i=0; i<daySize; i++ ) {
        idx = (i+mDow) % daySize;
        if ( idx == fDow ) {
            fidx = i;
        }
        td = aDoc.createElement( "TH" );
        tr.appendChild( td );
        //td.width = tdw;
        if ( !this.useLayer && document.all ) {
            // only need this if the doctype is set in IE
            td.width = "26";
            td.height = "20";
        }
        else {
            td.width = "28";
            td.height = "24";
        }
        this.applyStyle( "DAY_NAME", td );
        td.align = "center";
        td.vAlign = "bottom";
        td.innerHTML = this.cal.getDay( idx );
    }

    // add the days
    var num = 1;
    var tot = this.cal.getDaysInMonth( month, year );
    var daySize = this.cal.getDaysInWeek();
    while ( num<=tot ) {
        tr = aDoc.createElement( "TR" );
        tb.appendChild( tr );
        for ( var i=0; i<daySize; i++ ) {
            td = aDoc.createElement( "TD" );
            tr.appendChild( td );
            //td.width = tdw;
            if ( !this.useLayer && document.all ) {
                // only need this if the doctype is set in IE
                td.width = "26";
                td.height = "20";
            }
            else {
                td.width = "28";
                td.height = "24";
            }
            td.align = ( this.isLTR ) ? "left" : "right";
            td.vAlign = "bottom";
            if ( (num == 1 && i<fidx) || num>tot ) {
                td.innerHTML = "&nbsp;";
                this.applyStyle( "EMPTY_DAY", td );
            }
            else {
                var yearOK = true;
                var monthOK = true;
                var dateOK = true;

                // compare with the first selectable date
                var hasFirst = this.firstDate != null;
                if ( hasFirst ) {
                    yearOK = ( this.firstDate[0] <= year );
                    if ( yearOK ) {
                        monthOK = !(this.firstDate[0] == year && month < this.firstDate[1]);
                        if ( monthOK ) {
                            dateOK = !(this.firstDate[0] == year && this.firstDate[1] == month && num < this.firstDate[2]);
                        }
                    }
                }

                // compare with the last selectable date
                var hasLast = this.lastDate != null;
                if ( hasLast && yearOK && monthOK && dateOK ) {
                    yearOK = ( year <= this.lastDate[0] );
                    if ( yearOK ) {
                        monthOK = !(this.lastDate[0] == year && month > this.lastDate[1]);
                        if ( monthOK ) {
                            dateOK = !(this.lastDate[0] == year && this.lastDate[1] == month && num > this.lastDate[2]);
                        }
                    }
                }

                var isSelectable = yearOK && monthOK && dateOK;
                var isSelectedDay = ( this.selDate != null && year == this.selDate[0] && month == this.selDate[1] && num == this.selDate[2] );
                if ( isSelectable && ( !this.isReadOnly || isSelectedDay ) ) {
                   link = aDoc.createElement( "A" );
                   td.appendChild( link );
                   link.href = "javascript:void(0);";
                   if ( isSelectedDay ) {
                       this.applyStyle( "SELECTED_DAY_LINK", link );
                   }
                   else {
                       this.applyStyle( "DAY_LINK", link );
                   }
                   link.innerHTML = num;
                   if ( this.tabIndex != 0 ) {
                       link.tabIndex = this.tabIndex != 0
                   }
                   td.onclick = WDateChooser_selectDateHandler;
                   if ( this.selMode == 1 ) {
                       // set an id
                       td.id = this.makeId( year + "_" + month + "_" + num, td );
                       if ( document.all ) {
                           td.ondblclick = WDateChooser_selectDateHandler;
                       }
                       else {
                           td.addEventListener( "dblclick", WDateChooser_selectDateHandler, false );
                       }
                   }
                }
                else {
                   td.innerHTML = num;
                }

                // set the date style
                idx = (i+mDow) % daySize;
                if ( isSelectable && isSelectedDay ) {
                    this.applyStyle( "SELECTED_DAY", td );
                }
                else if ( this.cal.isWeekendDay(idx) ) {
                    this.applyStyle( "WEEKEND_DAY", td );
                }
                else {
                    this.applyStyle( "DAY", td );
                }

                // set the cursor style
                var isPointer = ( isSelectable && ( !this.isReadOnly || isSelectedDay ) );
                this.applyCursorStyle( isPointer, td );
                num++;
            }
        }
    }

    return tb;
}

/**
 * Selects a date.
 * date - the date to select
 * dismiss - whether to hide the date chooser
 * aDoc - html document that contains the date chooser
 */
function WDateChooser_selectDate( date, dismiss, aDoc ) {
    if ( date != null ) {
        var year = parseInt( this.getElementById( this.makeId("hideYear") ).value );
        var month = parseInt( this.getElementById( this.makeId("hideMonth") ).value );

        if ( dismiss ) {
            this.updateSelectedDate( year, month, date );

            // update the date text field
            var dateInput = this.getElementById( this.textId );
            dateInput.value = this.df.formatDate( year, month, date );
            this.setVisible( false );

            // set focus on the date button
            var dateButton = this.getElementById( this.buttonId );
            dateButton.focus();
        }
        else {
            // update the styles of the last date selected
            var selDate = parseInt( this.getElementById( this.makeId("hideDate") ).value );
            var dateid, datetd;
            dateid = this.makeId( year + "_" + month + "_" + selDate );
            datetd = this.getElementById( dateid, aDoc );
            if ( datetd != null ) {
                var day = this.cal.getDayInWeek( year, month, selDate );
                if ( this.cal.isWeekendDay( day ) ) {
                    this.applyStyle( "WEEKEND_DAY", datetd );
                }
                else {
                    this.applyStyle( "DAY", datetd );
                }
                this.applyStyle( "DAY_LINK", datetd.childNodes[0] );
                // update the cursor style
                this.applyCursorStyle( true, datetd );
            }

            // update the styles of the date selected
            dateid = this.makeId( year + "_" + month + "_" + date );
            datetd = this.getElementById( dateid, aDoc );
            if ( datetd != null ) {
                this.applyStyle( "SELECTED_DAY", datetd );
                this.applyStyle( "SELECTED_DAY_LINK", datetd.childNodes[0] );
                // update the cursor style
                this.applyCursorStyle( true, datetd );
            }

            this.updateSelectedDate( year, month, date );
        }
    }
}

/**
 * Advances the calendar view to the next month.
 * aDoc - html document that contains the date chooser
 */
function WDateChooser_nextMonth( aDoc ) {
    var year = parseInt( this.getElementById( this.makeId("hideYear") ).value );
    var month = parseInt( this.getElementById( this.makeId("hideMonth") ).value );

    month++;
    if ( month >= this.cal.getMonthsInYear() ) {
        month = 0;
        year++;
    }

    this.updateCalendarView( year, month, null, aDoc );
}

/**
 * Rewinds the calendar view to the previous month.
 * aDoc - html document that contains the date chooser
 */
function WDateChooser_prevMonth( aDoc ) {
    var year = parseInt( this.getElementById( this.makeId("hideYear") ).value );
    var month = parseInt( this.getElementById( this.makeId("hideMonth") ).value );

    month--;
    if ( month < 0 ) {
        month = this.cal.getMonthsInYear()-1;
        year--;
    }

    this.updateCalendarView( year, month, null, aDoc );
}

/**
 * Finds the date chooser component that generated the event.
 * event - the event object
 */
function WDateChooser_getDateChooser( event ) {
    var dc = null;
    var tag = getEventTarget( event );
    while ( tag != null && tag.tagName != "DIV" ) {
        tag = tag.parentNode;
        if ( tag != null && tag.tagName == "DIV" ) {
            dc = eval( tag.childNodes[0].value );
            break;
        }
    }
    return dc;
}

/**
 * Event handler for the previous button. Updates the calendar view.
 */
function WDateChooser_prevMonthHandler( event ) {
    var dc = WDateChooser_getDateChooser( event );
    if ( dc != null ) {
        dc.prevMonth( getEventDocument( event ) );
    }
}

/**
 * Event handler for the next button. Updates the calendar view.
 */
function WDateChooser_nextMonthHandler( event ) {
    var dc = WDateChooser_getDateChooser( event );
    if ( dc != null ) {
        dc.nextMonth( getEventDocument( event ) );
    }
}

/**
 * Event handler for the dropdown boxes. Updates the calendar view based
 * on the new selection.
 */
function WDateChooser_updateCalendarViewHandler( event ) {
    var dc = WDateChooser_getDateChooser( event );
    if ( dc != null ) {
        dc.updateCalendarView( null, null, null, getEventDocument( event ) );
    }
}

/**
 * Event handler for onclick for date table cells. Selects the date.
 */
function WDateChooser_selectDateHandler( event ) {
    var dc = WDateChooser_getDateChooser( event );
    if ( dc != null ) {
        // determine if the date chooser should be dismissed
        var dismiss = false;
        var aEvent = getEvent( event );
        if ( aEvent != null ) {
            var dblclick = aEvent.type == "dblclick";
            dismiss = ( dc.selMode == 0 || (dc.selMode == 1 && dblclick) );
        }

        // the selected date is the text of the hyperlink
        var date = null;
        var tag = getEventTarget( event );
        if ( tag != null ) {
            if ( tag.tagName == "TD" ) {
                date = tag.childNodes[0].childNodes[0].data;
            }
            else if ( tag.tagName == "A" ) {
                date = tag.childNodes[0].data;
            }
            else if ( tag.data != null ) {
                date = tag.data;
            }
        }

        // select the date on the component
        dc.selectDate( date, dismiss, getEventDocument( event ) );
    }
}

/**
 * Event handler for the close button. Hides the date chooser.
 */
function WDateChooser_closeHandler( event ) {
    var dc = WDateChooser_getDateChooser( event );
    if ( dc != null ) {
        dc.setVisible( false );

        // set focus on the date button
        var dateButton = dc.getElementById( dc.buttonId );
        dateButton.focus();
    }
}

/**
 * Event handler for the ok button. Updates the text field and hides the
 * date chooser.
 */
function WDateChooser_buttonOkHandler( event ) {
    WDateChooser_buttonOutHandler( event );

    var dc = WDateChooser_getDateChooser( event );
    if ( dc != null ) {
        var year = parseInt( dc.getElementById( dc.makeId("smYear") ).value );
        var month = parseInt( dc.getElementById( dc.makeId("smMonth") ).value );
        var date = parseInt( dc.getElementById( dc.makeId("smDate") ).value );

        if ( !isNaN(year) && !isNaN(month) && !isNaN(date) ) {
            // update the date text field
            var dateInput = dc.getElementById( dc.textId );
            dateInput.value = dc.df.formatDate( year, month, date );
        }

        // hide the calendar view
        dc.setVisible( false );

        // set focus on the date button
        var dateButton = dc.getElementById( dc.buttonId );
        dateButton.focus();
    }
}

/**
 * Event handler for cancel button. Hides the date chooser.
 */
function WDateChooser_buttonCancelHandler( event ) {
    WDateChooser_buttonOutHandler( event );
    WDateChooser_closeHandler( event );
}

/**
 * Event handler for mouseover for buttons. Changes the style.
 */
function WDateChooser_buttonOverHandler( event ) {
    var dc = WDateChooser_getDateChooser( event );
    if ( dc != null ) {
        var tag = getEventTarget( event );
        if ( tag != null ) {
            dc.applyStyle( "BUTTON_OVER", tag );
            if ( document.all ) {
                tag.style.height = "100%";
            }
        }
    }
}

/**
 * Event handler for mouseout for buttons. Changes the style.
 */
function WDateChooser_buttonOutHandler( event ) {
    var dc = WDateChooser_getDateChooser( event );
    if ( dc != null ) {
        var tag = getEventTarget( event );
        if ( tag != null ) {
            dc.applyStyle( "BUTTON", tag );
            if ( document.all ) {
                tag.style.height = "100%";
            }
        }
    }
}

/**
 * Event handler for mouseover for images. Changes the style.
 */
function WDateChooser_imageOverHandler( event ) {
    var dc = WDateChooser_getDateChooser( event );
    if ( dc != null ) {
        var tag = getEventTarget( event );
        if ( tag != null ) {
            if ( tag.id == dc.makeId( "prevMonthImg" ) ) {
                var himg = dc.getImage( "PREVIOUS_MONTH_OVER" );
                tag.src = himg.getSrc( dc.isLTR );
            }
            else if ( tag.id == dc.makeId( "nextMonthImg" ) ) {
                var himg = dc.getImage( "NEXT_MONTH_OVER" );
                tag.src = himg.getSrc( dc.isLTR );
            }
        }
    }
}

/**
 * Event handler for mouseout for images. Changes the style.
 */
function WDateChooser_imageOutHandler( event ) {
    var dc = WDateChooser_getDateChooser( event );
    if ( dc != null ) {
        var tag = getEventTarget( event );
        if ( tag != null ) {
            if ( tag.id == dc.makeId( "prevMonthImg" ) ) {
                var himg = dc.getImage( "PREVIOUS_MONTH" );
                tag.src = himg.getSrc( dc.isLTR );
            }
            else if ( tag.id == dc.makeId( "nextMonthImg" ) ) {
                var himg = dc.getImage( "NEXT_MONTH" );
                tag.src = himg.getSrc( dc.isLTR );
            }
        }
    }
}

