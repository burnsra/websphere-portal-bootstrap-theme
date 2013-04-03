
/**
 * Enhanced version of WCL DateChooser component.
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
                       cal, df, yearSize, selDate, firstDate, lastDate, secureURL ) {  // @10C1
    // functions
    this.buildCalendarBody = WDateChooser_buildCalendarBody;
    this.buildCalendarDiv = WDateChooser_buildCalendarDiv;
    this.updateCalendarView = WDateChooser_updateCalendarView;
    this.updateSelectedDate = WDateChooser_updateSelectedDate;
    this.updateCurrentDate = WDateChooser_updateCurrentDate;
    this.setVisible = WDateChooser_setVisible;
    this.hilightSelection = WDateChooser_hilightSelection;
    this.selectMonth = WDateChooser_selectMonth;
    this.selectWeek = WDateChooser_selectWeek;
    this.selectDate = WDateChooser_selectDate;
    this.nextMonth = WDateChooser_nextMonth;
    this.prevMonth = WDateChooser_prevMonth;
    this.getSelectedDate = WDateChooser_getSelectedDate;
    this.getSelectedDateRange = WDateChooser_getSelectedDateRange;
    this.convertCalendarArrayToText = WDateChooser_convertCalendarArrayToText;
    this.convertTextToCalendarArray = WDateChooser_convertTextToCalendarArray;
    this.makeId = WDateChooser_makeId;
    this.getElementById = WDateChooser_getElementById;
    this.setText = WDateChooser_setText;
    this.getText = WDateChooser_getText;
    this.setImage = WDateChooser_setImage;
    this.getImage = WDateChooser_getImage;
    this.setStyle = WDateChooser_setStyle;
    this.getStyle = WDateChooser_getStyle;
    this.setStyleClass = WDateChooser_setStyleClass;
    this.getStyleClass = WDateChooser_getStyleClass;
    this.applyStyle = WDateChooser_applyStyle;
    this.applyCursorStyle = WDateChooser_applyCursorStyle;
    this.addStyleSheet = WDateChooser_addStyleSheet;
    this.isWeekendDay = WDateChooser_isWeekendDay;
    this.initDefaultStyles = WDateChooser_initDefaultStyles;

    // member data
    this.id = id;
    this.textId = textId;
    this.buttonId = buttonId;
    this.isLTR = isLTR;
    this.isReadOnly = isReadOnly;
    this.tabIndex = tabIndex; //@05A
    this.cal = cal;
    this.df = df;
    this.yearSize = yearSize;
    if (selDate != null && selDate.length != 0) {
        this.selDate = cal.clone();
        this.df.parse( selDate, this.selDate);
    }
    else {
        this.selDate = null;
    }
    if (firstDate != null && firstDate.length != 0) {
        this.firstDate = cal.clone();
        this.df.parse( firstDate, this.firstDate );
    }
    else {
        this.firstDate = null;
    }
    if (lastDate != null && lastDate.length != 0) {
        this.lastDate = cal.clone();
        this.df.parse( lastDate, this.lastDate );
    }
    else {
        this.lastDate = null;
    }

    //169197f_2 begins
    if (secureURL == "null") //169197f_2
        secureURL = null;  //169197f_2   
    //169197f_2 ends
    this.secureURL = ( secureURL ? secureURL : null ); // @10A1
    this.layer = null;
    this.useLayer = true;
    if ( this.useLayer && this.layer == null ) {
        // try/catch so component will still work without the layer code
        try {
            if ( WLayerFactory != null ) {
                this.layer = WLayerFactory.createWLayer( this.id + "_calLayer", self, false, true, false, this.secureURL ); // @10C1

            }
        }
        catch (e) { }
    }

    // selection mode:
    //      0 = select, dismiss
    //      1 = select, ok, dismiss
    //      2 = no ok/cancel buttons, dismiss with single click
    //      3 = embedded mode(no ok/cancel buttons, no dismiss)
    this.selMode = 1;
    // navigation mode: 0 = dropdowns; 1 = buttons; 2 = dropdowns, buttons
    this.navMode = 2;
    // month navigation mode: 0 = no selection change; 1 = update selection 
    this.monthNavMode = 0;
    // stores text
    this.text = new Array();
    // stores images
    this.images = new Array();
    // stores styles
    this.styles = new Array();
    // stores style classes
    this.styleClasses = new Array();
    // stores styles
    this.styleSheets = new Array();
    // stores elements by id
    this.elementsById = new Array();
    // today
    this.today = cal.clone();
    this.today.date = new Date();
    // selectable
    this.selectable = false;
    // weekday labels
    this.weekdayLabels = null;
    // date format pattern string for year/month label
    this.yearmonthFormatPattern = "MMMM yyyy";
    // date format pattern string for year combo
    this.yearFormatPattern = "yyyy";
    // date format pattern string for month combo
    this.monthFormatPattern = "MMMM";
    // date format pattern string for month/date label
    this.monthDateFormatPattern = "MMMM d";
    // selection type for selectable WDateChooser
    //     if (selection<0) select MONTH
    //     if (selection==0) select DATE
    //     if (selection>0) select Nth WEEK
    this.selection = 0;
    // separator for selectable WDateChooser
    this.separator = "|";
    // onchange handler
    this.onchange = null;
    // original document's onclick handler
    this.onclickBackup = null;
    // original document's onkeyup handler
    this.onkeyupBackup = null;
    // strings for accessibility
    this.accessibleMessages = null;
    // client side input date format validation
    this.clientFormatValidation = true;
    // original height of element where the calender control layer will be rendered
    this.elementHeight = NaN;
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
    /* @04
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
 * Returns the customized style class as a string.
 * styleKey - identifier for the style
 */
function WDateChooser_getStyleClass( styleKey ) {
    return this.styleClasses[ styleKey ];
}

/**
 * Sets a customized style class for the component.
 * styleKey - identifier for the style
 * styleObj - a string that will be set as tag.className
 */
function WDateChooser_setStyleClass( styleKey, styleObj ) {
    this.styleClasses[ styleKey ] = styleObj;
}

/**
 * Updated for LWP2.5 to try and find a styleClass first, if present
 * will be used over style string or default style class.
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
    
    	var sClass = this.getStyleClass( styleKey );
    	if (sClass != null)
    	{
            tag.className = sClass;
            tag.style.cssText = null;
            tag.setAttribute( "style", null );
    	}
    	else
    	{
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
	            case "BORDER": //@07A
	                style = "dc10";     //@08C1
	                break;
	            case "CAL_BORDER": //@07A
	                style = "dc11";     //@08C1
	                break;
	            case "DAY_NAME":
	                style = "dc1";     //@08C1
	                break;
	            case "DAY":
	                style = "dc2";     //@08C1
	                break;
	            case "DAY_LINK":
	                style = "dc3";    //@08C1
	                break;
	            case "WEEKEND_DAY":
	                style = "dc5";     //@08C1
	                break;
	            case "SELECTED_DAY":
	                style = "dc6";     //@08C1
	                break;
	            case "SELECTED_DAY_LINK": //@07A
	                style = "dc4";     //@08C1
	                break;
	            case "EMPTY_DAY":
	                style = "dc7";     //@08C1
	                break;
	            case "CAL_TOP":
	                style = "dc8";     //@08C1
	                break;
	            case "SELECTED_CAL_TOP":
	                style = "dc8";     //@08C1
	                break;
	            case "CAL_BOT":
	                style = "dc9";    //@08C1
	                break;
	            case "MONTH_RADIO":
	                style = "dcs1";    //@08C1
	                break;
	            case "WEEK_RADIO_ON":
	                style = "dcs3";    //@08C1
	                break;
	            case "WEEK_RADIO_OFF":
	                style = "dcs4";    //@08C1
	                break;
	            case "CAL_TEXT":
	                style = "wclDateChooserText";
	                break;
	            case "BUTTON":
	                style = "b1";      //@08C1
	                break;
	            case "BUTTON_OVER":
	                style = "b2";      //@08C1
	                break;
	            case "COMBO_BOX":
	                style = "cb1";     //@08C1
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
 * Returns true if the day of the week is a weekend day.
 * day - the day of the week
 */
function WDateChooser_isWeekendDay( day ) {
    var weekends = null;
    if (this.weekendDays != null && this.weekendDays.length > 0)
        weekends =  this.weekendDays.split("|");

    if ( weekends != null ) {
        for ( var i = 0; i < weekends.length; i++ ) {
            if ( day == weekends[i] ) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Sets whether the date chooser should be shown.
 * visible - whether to show the component
 */
function WDateChooser_setVisible( visible )
{
    if (WClient.isBrowserInternetExplorer()) {
        // MS IE fails to render layer if document is not yet loaded
        if ( document.readyState != "complete" ) {
            // try 100 ms later 
            setTimeout(this.id + ".setVisible(" + visible + ")", 100);
            return;
        }
    }

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
        var c = this.cal.clone();
        var result = null;
        if (dateInput) {
            var cals = this.convertTextToCalendarArray( dateInput.value );
            if (cals != null) {
                if (cals.length == 1) {
                    // date text is in text field
                    c = cals[0];
                    result = c.date;
                }
                else if (cals.length == 2) {
                    // date range text is in text field
                    var workCal = cals[0].clone();
                    var maxWeekdays = this.df.dateFormatSymbols.shortWeekdays.length;
                    for (var i = 0; workCal.date <= cals[1].date && i <= maxWeekdays; i++) {
                        workCal.add("DATE", 1);
                    }
                    if (i == maxWeekdays && cals[0].get("DAY_OF_WEEK") == this.cal.firstDayOfWeek) {
                        this.selection = 1;    // week is selected
                        c = cals[0].clone();
                    }
                    else {
                        this.selection = -1;    // month is selected;
                        c = cals[0].clone();
                        // if the start date is in the last month, adjust it
                        if ( c.get("DATE") != 1) {
                            c.set("DATE", 1);
                            c.add("MONTH", 1);
                        }
                    }
                    result = c.date; 
                }
            }
        }

        // make sure we have a date
        if ( result == null || isNaN(result) )
        {
            // use today as the date, but don't set it as selected
            c = this.today.clone();
            this.updateSelectedDate( null );
            this.updateCurrentDate( null );
        }
        else
        {
            // select the date from the text field
            this.updateSelectedDate( c );
            this.updateCurrentDate( c );
        }

        // update current date in calendar view
        this.updateCalendarView( c );

        // hilight the current selection
        this.hilightSelection( undefined, true );

        // determine element where to put the layer
        var element = null;
        if ( dateInput != null && dateInput.type == "text" ) {
            element = dateInput;
        }
        if ( element == null ) {
            element = this.getElementById( this.id + "_div" );
        }
        if ( element == null ) {
            element = this.getElementById( this.buttonId );
        }

        if ( isNaN ( this.elementHeight ) ) {
            this.elementHeight = WUtilities.getHeight( element );
        }

        var posX = WUtilities.getLeft( element, true );
        var posY = WUtilities.getTop( element, true ) + this.elementHeight;

        //var divWidth = WUtilities.getWidth( this.layer.getContainer() );
        var divWidth = this.layer.getDimension().getWidth();

        if ( !this.isLTR )
        {
            posX += WUtilities.getWidth( element );
            //177670_f1 if ( WClient.isBrowserMozilla() ) // @09C1
            //177670_f1 {
            //177670_f1     //divWidth -= 7;
            //177670_f1 }
            posX -= divWidth;
            //Now it is right aligned to the element
        }

        // adjustment by alignment
        var alignOffset = 0;
        var offsetWidth = WUtilities.getOffsetWidth(element, document);
        if ( element.parentNode.align == "center" && offsetWidth != NaN ) {
            alignOffset = offsetWidth / 2;
            //if ( !this.isLTR ) {
                posX = WUtilities.getLeft( element.parentNode, true );
            //} else {
            //    posX -= WUtilities.getLeft( element, false );
            //}
            posX += alignOffset;
            posX -= (divWidth/2);
        }

        // set layer position
        this.layer.setPosition( new WclPosition( posX, posY, 100 ) );

        // update layer to re-size to content
        this.layer.update();
        // set layer visible
        this.layer.setVisible( true );

        if ( this.selMode == 3 ) {
            // if embedded, adjust div size to fit the calendar control
            var dim = this.layer.getDimension();
            element.style.height = dim.getHeight() + this.elementHeight + 10 + "px";
            element.style.width = dim.getWidth() + 10 + "px";
        }

        // focus on first element in calendar view
        if ( this.navMode == 0 )
        {
            document.getElementById( this.makeId("comboMonth") ).focus();
        }
        else
        {
            document.getElementById( this.makeId("prevMonth") ).focus();
        }

        if ( this.selMode != 3 ) {
            // Temporarily override document event handler to handle
            // ESC key and click to close the calendar
            this.onclickBackup = document.onclick;
            this.onkeyupBackup = document.onkeyup;
            document.onclick = WDateChooser_documentClickHandler;
            document.onkeyup = WDateChooser_documentKeyUpHandler;
        }
    }
    // otherwise, hide it
    else
    {
        this.layer.setVisible( false );

        if ( this.selMode != 3 ) {
            // restore the original document onclick and onkeyup handler
            document.onclick = this.onclickBackup;
            document.onkeyup = this.onkeyupBackup;
        }
    }
}

/**
 * close all WDateChoosers when they are visible.
 */
function WDateChooser_closeAll( parent ) {

    if (parent == null) {
        parent = document.body;
    }
    if (typeof parent == "string") {
        // if param is string, convert it to element obj
        parent = document.getElementById(parent);
    }
    if (parent.childNodes == undefined)
        return;
    if ( parent.tagName == "INPUT" && parent.className == "wDateChooserIdClass" ) {
        var dc = eval( parent.value );
        if ( dc ) {
            // if popup DateChooser found, close it.
            if (dc.selMode != 3) {
                dc.setVisible( false );
            }
            return;
        }
    }

    if (parent.childNodes.length != 0) {
        for (var i = 0; i < parent.childNodes.length; i++) {
            WDateChooser_closeAll(parent.childNodes[i]);
        }
    }
}


/**
 * Updates the calendar view.
 * c - the calendar object
 * aDoc - html document that contains the date chooser
 */
function WDateChooser_updateCalendarView( c, aDoc ) {

    var era = null;
    var year = null;
    var month = null;
    var date = null;

    if (c != null) {
        era = c.get("ERA");
        year = c.get("YEAR");
        month = c.get("MONTH");
        date = c.get("DAY_OF_MONTH");
    }

    var selectedYearIndex = -1;

    if ( era == null ) {
        var eSel = this.getElementById( this.makeId("comboEra"), aDoc );
        if ( eSel != null ) {
            era = eSel.value;
        }
        else {
            era = parseInt( this.getElementById( this.makeId("hideEra") ).value );
        }
    }
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

    if (c == null) {
        c = this.cal.clone();
        WDateChooser_initCalendarDate( c );
        if (era)
            c.set("ERA", era);
        if (year)
            c.set("YEAR", year);
        if (month)
            c.set("MONTH", month);
        if (date)
            c.set("DATE", date);
    }
    // update the current date
    this.updateCurrentDate( c );

    if ( this.navMode == 1 ) {
        // update the text fields
        var eText = this.getElementById( this.makeId("textYearMonth"), aDoc );
        if (eText != null) {
            var ymCal = this.cal.clone();
            WDateChooser_initCalendarDate( ymCal );
            ymCal.set("ERA", era);
            ymCal.set("YEAR", year);
            ymCal.set("MONTH", month);
            var oldPattern = this.df.pattern;
            this.df.pattern = this.yearmonthFormatPattern;
            eText.innerHTML = this.df.format(ymCal);
            this.df.pattern = oldPattern;
        }
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
                if ( WClient.isBrowserMozilla() ) // @09C1 
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
        if ( WClient.isBrowserMozilla() ) // @09C1
        {
            eMonth.options[ month ].defaultSelected = true;
        }
        eMonth.selectedIndex = month;
    }

    // update the month button & style
    var selDates = this.getSelectedDateRange();
    if ( this.selectable && selDates != null && selDates.length > 0) {

        // get the selected era, year, and month
        var cal = selDates[0].clone();
        if (cal.get("DATE") != 1) {
            cal.set("DATE", 1);
            cal.add("MONTH", 1);
        }
        var selEra = cal.get("ERA");
        var selYear = cal.get("YEAR");
        var selMonth = cal.get("MONTH");

        // set month button icon
        var id = this.makeId("selectMonth");
        var img = this.getElementById( id, aDoc );
        if ( img != null ) {
            // get year-month string
            var oldPattern = this.df.pattern;
            this.df.pattern = this.yearmonthFormatPattern;
            var ymStr = this.df.format( c );
            this.df.pattern = oldPattern;
            // update image
            var a = img.parentNode;
            a.removeChild(img);
            var limg;
            var title
            if ( this.selection < 0 && selEra == era && selYear == year && selMonth == month) {
                limg = this.getImage( "ROW_SELECTED" );
                title = this.accessibleMessages["str.alt.month.selected"] + ymStr;
            }
            else {
                limg = this.getImage( "SELECT_ROW" );
                title = this.accessibleMessages["str.alt.month.selection"].replace( "{0}", ymStr );
            }
            img = limg.createElement( this.isLTR );
            img.id = id;
            img.style.display = "inline";
            img.title = img.alt = title;
            a.appendChild(img);
        }

        // set month button style
        var id = this.makeId("calTop");
        var table = this.getElementById( id, aDoc );
        if ( this.selection < 0 && selEra == era && selYear == year && selMonth == month)
            this.applyStyle( "SELECTED_CAL_TOP", table );
        else 
            this.applyStyle ("CAL_TOP", table);
    }

    // rebuild the calendar view
    var calTable, calTableBody;
    calTable = this.getElementById( this.makeId("calTable"), aDoc );
    //calTableBody = this.getElementById( this.makeId("calTableBody"), aDoc );
    calTableBody = calTable.childNodes[0];
    calTable.removeChild( calTableBody );
    calTableBody = this.buildCalendarBody( c, aDoc )
    calTable.appendChild( calTableBody );

    if ( this.layer != null )
    {
        if ( this.selMode == 3 && this.layer.isVisible() )
        {
            // if embedded mode and the calendar is already reandered,
            // adjust the size of calendar.
            var orgDim = this.layer.getDimension();
            // update
            this.layer.update();
            // adjust
            var newDim = this.layer.getDimension();
            var div = this.getElementById( this.id + "_div" );
            if ( div != null ) {
                div.style.height = WUtilities.getHeight( div ) + newDim.getHeight() - orgDim.getHeight() + "px";
                div.style.width = WUtilities.getWidth( div ) + newDim.getWidth() - orgDim.getWidth() + "px";
            }
        }
        else
        {
            this.layer.update(); // @02
        }
    }
    if ( selectedYearIndex != -1 )
    {
        // @03 - set it again in IE to fix initialization bug
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
 * c - calendar object
 */
function WDateChooser_updateCurrentDate( c ) {

    var era = null;
    var year = null;
    var month = null;
    var date = null;

    if ( c != null ) {
        era = c.get("ERA");
        year = c.get("YEAR");
        month = c.get("MONTH");
        date = c.get("DAY_OF_MONTH");

        WDateChooser_initCalendarDate( this.cal );
        this.cal.set("ERA", era);
        this.cal.set("YEAR", year);
        this.cal.set("MONTH", month);
        this.cal.set("DATE", date);
    }

    // update the hidden fields
    var hide = this.getElementById( this.makeId("hideEra") );
    hide.value = era;
    var hide = this.getElementById( this.makeId("hideYear") );
    hide.value = year;
    hide = this.getElementById( this.makeId("hideMonth") );
    hide.value = month;
    hide = this.getElementById( this.makeId("hideDate") );
    hide.value = date;
}

/**
 * Updates the selected date and the current date in the date chooser.
 * The selected date keeps track of the date that will be set in the
 * text entry field. The current date keeps track of the date to show
 * in the calendar view.
 * c - the calendar object
 * updInput - if true, update the input field text
 */
function WDateChooser_updateSelectedDate( c, updInput ) {

    var era = null;
    var year = null;
    var month = null;
    var date = null;

    if ( c != null )  {
        era = c.get("ERA");
        year = c.get("YEAR");
        month = c.get("MONTH");
        date = c.get("DATE");
    }

    // update the selected date
    if ( c != null ) {
        if ( this.selDate == null ) {
            this.selDate = c.clone();
        }
        else {
            WDateChooser_initCalendarDate( this.selDate );
            this.selDate.set("ERA", era);
            this.selDate.set("YEAR", year);
            this.selDate.set("MONTH", month);
            this.selDate.set("DATE", date);
        }
    }
    else {
        this.selDate = null;
    }

    // update the hidden fields
    if ( this.selMode == 1 || this.selMode == 3 ) {
        var hide = this.getElementById( this.makeId("smEra") );
        hide.value = era;
        var hide = this.getElementById( this.makeId("smYear") );
        hide.value = year;
        hide = this.getElementById( this.makeId("smMonth") );
        hide.value = month;
        hide = this.getElementById( this.makeId("smDate") );
        hide.value = date;
    }

    if ( updInput != null && updInput == true ) {
        WDateChooser_updateInputField( this );
    }
}

/**
 * Updates the input field by the currently selected date value(s)
 */
function WDateChooser_updateInputField( dc ) {
    var dateInput = dc.getElementById( dc.textId );
    var selectedDates = dc.getSelectedDateRange();
    var text = dc.convertCalendarArrayToText(selectedDates);
    if (dateInput != null && text && text.length != 0) {
        dateInput.value = text;
    }
}

/**
 * Validates the input field value and save it as the selected date
 */
function WDateChooser_saveInputField( dc ) {
    // do nothing if client side input date format validation
    // is disabled
    if ( !dc.clientFormatValidation ) {
        return;
    }

    // validate
    var dateInput = dc.getElementById( dc.textId );
    if ( dateInput != null && dateInput.value != null && dateInput.value.length > 0 ) {
        var c = dc.cal.clone();
        var date = dc.df.parse( dateInput.value, c );
        if ( !isNaN( date ) ) {
            // valid date - update internal selection
            dc.updateSelectedDate( c );
        }
        // update display date
        WDateChooser_updateInputField( dc );
    }
}

/**
 * Builds the calendar view starting from the div tag.
 * cal - the calendar object
 */
function WDateChooser_buildCalendarDiv() {

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
        div.dir = ( this.isLTR ) ? "LTR" : "RTL"; // @06
        div.id = this.makeId("calDiv", div);
        
        // Allow for dynamic sizing in Netscape and IE
        if ( !WClient.isBrowserMozilla() || WClient.isBrowserNetscape() ) //@09A1
        //if (WClient.isBrowserInternetExplorer()) //177672_f1
        {
            //177672_f1 div.style.width = "0px";
            div.style.width = ""; //177672_f1
            div.style.height = ""; //177672_f1
        } //177672_f1
        

        // this hidden field stores the date chooser's id
        var hideid = document.createElement( "INPUT" );
        hideid.className = "wDateChooserIdClass";
        hideid.type = "hidden";
        div.appendChild( hideid );
        hideid.value = this.id;

        // primary table layout has 3 rows:
        // 1 = controls, 2 = calendar, 3 = buttons
        var table = document.createElement( "TABLE" );
        div.appendChild( table );
        this.applyStyle( "BORDER", table ); //@07A
        table.id = this.makeId("calDivTable", table);
        table.border = 0;
        table.cellSpacing = 0;
        table.cellPadding = 0;
        table.dir = ( this.isLTR ) ? "LTR" : "RTL";
        if ( this.selectable ) {
            table.summary = this.accessibleMessages["str.date.range.chooser.default.summary"];
        }
        else {
            table.summary = this.accessibleMessages["str.date.chooser.default.summary"];
        }

        var tb = document.createElement( "TBODY" );
        table.appendChild( tb );

        // primary table row 1 is for the controls
        var tr = document.createElement( "TR" );
        tb.appendChild( tr );

        var td;
        var tdCount = 0;

        td = document.createElement( "TD" );
        td.id = this.makeId("calTop", td);
        tr.appendChild( td );
        tdCount++;
        if ( this.selection < 0 )
            this.applyStyle( "SELECTED_CAL_TOP", td );
        else
            this.applyStyle( "CAL_TOP", td );

        // header table layout for the controls has 2 cells:
        // 1 = navigation, 2 = close
        var htable = document.createElement( "TABLE" );
        td.appendChild( htable );
        htable.border = 0;
        htable.cellSpacing = 0;
        htable.cellPadding = 3;
        htable.width = "100%";
        htable.dir = ( this.isLTR ) ? "LTR" : "RTL";

        var htb = document.createElement( "TBODY" );
        htable.appendChild( htb );

        var htr = document.createElement( "TR" );
        htb.appendChild( htr );

        var hnbsp;

        if ( this.navMode > 0 ) {

            if ( this.selectable ) {

                var htd = document.createElement( "TD" );
                if ( this.selection < 0 )
                htd.align = "left";
                htd.style.whiteSpace = "nowrap";
                htd.noWrap = true;
                htd.onclick = WDateChooser_selectMonthHandler;
                if ( this.selMode == 1 || this.selMode == 3) {
                    // set an id
//                    htd.id = this.makeId( era + "_" + year + "_" + month + "_month", htd );
                    if ( document.all ) {
                        htd.ondblclick = WDateChooser_selectMonthHandler;
                    }
                    else {
                        htd.addEventListener( "dblclick", WDateChooser_selectMonthHandler, false );
                    }
                }
                this.applyStyle( "MONTH_RADIO", htd );
                htr.appendChild( htd );

                var a = document.createElement( "A" );
                a.href="javascript:void(0);";
                htd.appendChild( a );

                // month selection radio button
                var limg;
                if (this.selection < 0)
                    limg = this.getImage( "ROW_SELECTED" );
                else
                    limg = this.getImage( "SELECT_ROW" );
                var eimg = limg.createElement( this.isLTR );
                eimg.id = this.makeId("selectMonth", eimg);
                eimg.style.display = "inline";
                a.appendChild( eimg );
            }

            var htd = document.createElement( "TD" );
            htd.align = "left";
            htd.style.whiteSpace = "nowrap";
            htd.noWrap = true;
            htr.appendChild( htd );

            // these links navigate to previous month
            var link = document.createElement( "A" );
            htd.appendChild( link );
            link.id = this.makeId("prevMonth", link);
            link.href = "javascript:void(0);";
            link.onclick = WDateChooser_prevMonthHandler;
            if ( this.tabIndex != 0 ) { //@05A
                link.tabIndex = this.tabIndex != 0
            }

            var limg = this.getImage( "PREVIOUS_MONTH" );
            var eimg = limg.createElement( this.isLTR );
            eimg.id = this.makeId("prevMonthImg", eimg);
            eimg.onmouseover = WDateChooser_imageOverHandler;
            eimg.onmouseout = WDateChooser_imageOutHandler;
            eimg.style.display = "inline"; //@03
            link.appendChild( eimg );
            link.title = limg.alt;

            hnbsp = document.createElement( "SPAN" );
            htd.appendChild( hnbsp );
            hnbsp.innerHTML = "&nbsp;";
        }

        var htd = document.createElement( "TD" );
        htd.align="center";
        htd.style.whiteSpace = "nowrap";
        htd.noWrap = true;
        htr.appendChild( htd );

        if ( this.navMode == 1 ) {
            // these spans display the current month and year
            var text = document.createElement( "SPAN" );
            htd.appendChild( text );
            text.id = this.makeId("textYearMonth", text);
            this.applyStyle( "CAL_TEXT", text );
        }
        else {
            var htd = document.createElement( "TD" );
            htd.style.whiteSpace = "nowrap";
            htd.noWrap = true;
            htr.appendChild( htd );

            // these comboboxes display the current month and year
            var sel = document.createElement( "SELECT" );
            htd.appendChild( sel );
            sel.id = this.makeId("comboMonth", sel);
            this.applyStyle( "COMBO_BOX", sel );
            if ( this.tabIndex != 0 ) { //@05A
                sel.tabIndex = this.tabIndex != 0
            }
            sel.onchange = WDateChooser_updateCalendarViewHandler;
            var monthSize = this.df.dateFormatSymbols.months.length;
            for ( var i=0; i<monthSize; i++ ) {
                var opt = document.createElement( "OPTION" );
                sel.appendChild( opt );
                opt.appendChild( document.createTextNode( this.df.dateFormatSymbols.months[i] ) );
            }

            hnbsp = document.createElement( "SPAN" );
            htd.appendChild( hnbsp );
            hnbsp.innerHTML = "&nbsp;";

            sel = document.createElement( "SELECT" );
            htd.appendChild( sel );
            sel.id = this.makeId("comboYear", sel);
            this.applyStyle( "COMBO_BOX", sel );
            if ( this.tabIndex != 0 ) { //@05A
                sel.tabIndex = this.tabIndex != 0
            }
            sel.onchange = WDateChooser_updateCalendarViewHandler;

            hnbsp = document.createElement( "SPAN" );
            htd.appendChild( hnbsp );
            hnbsp.innerHTML = "&nbsp;";
        }

        // these hidden fields store the currently selected date

        var htd = document.createElement( "TD" );
        htd.style.whiteSpace = "nowrap";
        htd.noWrap = true;
        htr.appendChild( htd );

        var hidden = document.createElement( "INPUT" );
        hidden.type = "hidden";
        td.appendChild( hidden );
        hidden.id = this.makeId("hideEra", hidden);

        hidden = document.createElement( "INPUT" );
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

        if ( this.selMode == 1 || this.selMode == 3) {
            // we have additional hidden fields in this selection mode:
            // the set above is used by the navigation controls
            // the set below is used by the selection and ok button
            var hidden = document.createElement( "INPUT" );
            hidden.type = "hidden";
            td.appendChild( hidden );
            hidden.id = this.makeId("smEra", hidden);

            hidden = document.createElement( "INPUT" );
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

        if ( this.selMode == 3 && this.monthNavMode == 1) {
            // additional hidden field for week number
            // currently selected
            var hidden = document.createElement( "INPUT" );
            hidden.type = "hidden";
            td.appendChild( hidden );
            hidden.id = this.makeId("smWeekNum", hidden);
            hidden.value = 0;
        }

        if ( this.navMode > 0 ) {

            var htd = document.createElement( "TD" );
            htd.align = "right";
            htd.style.whiteSpace = "nowrap";
            htd.noWrap = true;
            htr.appendChild( htd );

            hnbsp = document.createElement( "SPAN" );
            htd.appendChild( hnbsp );
            hnbsp.innerHTML = "&nbsp;";

            // these links navigate to next month
            link = document.createElement( "A" );
            htd.appendChild( link );
            link.id = this.makeId("nextMonth", link);
            if ( this.tabIndex != 0 ) { //@05A
                link.tabIndex = this.tabIndex != 0
            }
            link.href = "javascript:void(0);";
            link.onclick = WDateChooser_nextMonthHandler;

            var limg = this.getImage( "NEXT_MONTH" );
            var eimg = limg.createElement( this.isLTR );
            eimg.id = this.makeId("nextMonthImg", eimg);
            eimg.onmouseover = WDateChooser_imageOverHandler;
            eimg.onmouseout = WDateChooser_imageOutHandler;
            eimg.style.display = "inline"; //@03
            link.appendChild( eimg );
            link.title = limg.alt;
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
            if ( this.tabIndex != 0 ) { //@05A
                clink.tabIndex = this.tabIndex != 0
            }
            clink.href = "javascript:void(0);";
            clink.onclick = WDateChooser_closeHandler;

            var cimg = this.getImage( "CLOSE" );
            var eimg = cimg.createElement( this.isLTR );
            eimg.style.display = "inline";
            clink.appendChild( eimg );
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
        this.applyStyle( "CAL_BORDER", ctable ); //@07A
        ctable.id = this.makeId("calTable", ctable);
        ctable.border = 0;
        ctable.cellSpacing = 0;
        ctable.cellPadding = 3;
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
            if ( this.tabIndex != 0 ) { //@05A
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
            if ( this.tabIndex != 0 ) { //@05A
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
 * c - the calendar object
 * aDoc - html document that contains the date chooser
 */
function WDateChooser_buildCalendarBody( c, aDoc ) {

    var era = null;
    var year = null;
    var month = null;
    var date = null;

    if ( c != null ) {
        era = c.get("ERA");
        year = c.get("YEAR");
        month = c.get("MONTH");
        date = c.get("DAY_OF_MONTH");
    }

    if ( aDoc == null ) {
        aDoc = document;
    }

    var tb = aDoc.createElement( "TBODY" );
    tb.id = this.makeId("calTableBody", tb);

    // figure out what day this month starts on
    var calendar;
    if (c == null) {
        calendar = this.cal.clone();
    }
    else {
        calendar = c.clone();
    }
    calendar.set("DATE", 1);
    var fDow = calendar.get("DAY_OF_WEEK");
    // day of the week that should be rendered first
    // should this be settable on date chooser?
    var mDow = this.cal.firstDayOfWeek;

    var tr, td, link, idx, fidx;
    var shortWeekdays = this.df.dateFormatSymbols.shortWeekdays;
    if (this.weekdayLabels != null)
        shortWeekdays = this.weekdayLabels;

    // add days of week
    tr = aDoc.createElement( "TR" );
    tb.appendChild( tr );
    
    if ( this.selectable ) {
        var td = document.createElement( "TH" );
        tr.appendChild( td );
        this.applyStyle( "EMPTY_DAY_NAME", td );
        td.align = "center";
        td.vAlign = "bottom";
        td.innerHTML="&nbsp;";
    }

    var daySize = shortWeekdays.length;
    //var tdw = "" + (100 / daySize) + "%";
    for ( var i=0; i<daySize; i++ ) {
        idx = (i+mDow) % daySize;
        if ( idx == fDow ) {
            fidx = i;
        }
        td = aDoc.createElement( "TH" );
        tr.appendChild( td );
        this.applyStyle( "DAY_NAME", td );
        td.align = "center";
        td.vAlign = "bottom";
        td.innerHTML = shortWeekdays[idx];
    }

    // calc total days in month
    var thisMonth = calendar.get("MONTH");
    for (daysInMonth = 0; daysInMonth == 0 || calendar.get("MONTH") == thisMonth; daysInMonth += 7) {
        calendar.add("DATE", 7);
    }
    daysInMonth = daysInMonth - calendar.get("DATE") + 1;
    var firstDateEra, firstDateYear, firstDateMonth, firstDateDate;
    if (this.firstDate != null) {
        firstDateEra = this.firstDate.get("ERA");
        firstDateYear =  this.firstDate.get("YEAR");
        firstDateMonth =  this.firstDate.get("MONTH");
        firstDateDate = this.firstDate.get("DATE");
    }

    var lastDateEra, lastDateYear, lastDateMonth, lastDateDate;
    if (this.lastDate != null) {
        lastDateEra = this.lastDate.get("ERA");
        lastDateYear =  this.lastDate.get("YEAR");
        lastDateMonth =  this.lastDate.get("MONTH");
        lastDateDate = this.lastDate.get("DATE");
    }

    var selDates = this.getSelectedDateRange();
    var selDateEra, selDateYear, selDateMonth, selDateDate;
    if (selDates != null && selDates.length > 0) {
        selDateEra = selDates[0].get("ERA");
        selDateYear =  selDates[0].get("YEAR");
        selDateMonth =  selDates[0].get("MONTH");
        selDateDate = selDates[0].get("DATE");
    }

    var todayEra, todayYear, todayMonth, todayDate;
    todayEra = this.today.get("ERA");
    todayYear = this.today.get("YEAR");
    todayMonth = this.today.get("MONTH");
    todayDate = this.today.get("DATE");

    // add the days
    var num = 1;
    var tot = daysInMonth;
    var daySize = shortWeekdays.length;
    var week = 1;
    while ( num<=tot ) {
        tr = aDoc.createElement( "TR" );
        tb.appendChild( tr );

        if ( this.selectable ) {

            var td = document.createElement( "TD" );
            this.applyStyle( "WEEK_RADIO_OFF", td );
            td.align = "left";
            td.style.whiteSpace = "nowrap";
            td.noWrap = true;
            if (this.isLTR) {
                td.style.borderRight="1px solid " + td.style.borderColor;
                td.style.borderLeft="0px";
            }
            else {
                td.style.borderRigtht="0px";
                td.style.borderLeft="1px solid " + td.style.borderColor;
            }
            td.onclick = WDateChooser_selectWeekHandler;
            if ( this.selMode == 1 || this.selMode == 3 ) {
                // set an id
                td.id = this.makeId( era + "_" + year + "_" + month + "_" + week + "_week", td );
                if ( document.all ) {
                    td.ondblclick = WDateChooser_selectWeekHandler;
                }
                else {
                    td.addEventListener( "dblclick", WDateChooser_selectWeekHandler, false );
                }
            }
            tr.appendChild( td );
                
            var a = document.createElement( "A" );
            a.href="javascript:void(0);";
            td.appendChild( a );

            // change the icon of the week button
            var limg;
            // date format for week label
            var oldPattern = this.df.pattern;
            this.df.pattern = this.monthDateFormatPattern;
            var mdStr = WDateChooser_getMonthDateStringOfNthWeek( era, year, month, week, this.cal.clone(), this.df );
            this.df.pattern = oldPattern;
            var title;
            if (this.selection > 0 && selDateEra == era && selDateYear == year && selDateMonth == month && selDateDate == num) {
                limg = this.getImage( "ROW_SELECTED" );
                title = this.accessibleMessages["str.alt.week.selected"] + mdStr;

                // preserve selected week number
                var hiddenWeekNum = this.getElementById( this.makeId("smWeekNum") );
                if( hiddenWeekNum != null ) {
                    hiddenWeekNum.value = week;
            }

            }
            else {
                limg = this.getImage( "SELECT_ROW" );
                title = this.accessibleMessages["str.alt.week.selection"].replace( "{0}", mdStr );
            }
            var eimg = limg.createElement( this.isLTR );
            eimg.id = this.makeId("selectWeek" + week, eimg);
            eimg.style.display = "inline";
            eimg.title = eimg.alt = title;
            a.appendChild( eimg );
            a.childNodes[0].value = week;

            week++;
        }

        for ( var i=0; i<daySize; i++ ) {
            td = aDoc.createElement( "TD" );
            tr.appendChild( td );
            td.align = ( this.isLTR ) ? "left" : "right";
            td.vAlign = "bottom";
            if ( (num == 1 && i<fidx) || num>tot ) {
                //177672 td.innerHTML = "&nbsp;";
                td.innerHTML = "&nbsp;&nbsp;"; //177672
                this.applyStyle( "EMPTY_DAY", td );
            }
            else {
                var eraOK = true;
                var yearOK = true;
                var monthOK = true;
                var dateOK = true;

                // compare with the first selectable date
                var hasFirst = this.firstDate != null;
                if ( hasFirst ) {
                    eraOK = ( firstDateEra <= era );
                    if ( eraOK ) {
                        yearOK = !( firstDateEra == era && year < firstDateYear);
                        if ( yearOK ) {
                            monthOK = !(firstDateEra == era && firstDateYear == year && month < firstDateMonth);
                            if ( monthOK ) {
                                dateOK = !(firstDateEra == era && firstDateYear == year && firstDateMonth == month && num < firstDateDate);
                            }
                        }
                    }
                }

                // compare with the last selectable date
                var hasLast = this.lastDate != null;
                if ( hasLast && eraOK && yearOK && monthOK && dateOK ) {
                    eraOK =  ( era <= lastDateEra );
                    if ( eraOK ) {
                        yearOK = !( lastDateEra == era && year > lastDateYear );
                        if ( yearOK ) {
                            monthOK = !(lastDateEra == era && lastDateYear == year && month > lastDateMonth);
                            if ( monthOK ) {
                                dateOK = !(lastDateEra == era && lastDateYear == year && lastDateMonth == month && num > lastDateDate);
                            }
                        }
                    }
                }

                var isSelectable = eraOK && yearOK && monthOK && dateOK;
                var isSelectedDay = ( this.selDate != null && era == selDateEra && year == selDateYear && month == selDateMonth && num == selDateDate );
                if ( isSelectable && ( !this.isReadOnly || isSelectedDay ) ) {
                   var anchorTitle = null;
                   link = aDoc.createElement( "A" );
                   td.appendChild( link );
                   link.href = "javascript:void(0);";
                   if ( isSelectedDay && this.selection == 0 ) {
                       this.applyStyle( "SELECTED_DAY_LINK", link ); //@07A
                       anchorTitle = this.accessibleMessages["str.alt.selected.date"];
                   }
                   else {
                       this.applyStyle( "DAY_LINK", link );
                   }
                   if (num < 10) {
                       //177672_f1 link.innerHTML = "&nbsp;" + num + "&nbsp;";
                       link.innerHTML = (( this.isLTR ) ? ("&nbsp;" + num) : (num + "&nbsp;") ); //177672_f1
                   }
                   else {
                       link.innerHTML = num;
                   }

                   if ( this.tabIndex != 0 ) { //@05A
                       link.tabIndex = this.tabIndex != 0
                   }
                   td.onclick = WDateChooser_selectDateHandler;
                   if ( this.selMode == 1 || this.selMode == 3 ) {
                       // set an id
                       td.id = this.makeId( era + "_" + year + "_" + month + "_" + num, td );
                       td.name = this.makeId( era + "_" + year + "_" + month + "_" + num, td );
                       if ( document.all ) {
                           td.ondblclick = WDateChooser_selectDateHandler;
                       }
                       else {
                           td.addEventListener( "dblclick", WDateChooser_selectDateHandler, false );
                       }
                   }

                   // set style bold if it is today.
                   if (era == todayEra && year == todayYear && month == todayMonth && num == todayDate) {
                       link.style.fontWeight = "bold";
                       link.style.color = "black";
                       if (anchorTitle == null) {
                           anchorTitle = this.accessibleMessages["str.alt.today"];
                       }
                       else {
                           anchorTitle = this.accessibleMessages["str.alt.today"] + ", " + anchorTitle;
                       }
                   }
                   if ( anchorTitle != null ) {
                       link.title = anchorTitle;

                       // create dummy image for accessibility
                       var img = this.getImage( "CLEAR_PIXEL" );
                       if ( img != null ) {
                           var imgElem = img.createElement( this.isLTR );
                           imgElem.alt = anchorTitle;
                           imgElem.id = this.makeId("dateClearPixel");
                           link.appendChild( imgElem );
                       }
                   }
                }
                else {
                   td.innerHTML = num;

                   // set style bold if it is today.
                   if (era == todayEra && year == todayYear && month == todayMonth && num == todayDate) {
                       td.style.fontWeight = "bold";
                       td.style.color = "black";
                       td.title = this.accessibleMessages["str.alt.today"];

                       // create dummy image for accessibility
                       var img = this.getImage( "CLEAR_PIXEL" );
                       if ( img != null ) {
                           var imgElem = img.createElement( this.isLTR );
                           imgElem.alt = this.accessibleMessages["str.alt.today"];
                           imgElem.id = this.makeId("dateClearPixel");
                           td.appendChild( imgElem );
                       }
                   }
                }

                // set the date style
                idx = (i+mDow) % daySize;
                if ( isSelectable && isSelectedDay ) {
                    this.applyStyle( "SELECTED_DAY", td );
                }
                else if ( this.isWeekendDay(idx) ) {
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
 * Hilight/Unhilight the current month/week button or date cell
 * isOn: true to hilight. false to clear highlight
 */
function WDateChooser_hilightSelection( aDoc, isOn ) {
    // get year,month,date of the current calendar
    var era =  parseInt( this.getElementById( this.makeId("hideEra") ).value );
    var year = parseInt( this.getElementById( this.makeId("hideYear") ).value );
    var month = parseInt( this.getElementById( this.makeId("hideMonth") ).value );
    var date = parseInt( this.getElementById( this.makeId("hideDate") ).value );

    // get the current selected dates
    var selDates = this.getSelectedDateRange();
    if (selDates == null)
        return;

    if ( this.selection < 0 ) {
        // hilight/unhilight month 

        // get the selected month
        var cal = selDates[0].clone();
        if (cal.get("DATE") != 1) {
            cal.set("DATE", 1);
            cal.add("MONTH", 1);
        }
        var selEra = cal.get("ERA");
        var selYear = cal.get("YEAR");
        var selMonth = cal.get("MONTH");

        // change the month button icon
        var id = this.makeId("selectMonth");
        var img = this.getElementById( id, aDoc );
        if ( img != null ) {
            // get year-month string
            var oldPattern = this.df.pattern;
            this.df.pattern = this.yearmonthFormatPattern;
            var ymStr = this.df.format(cal);
            this.df.pattern = oldPattern;

            // update image
            var a = img.parentNode;
            a.removeChild(img);
            var limg;
            var title;
            if ( isOn && selEra == era && selYear == year && selMonth == month) {
                limg = this.getImage( "ROW_SELECTED" );
                title = this.accessibleMessages["str.alt.month.selected"] + ymStr;
            }
            else {
                limg = this.getImage( "SELECT_ROW" );
                title = this.accessibleMessages["str.alt.month.selection"].replace( "{0}", ymStr );
            }
            img = limg.createElement( this.isLTR );
            img.id = id;
            img.style.display = "inline";
            img.title = img.alt = title;
            a.appendChild(img);
        }

        // change the month button style
        if ( img != null ) {
            var id = this.makeId("calTop");
            var table = this.getElementById( id, aDoc );
            if ( isOn && selEra == era && selYear == year && selMonth == month) {
                this.applyStyle( "SELECTED_CAL_TOP", table );
            }
            else {
                this.applyStyle ("CAL_TOP", table);
            }
        }

        // change week row style
        if (selEra == era && selYear == year && selMonth == month) {
            var week = 1;
            while (true) {
                var id = this.makeId("selectWeek" + week);
                var img = this.getElementById( id, aDoc );
                if (img == null)
                    break;
                tr = img.parentNode.parentNode.parentNode;
                for (var i = 1; i < tr.childNodes.length; i++) {
                    td = tr.childNodes[i];
                    if ( isOn && selEra == era && selYear == year && selMonth == month) {
                        if (td.childNodes != null && td.childNodes[0] != null
                            && (td.childNodes[0].tagName == "a" || td.childNodes[0].tagName == "A")) {
                            this.applyStyle("SELECTED_ALL_WEEKS", td);
                        }
                        else {
                            this.applyStyle("WEEK", td);
                        }
                    }
                    else {
                        this.applyStyle("WEEK", td);
                    }
                    td.style.borderTop="0px none";
                    td.style.borderBottom="1px solid white";
                    td.style.borderLeft="0px none";
                    td.style.borderRight="0px none";
                }
                week++;
            }
        }
    }
    else if ( this.selection == 0 ) {
        // hilight/unhilight date
        // update the styles of the last date selected
        var dateid, datetd;
        var selCal = selDates[0];
        dateid = this.makeId( selCal.get("ERA") + "_" + selCal.get("YEAR") + "_" + selCal.get("MONTH") + "_" + selCal.get("DATE") );
        datetd = this.getElementById( dateid, aDoc );
        if (datetd == null)
            datetd = this.getElementById( dateid );
        if (datetd == null)
            datetd = document.getElementById( dateid );
        if ( datetd != null ) {
            var day = selCal.get("DAY_OF_WEEK");
            if ( isOn ) {
                this.applyStyle( "SELECTED_DAY", datetd );
            }
            else if ( this.isWeekendDay( day ) ) {
                this.applyStyle( "WEEKEND_DAY", datetd );
            }
            else {
                this.applyStyle( "DAY", datetd );
            }
            if ( isOn ) {
                this.applyStyle( "SELECTED_DAY_LINK", datetd.childNodes[0] );
            }
            else {
                this.applyStyle( "DAY_LINK", datetd.childNodes[0] );
            }
            // update the cursor style
            this.applyCursorStyle( true, datetd );

            var todayEra = this.today.get("ERA");
            var todayYear = this.today.get("YEAR");
            var todayMonth = this.today.get("MONTH");
            var todayDate = this.today.get("DATE");

            // add title to the link
            var anchorTitle = null;
            if ( isOn ) {
                anchorTitle = this.accessibleMessages["str.alt.selected.date"];
            }
            var a = datetd.childNodes[0];
            if (era == todayEra && year == todayYear && month == todayMonth && date == todayDate) {
                // set style bold if it is today.
                a.style.fontWeight = "bold";
                a.style.color = "black";
                if ( isOn ) {
                    anchorTitle = this.accessibleMessages["str.alt.today"] + ", " + anchorTitle;
                }
                else {
                    anchorTitle = this.accessibleMessages["str.alt.today"];
                }
            }
            a.title = anchorTitle;
            var n;
            var imgId = this.makeId("dateClearPixel");
            for ( n = 0; n < a.childNodes.length; n++ ) {
                if ( a.childNodes[n].id == imgId ) {
                    a.removeChild( a.childNodes[n] );
                    break;
                }
            }
            if ( anchorTitle != null) {
                var img = this.getImage( "CLEAR_PIXEL" );
                var imgElem = img.createElement( this.isLTR );
                imgElem.alt = anchorTitle;
                imgElem.id = imgId;
                a.appendChild( imgElem );
            }
        }
    }
    else {
        // hilight/unhilight week

        // get current display calendar
        var cal = this.cal.clone();
        WDateChooser_initCalendarDate( cal );
        cal.set("ERA", era);
        cal.set("YEAR", year);
        cal.set("MONTH", month);
        cal.set("DATE", 1);

        // get the first day of week
        var firstDayOfWeek = this.cal.firstDayOfWeek;
 
        // get the last day of week
        var lastDayOfWeek;
        if (firstDayOfWeek != 0)
            lastDayOfWeek = firstDayOfWeek - 1;
        else
            lastDayOfWeek = this.df.dateFormatSymbols.shortWeekdays.length - 1;

       // get num of weekdays
        weekdays = this.df.dateFormatSymbols.shortWeekdays.length;

        // get the start day of the month in the calendar
        var startDay = cal.clone();
        while (startDay.get("DAY_OF_WEEK") != firstDayOfWeek) {
            startDay.add("DATE", -1);
        }

        // get the end day of the month in the calendar
        var endDay = cal.clone();
        endDay.add("MONTH", 1);
        while (endDay.get("DAY_OF_WEEK") != lastDayOfWeek) {
            endDay.add("DATE", 1);
        }

        // calc which week is selected
        var week = 0;
        if (startDay.date <= selDates[0].date && selDates[0].date <= endDay.date) {
            for (week = 1; startDay.date < selDates[0].date; week++) {
                startDay.add("DATE", weekdays);
            }
        }

        // change the week button icon
        if (week > 0) {
            var id = this.makeId("selectWeek" + week);
            var img = this.getElementById( id, aDoc );
            if (img) {
                var a = img.parentNode;
                a.removeChild(img);

                var limg;
                var title;
                // date format for week label
                var oldPattern = this.df.pattern;
                this.df.pattern = this.monthDateFormatPattern;
                var mdStr = WDateChooser_getMonthDateStringOfNthWeek( era, year, month, week, this.cal.clone(), this.df );
                this.df.pattern = oldPattern;

                if ( isOn ) {
                    limg = this.getImage( "ROW_SELECTED" );
                    title = this.accessibleMessages["str.alt.week.selected"] + mdStr;
                }
                else {
                    limg = this.getImage( "SELECT_ROW" );
                    title = this.accessibleMessages["str.alt.week.selection"].replace( "{0}", mdStr );
                }
                img = limg.createElement( this.isLTR );
                img.id = id;
                img.style.display = "inline";
                img.title = img.alt = title;
                a.appendChild(img);
                a.childNodes[0].value = week;
            }

            // change the week button style
            if (img) {
                var td = img.parentNode.parentNode;
                if ( isOn ) {
                    this.applyStyle ("WEEK_RADIO_ON", td);
                }
                else {
                    this.applyStyle ("WEEK_RADIO_OFF", td);
                }

                if (this.isLTR) {
                    td.style.borderRight="1px solid " + td.style.borderColor;
                    td.style.borderLeft="0px";
                }
                else {
                    td.style.borderRigtht="0px";
                    td.style.borderLeft="1px solid " + td.style.borderColor;
                }
            }
        }

        // change week row style
        if (week != 0) {
            var id = this.makeId("selectWeek" + week);
            var img = this.getElementById( id, aDoc );
            if (img) {
                tr = img.parentNode.parentNode.parentNode;
                for (var i = 1; i < tr.childNodes.length; i++) {
                    td = tr.childNodes[i];
                    if (isOn)
                        this.applyStyle("SELECTED_WEEK", td);
                    else
                        this.applyStyle("WEEK", td);
                    td.style.borderTop="0px none";
                    td.style.borderBottom="0px none";
                    td.style.borderLeft="0px none";
                    td.style.borderRight="0px none";
                }
            week++;
            }
        }
        
    }

}


/**
 * Selects a month.
 * dismiss - whether to hide the date chooser
 * aDoc - html document that contains the date chooser
 */
function WDateChooser_selectMonth( dismiss, aDoc ) {
    var era =  parseInt( this.getElementById( this.makeId("hideEra") ).value );
    var year = parseInt( this.getElementById( this.makeId("hideYear") ).value );
    var month = parseInt( this.getElementById( this.makeId("hideMonth") ).value );
    var c = this.cal.clone();
    WDateChooser_initCalendarDate( c );
    c.set("ERA", era);
    c.set("YEAR", year);
    c.set("MONTH", month);
    c.set("DATE", 1);
    var selDate = c.clone();

    if ( dismiss ) {
        // change selection type to month
        this.selection = -1;
        this.updateSelectedDate( selDate, true );
        this.updateCurrentDate( c );
        this.setVisible( false );
        // set focus on the date button
        var dateButton = this.getElementById( this.buttonId );
        if (dateButton != null)
            dateButton.focus();
    }
    else {
        // unhilight the last selection
        this.hilightSelection( aDoc, false );

        // change selection type to month
        this.selection = -1;
        this.updateSelectedDate( selDate, true );
        this.updateCurrentDate( c );

        // hilight the current selection
        this.hilightSelection( aDoc, true );
    }
}

/**
 * Selects a week.
 * week - the week to select
 * dismiss - whether to hide the date chooser
 * aDoc - html document that contains the date chooser
 */
function WDateChooser_selectWeek( week, dismiss, aDoc ) {
    var era =  parseInt( this.getElementById( this.makeId("hideEra") ).value );
    var year = parseInt( this.getElementById( this.makeId("hideYear") ).value );
    var month = parseInt( this.getElementById( this.makeId("hideMonth") ).value );
    var date = parseInt( this.getElementById( this.makeId("hideDate") ).value );
    var c = this.cal.clone();
    WDateChooser_initCalendarDate( c );
    c.set("ERA", era);
    c.set("YEAR", year);
    c.set("MONTH", month);
    c.set("DATE", date);

    // get the first day of week
    var firstDayOfWeek = c.firstDayOfWeek;
    // get weekdays
    weekdays = this.df.dateFormatSymbols.shortWeekdays.length;

    // get the start day of the month in the calendar
    var selDate = c.clone();
    selDate.set("DATE", 1);
    while (selDate.get("DAY_OF_WEEK") != firstDayOfWeek) {
        selDate.add("DATE", -1);
    }

    // get the start date of the Nth week
    for (var i = 1; i < week; i++) {
        selDate.add("DATE", weekdays);
        if (month != selDate.get("MONTH")) {
            break;
        }
    }
    if (week > 1 && month != selDate.get("MONTH")) {
        // rewind 1 week
        selDate.add("DATE", -1 * weekdays);
        week--;
    }

    if ( dismiss ) {
        // change selection type to week
        this.selection = 1;
        this.updateSelectedDate( selDate, true );
        this.updateCurrentDate( c );
        this.setVisible( false );
        // set focus on the date button
        var dateButton = this.getElementById( this.buttonId );
        if (dateButton != null)
            dateButton.focus();
    }
    else {
        // Unhilight the last selection
        this.hilightSelection( aDoc, false );
        // change selection type to week
        this.selection = 1;
        // set new week number
        var weekNum = this.getElementById( this.makeId("smWeekNum") );
        if (weekNum != null) {
            weekNum.value = week;
        }
        // update selection
        this.updateSelectedDate( selDate, true );
        this.updateCurrentDate( c );
        // Hilight the current selection
        this.hilightSelection( aDoc, true );
    }
}

/**
 * Selects a date.
 * date - the date to select
 * dismiss - whether to hide the date chooser
 * aDoc - html document that contains the date chooser
 */
function WDateChooser_selectDate( date, dismiss, aDoc ) {
    if ( date != null ) {
        var era =  parseInt( this.getElementById( this.makeId("hideEra") ).value );
        var year = parseInt( this.getElementById( this.makeId("hideYear") ).value );
        var month = parseInt( this.getElementById( this.makeId("hideMonth") ).value );
        var c = this.cal.clone();
        WDateChooser_initCalendarDate( c );
        c.set("ERA", era);
        c.set("YEAR", year);
        c.set("MONTH", month);
        c.set("DATE", date);
        if (c.get("MONTH") != month) {
            // the date does not exist in this month
            c.set("DATE", 1);
            c.add("DATE", -1);
        }

        if ( dismiss ) {
            // change selection type to date
            this.selection = 0;
            this.updateSelectedDate( c, true );
            this.updateCurrentDate( c );
            this.setVisible( false );

            // set focus on the date button
            var dateButton = this.getElementById( this.buttonId );
            if (dateButton != null)
                dateButton.focus();
        }
        else {

            // Unhilight the last selection
            this.hilightSelection( aDoc, false );

            // change selection type to date
            this.selection = 0;
            this.updateSelectedDate( c, true );
            this.updateCurrentDate( c );

            // hilight the current selection
            this.hilightSelection( aDoc, true );
        }
    }

}

/**
 * Advances the calendar view to the next month.
 * aDoc - html document that contains the date chooser
 */
function WDateChooser_nextMonth( aDoc ) {
    var era = parseInt( this.getElementById( this.makeId("hideEra") ).value );
    var year = parseInt( this.getElementById( this.makeId("hideYear") ).value );
    var month = parseInt( this.getElementById( this.makeId("hideMonth") ).value );
    var date = parseInt( this.getElementById( this.makeId("hideDate") ).value );
    var c = this.cal.clone();
    WDateChooser_initCalendarDate( c );
    c.set("ERA", era);
    c.set("YEAR", year);
    c.set("MONTH", month);
    c.set("DATE", 1);
    c.add("MONTH", 1);

    if ( this.monthNavMode == 1 ) {
        switch( this.selection ) {
        case -1:
            this.updateCalendarView ( c, aDoc );
            this.selectMonth( false, aDoc );
            break;
        case 1:
            var week = 1;
            var hiddenWeekNum = this.getElementById( this.makeId("smWeekNum") );
            if( hiddenWeekNum != null ) {
                week = hiddenWeekNum.value;
            }
            this.updateCalendarView ( c, aDoc );
            this.selectWeek( week, false, aDoc );
            break;
        case 0:
        default:
            this.updateCalendarView ( c, aDoc );
            this.selectDate( date, false, aDoc );
            break;
        }
    }
    else {
        this.hilightSelection( aDoc, false );    // reset all highlight
        this.updateCalendarView( c, aDoc );
        this.hilightSelection( aDoc, true );    // highlight
    }
}

/**
 * Rewinds the calendar view to the previous month.
 * aDoc - html document that contains the date chooser
 */
function WDateChooser_prevMonth( aDoc ) {
    var era = parseInt( this.getElementById( this.makeId("hideEra") ).value );
    var year = parseInt( this.getElementById( this.makeId("hideYear") ).value );
    var month = parseInt( this.getElementById( this.makeId("hideMonth") ).value );
    var date = parseInt( this.getElementById( this.makeId("hideDate") ).value );
    var c = this.cal.clone();
    WDateChooser_initCalendarDate( c );
    c.set("ERA", era);
    c.set("YEAR", year);
    c.set("MONTH", month);
    c.set("DATE", 1);
    c.add("MONTH", -1);

    if ( this.monthNavMode == 1 ) {
        switch( this.selection ) {
        case -1:
            this.updateCalendarView ( c, aDoc );
            this.selectMonth( false, aDoc );
            break;
        case 1:
            var week = 1;
            var hiddenWeekNum = this.getElementById( this.makeId("smWeekNum") );
            if( hiddenWeekNum != null ) {
                week = hiddenWeekNum.value;
            }
            this.updateCalendarView ( c, aDoc );
            this.selectWeek( week, false, aDoc );
            break;
        case 0:
        default:
            this.updateCalendarView ( c, aDoc );
            this.selectDate( date, false, aDoc );
            break;
        }
    }
    else {
        this.hilightSelection( aDoc, false );    // reset all highlight
        this.updateCalendarView( c, aDoc );
        this.hilightSelection( aDoc, true );    // highlight
    }
}

/**
 *      Get current selected date.
 *      @return selected dates(calendar)
 */
function WDateChooser_getSelectedDate() {
    var cals = this.getSelectedDateRange();
    return cals[0];
}


/**
 *      Get current selected date range.
 *      @return array of selected dates. If week or month is selected, returns array of [startday, endday], otherwise returns array of [selectedady]
 */
function WDateChooser_getSelectedDateRange() {
    var cal;

    if (this.selDate == null) {
        cal = this.cal.clone();
        cal.setTime(new Date());
        return new Array(cal);
    }
    cal = this.selDate.clone();

    if (this.selection < 0) {
        // month is selected
        var startDay = cal.clone();
        startDay.set("DATE", 1);
        var endDay = cal.clone();
        endDay.set("DATE", 1);
        endDay.add("MONTH", 1);
        endDay.add("DATE", -1);

        // return array of startday and endday of the selected month
        return new Array(startDay, endDay);

    }
    else if (this.selection > 0) {
        // week is selected

        // get the first day of week
        var firstDayOfWeek = cal.firstDayOfWeek;

        // get weekdays
        weekdays = this.df.dateFormatSymbols.shortWeekdays.length;

        // calc start day
        var startDay = cal.clone();
        while (startDay.get("DAY_OF_WEEK") != firstDayOfWeek) {
            startDay.add("DATE", -1);
        }

        // calc end day
        var endDay = startDay.clone();
        endDay.add("DATE", weekdays-1);

        // return array of startday and endday of the selected month
        return new Array(startDay, endDay);
    }

    return new Array(cal);
    
}


/**
 *  convert calendar array to text
 */
function WDateChooser_convertCalendarArrayToText(cals, dateFormat, separator) {
    if (dateFormat == undefined || dateFormat == null) {
        dateFormat = this.df;
    }
    if (separator == undefined || separator == null) {
        separator = this.separator;
    }
    if (cals == null || typeof cals != "object" || cals.constructor != Array)
        return null;

    var s = "";
    for (var i = 0; i < cals.length; i++) {
        s += dateFormat.format(cals[i]);
        if (i != cals.length -1)
            s += separator;
    }
    return s;
}

/**
 *  convert text to calendar array
 */
function WDateChooser_convertTextToCalendarArray(text, dateFormat, separator) {
    if (text == null || text.length == 0)
        return null;
    if (dateFormat == undefined || dateFormat == null) {
        dateFormat = this.df;
    }
    if (separator == undefined || separator == null) {
        separator = this.separator;
    }
    var arrayText = text.split(this.separator);
    var cals = new Array();
    for (var i = 0; i < arrayText.length; i++) {
        var c = this.cal.clone();
        if (isNaN(dateFormat.parse(arrayText[i], c))) {
            break;
        }
        cals.push(c);
    }
    if (cals.length > 0)
        return cals;
    return null;
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
        if ( dc.monthNavMode == 1) {
            // fire custom onchange
            if (dc.onchange) {
                var onchange = dc.onchange;
                if (typeof dc.onchange == "string") {
                    onchange =  new Function("event", dc.onchange);
                }
                onchange(event);
            }
        }
    }
}

/**
 * Event handler for the next button. Updates the calendar view.
 */
function WDateChooser_nextMonthHandler( event ) {
    var dc = WDateChooser_getDateChooser( event );
    if ( dc != null ) {
        dc.nextMonth( getEventDocument( event ) );
        if ( dc.monthNavMode == 1) {
            // fire custom onchange
            if (dc.onchange) {
                var onchange = dc.onchange;
                if (typeof dc.onchange == "string") {
                    onchange =  new Function("event", dc.onchange);
                }
                onchange(event);
            }
        }
    }
}

/**
 * Event handler for the dropdown boxes. Updates the calendar view based
 * on the new selection.
 */
function WDateChooser_updateCalendarViewHandler( event ) {
    var dc = WDateChooser_getDateChooser( event );
    if ( dc != null ) {
        dc.updateCalendarView( null, getEventDocument( event ) );
    }
}

/**
 * Event handler for the month selection button. Updates the calendar view.
 */
function WDateChooser_selectMonthHandler( event ) {
    var dc = WDateChooser_getDateChooser( event );
    if ( dc != null ) {
        // determine if the date chooser should be dismissed
        var dismiss = false;
        var aEvent = getEvent( event );
        if ( aEvent != null ) {
            var dblclick = aEvent.type == "dblclick";
            var click = aEvent.type == "click";
            dismiss = ( dc.selMode == 0 || (dc.selMode == 1 && dblclick) || (dc.selMode == 2 && click));
        }

        // select the month on the component
        dc.selectMonth( dismiss, getEventDocument( event ) );

        // fire custom onchange
        if (dc.onchange) {
            var onchange = dc.onchange;
            if (typeof dc.onchange == "string") {
                onchange =  new Function("event", dc.onchange);
            }
            onchange(event);
        }
    }
}

/**
 * Event handler for the week selection button. Updates the calendar view.
 */
function WDateChooser_selectWeekHandler( event ) {
    var dc = WDateChooser_getDateChooser( event );
    if ( dc != null ) {
        // determine if the date chooser should be dismissed
        var dismiss = false;
        var aEvent = getEvent( event );
        if ( aEvent != null ) {
            var dblclick = aEvent.type == "dblclick";
            var click = aEvent.type == "click";
            dismiss = ( dc.selMode == 0 || (dc.selMode == 1 && dblclick) || (dc.selMode == 2 && click));
        }

        // the selected date is the text of the hyperlink
        var week = null;
        var tag = getEventTarget( event );
        if ( tag != null ) {
            if ( tag.tagName == "TD" ) {
                week = tag.childNodes[0].childNodes[0].value;
            }
            else if ( tag.tagName == "A" ) {
                week = tag.childNodes[0].value;
            }
            else if ( tag.value != null ) {
                week = tag.value;
            }
        }
        // select the week on the component
        dc.selectWeek( week, dismiss, getEventDocument( event ) );

        // fire custom onchange
        if (dc.onchange) {
            var onchange = dc.onchange;
            if (typeof dc.onchange == "string") {
                onchange =  new Function("event", dc.onchange);
            }
            onchange(event);
        }
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
            var click = aEvent.type == "click";
            dismiss = ( dc.selMode == 0 || (dc.selMode == 1 && dblclick) || (dc.selMode == 2 && click));
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

        // fire custom onchange
        if (dc.onchange) {
            var onchange = dc.onchange;
            if (typeof dc.onchange == "string") {
                onchange =  new Function("event", dc.onchange);
            }
            onchange(event);
        }
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
        var era = parseInt( dc.getElementById( dc.makeId("smEra") ).value );
        var year = parseInt( dc.getElementById( dc.makeId("smYear") ).value );
        var month = parseInt( dc.getElementById( dc.makeId("smMonth") ).value );
        var date = parseInt( dc.getElementById( dc.makeId("smDate") ).value );

        if ( !isNaN(era) && !isNaN(year) && !isNaN(month) && !isNaN(date) ) {
            // update the date text field
            var dateInput = dc.getElementById( dc.textId );
            var c = dc.cal.clone();
            WDateChooser_initCalendarDate( c );
            c.set("ERA", era);
            c.set("YEAR", year);
            c.set("MONTH", month);
            c.set("DATE", date);
            if (dateInput)
                dateInput.value = dc.df.format( c );
        }

        // hide the calendar view
        dc.setVisible( false );

        // set focus on the date button
        var dateButton = dc.getElementById( dc.buttonId );
        dateButton.focus();

        // fire custom onchange
        if (dc.onchange) {
            var onchange = dc.onchange;
            if (typeof dc.onchange == "string") {
                onchange =  new Function("event", dc.onchange);
            }
            onchange(event);
        }
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

/**
 * Event handler for onClick for document, to close all WDateChoosers when the user clicks outside WDateChooser
 */

function WDateChooser_documentClickHandler( e ) {
    if (!e) e=window.event;
    if (getEventTarget(e).className != 'wDateChooserInvoker' && WDateChooser_getDateChooser( e ) == null ){ 
        WDateChooser_closeAll(null);
        return true;
    }
    return false;
}

/**
 * Event handler for onKeyUp for document, to close all WDateChoosers when the user types ESC key.
 */

function WDateChooser_documentKeyUpHandler( e ) {
    if (!e) e=window.event;
    if (e.keyCode==27 || e.key){ 
        WDateChooser_closeAll(null);
        return true;
    }
    return false;
}

function WDateChooser_getMonthDateStringOfNthWeek( era, year, month, week, calendar, df ) {
    // get the first day of week
    var firstDayOfWeek = calendar.firstDayOfWeek;
    // get weekdays
    weekdays = df.dateFormatSymbols.shortWeekdays.length;
    // get the start day of the month in the calendar
    var startCal = calendar.clone();
    WDateChooser_initCalendarDate( startCal );
    startCal.set("ERA", era);
    startCal.set("YEAR", year);
    startCal.set("MONTH", month);
    while (startCal.get("DAY_OF_WEEK") != firstDayOfWeek) {
        startCal.add("DATE", -1);
    }
    // get the start date of the Nth week
    for (var i = 1; i < week; i++) {
        startCal.add("DATE", weekdays);
        if (month != startCal.get("MONTH")) {
            break;
        }
    }
    if (week > 1 && month != startCal.get("MONTH")) {
        // rewind 1 week
        startCal.add("DATE", -1 * weekdays);
    }
    return df.format(startCal);
}

function WDateChooser_initCalendarDate( calendar ) {
    calendar.set("DATE", 1);
    calendar.set("MONTH", 0);
    calendar.set("YEAR", 1);
}

function WDateChooser_initDefaultStyles() {
  this.setStyleClass( "BORDER", "lwpTimeDateBorder");
  this.setStyleClass( "CAL_BORDER", "lwpTimeDateCalBorder");
  this.setStyleClass( "CAL_TEXT", "lwpTimeDateCalText");
  this.setStyleClass( "DAY_NAME", "lwpTimeDateDayName");
  this.setStyleClass( "DAY", "lwpTimeDateDay");
  this.setStyleClass( "WEEKEND_DAY", "lwpTimeDateWeekendDay");
  this.setStyleClass( "DAY_LINK", "lwpTimeDateDayLink");
  this.setStyleClass( "CAL_TOP", "lwpTimeDateCalTop");
  this.setStyleClass( "SELECTED_CAL_TOP", "lwpTimeDateSelectedCalTop");
  this.setStyleClass( "SELECTED_DAY", "lwpTimeDateSelectedDay");
  this.setStyleClass( "SELECTED_DAY_LINK", "lwpTimeDateSelectedDayLink");
  this.setStyleClass( "SELECTED_WEEK", "lwpTimeDateSelectedWeek");
  this.setStyleClass( "SELECTED_ALL_WEEKS", "lwpTimeDateSelectedAllWeeks");
  this.setStyleClass( "WEEK", "lwpTimeDateWeek");
  this.setStyleClass( "MONTH_RADIO", "lwpTimeDateMonthRadio");
  this.setStyleClass( "WEEK_RADIO_ON", "lwpTimeDateWeekRadioOn");
  this.setStyleClass( "WEEK_RADIO_OFF", "lwpTimeDateWeekRadioOff");
  this.setStyleClass( "EMPTY_DAY_NAME", "lwpTimeDateEmptyDayName");
}
