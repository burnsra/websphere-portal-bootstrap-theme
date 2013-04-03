/**
 * (C) Copyright International Business Machines Corp., 2001-2003
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U. S. Copyright Office.
 */

/**
 *    timeChooser.js
 */

/**
 *    timeChooser object
 *    @param doc                document obj
 *    @param pickerId           element ID to be injected DatePicker html.
 */
WclTimeChooser = function(doc, pickerId) {

    /////////////////////////
    // public properties
    /////////////////////////

    /**
     *  document obj
     */
    this._document = doc;

    /**
     *   ID for picker object
     */
    this._id = pickerId;

    /**
     *  document obj
     */
    this._timechooser = this;


    /**
     *  input text field ID for user to type date text
     */
    this._inputid = undefined;

    /**
     * hidden text field ID to store ISO 8601 date text as output
     */
    this._hiddenid = undefined;

    /**
     *   minute interval
     */
    this._minInterval = 15;

    /**
     * true if RTL(Right-To-Left) for Bidi.
     */
    this._isRTL = false;

    /**
     * onchange handler
     */
    this._onchange = undefined;

    /**
     * Calendar object, such as GregorianCalendar
     * Used to show the current calendar in DatePicker.
     */
    this._calendar = new GregorianCalendar();
//alert("Construct time (this): " + this._calendar.get("HOUR_OF_DAY") + ":" + this._calendar.get("MINUTE") + ":" + this._calendar.get("ZONE_OFFSET") );

    /**
     * SimpleDateFormat obj used for Input element.
     */
    this._inputDateFormat = WclTimeChooser.getDefaultDateFormat();

    /**
     * SimpleDateFormat obj used for hidden element
     */
    this._hiddenDateFormat = WclTimeChooser.getDefaultHiddenDateFormat();

    /**
     * calendar obj used for hidden element
     */
    this._hiddenCalendar = new GregorianCalendar();

    /**
     * calendar obj used for hidden element
     */
    this._hiddenCalendar = new GregorianCalendar();

	this.onClickSave = null;
	this.onKeySave = null;

    /**
     * stores style sheets
     */
    this._styleSheets = new Array();

    /////////////////////////
    // private properties
    /////////////////////////

    this._show = false;
    this._x = 0;
    this._y = 0;

    // remember today
    this._now = this._calendar.clone();
    this._now.setTime(new Date());
}

/**
 *    show if not displayed. hide if displayed.
 *    @param e                event object (optional)
 */
WclTimeChooser.prototype.showhide = function(e) {
    if (this._show == false)  {
        this.show(e);
    } else  {
        this.hide(e);
	}
}


/**
 *    show WclTimeChooser
 *    @param e                event object (optional)
 */
WclTimeChooser.prototype.show = function(e) {

    // hide all WclTimeChoosers - removed
//    WclTimeChooser.hideAllTc(this._document.body);

    // throw onshow handler before DatePicker is displayed
    if (typeof this._onshow == "string") {
        this._onshow = new Function("event", this._onshow);
    }

    if (this._onshow != null && this._onshow != undefined ) {
        this._onshow(e);
    }

    // set position to display datepicker
    if (e != undefined) {
        this._x = e.clientX;
        this._y = e.clientY;
    }

    this.generateHTML();

    this._show = true;

    this.onKeySave = document.onkeyup;
	this.onClickSave = document.onclick;
    document.onkeyup = this.closeHandler;
    document.onclick = this.closeClickHandler;
}


/**
 * 	   hide WclTimeChooser
 */
WclTimeChooser.prototype.hide = function(e) {
    if (this._show == true) {
        this._document.getElementById(this._id).innerHTML = "";

        this._show = false;

        // throw onhide handler after WclTimeChooser is closed.
        if (typeof this._onhide == "string") {
            this._onhide = new Function("event", this._onhide);
        }
        if (this._onhide != null && this._onhide != undefined ) {
            this._onhide(e);
        }
    }

    document.onkeyup = this.onKeySave;
    document.onclick = this.onClickSave;
}

/**
 *    validate date text in input field if it exists.
 */
WclTimeChooser.prototype.validate = function() {
    var result;

//alert('validate: ' );
    var element = this._document.getElementById(this._inputid);
    if (element == null || element == undefined || element.value == 0)
        return false;

    // If text is deleted in input field, delete text in hidden field.
    if (element.value != undefined && element.value.length == 0 && this._hiddenid != undefined) {
        var hidden = this._document.getElementById(this._hiddenid);
        if (hidden != null) {
            hidden.value = "";
            return true;
        }
    }

    // validate input field
    // To validate input field, set lenient true.
    this._calendar.lenient = false;
    var cal = this._calendar.clone();
    if (isNaN(this._inputDateFormat.parse(element.value, cal))) {
        result = false;
//alert("### element.value: " + element.value);
//alert("### this._inputDateFormat.pattern: " + this._inputDateFormat.pattern);

    }
    else {
        this._calendar = cal;
        result = true;
    }
    this._calendar.lenient = true;    //reset renient.

    // update input text field and hidden text field according datepicker calendar.
    this.updateFields();

    // if embedded datepicker, redraw datepicker.
    if (this._isEmbedded && this._show)
        this.show();

    return result;
}

/**
 *      update input text field and hidden text field according to datepicker calendar.
 */
WclTimeChooser.prototype.updateFields = function() {
//alert('update');

    // update input text field
    if (this._inputid && this._inputDateFormat != null && this._inputDateFormat != undefined) {
        var element = this._document.getElementById(this._inputid);
        if (element != undefined && element != null) {
            // convert calendar obj ->  date text for input field
            element.value = this._inputDateFormat.format(this._calendar);
        }
    }

    // update hidden text field
    if (this._hiddenid) {

        // find parent FORM element of input field
        var formElement = DatePicker.findForm(this._document.getElementById(this._inputid));

        // find hidden text field
        var element = null;
        if (formElement != null) {
            element = formElement.elements[this._hiddenid];
        }
        if (element == null) {
            element = this._document.getElementById(this._hiddenid);
        }

        if (element != undefined && element != null) {
            // convert calendar obj ->  date text for hidden field
            this._hiddenCalendar.setTime(this._calendar.getTime());
            element.value = this._hiddenDateFormat.format(this._hiddenCalendar);
        }
    }
}


/**
 *      This is the default call from the TimeChooser.  It will just wrap the worker
 *      @return none
 */
WclTimeChooser.prototype.hideAll = function(parent) {
	hideTimeChooser(parent);
}


//S_YQWG6UX3CK begins hideTimeChooser = function() {
hideTimeChooser = function(parent) { //S_YQWG6UX3CK begins 
	    if (parent == null) {
	        parent = document.body;
	    }

	    if (typeof parent == "string") {
	        // if param is string, convert it to element obj
	        parent = document.getElementById(parent);
	    }

	    if ( parent.tagName == "INPUT" && parent.className == "wTimeChooserIdClass" ) {
	        var tc = eval( parent.value );
	        if ( tc ) {
	            // if popup DateChooser found, close it.
                  tc.setVisible( false );
	            return;
	        }
	    }

          //S_YQWG6UX3CK begins - move this down
	    if (parent.childNodes == undefined)
	        return;
          //S_YQWG6UX3CK ends

	    if (parent.childNodes.length != 0) {
	        for (var i = 0; i < parent.childNodes.length; i++) {
	            hideTimeChooser(parent.childNodes[i]);
	        }
	    }
}

/**
 *      hide all WclTimeChoosers under the parent element
 *      @return none
 */
//WclTimeChooser.prototype.hideAllTc = function(parent) {
hideAllTc = function(parent) {

    if (parent == null) {
        parent = document.body;
    }

    if (typeof parent == "string") {
        // if param is string, convert it to element obj
        parent = document.getElementById(parent);
    }

    if (parent._timeChooser != undefined) {
        parent._timeChooser.hide();
        return;
    }

    //S_YQWG6UX3CK begins - move this down
    if (parent.childNodes == undefined)
        return;
    //S_YQWG6UX3CK ends
        
    if (parent.childNodes.length != 0) {
        for (var i = 0; i < parent.childNodes.length; i++) {
            hideAllTc(parent.childNodes[i]);
        }
    }
}


// private functions

WclTimeChooser.prototype.generateHTML = function() {

    var element = this._document.getElementById(this._id);
    var inputElement = this._document.getElementById(this._inputid);
    var listId =  this._id + "_List";

    // link this date picker object to table element in date picker
    element._timeChooser = this;

    // if onchange prop is string, convert it to function
    if (typeof this._onchange == "string") {
        this._onchange = new Function("event", this._onchange);
    }

    var s = "";

    s += "<select ";
    s += 'id="' + listId + '" ';
    s += 'name="' + listId + '" ';
    s += "size=\"8\" style=\"width:" + inputElement.offsetWidth + ";\" ";
    s += 'onkeypress="javascript:document.getElementById(' + "'" + this._id + "'" + ')._timeChooser.timeSelected(event);" ';
    s += 'onClick="javascript:document.getElementById(' + "'" + this._id + "'" + ')._timeChooser.timeSelected(event);" ';
    s += ">";

    var cal = new GregorianCalendar();
    cal.set('HOUR_OF_DAY', 0);
    cal.set('MINUTE', 0);
    cal.set('SECOND', 0);
    selectedFlag = false;
    for(i=0;i<1440/this._minInterval;i++)
    {
        s += "<option ";
        s += 'value="' + cal.get('HOUR_OF_DAY') + ':' + cal.get('MINUTE') + ':' + cal.get('SECOND') + '" ';
        if(!selectedFlag &&
           ((cal.get('HOUR_OF_DAY') == this._calendar.get('HOUR_OF_DAY') &&
            cal.get('MINUTE') >= this._calendar.get('MINUTE'))
            || cal.get('HOUR_OF_DAY') > this._calendar.get('HOUR_OF_DAY'))) {
            s += "SELECTED >";
            selectedFlag = true;
	    } else {
            s += ">";
        }
        s += this._inputDateFormat.format(cal);
        s += "</option>";
        cal.add('MINUTE', this._minInterval);
    }
    element.style.position = "absolute";
    element.style.clientY = this._y;
    element.style.clientX = this._x;
    element.innerHTML = s;

    var listElement = this._document.getElementById(listId);
    if (listElement != null) {
        listElement.focus();
    }
}

// get date formatter obj extended from SimpleDateFormat obj for input field in timeChooser
WclTimeChooser.getDefaultDateFormat = function() {
    var sdf = new SimpleDateFormat();
    sdf.pattern = "H:mm";
    sdf.dateFormatSymbols = SimpleDateFormat.getDefaultGregorianFormatSymbols();
    return sdf;
}

// get date formatter obj extended from SimpleDateFormat obj for input field in timeChooser
WclTimeChooser.getDefaultHiddenDateFormat = function() {
    var sdf = new SimpleDateFormat();
    sdf.pattern = "HH:mm";
    sdf.dateFormatSymbols = SimpleDateFormat.getDefaultGregorianFormatSymbols();
    return sdf;
}

// Internal event handler which is fired when user typed a date.
WclTimeChooser.prototype.timeTyped = function(e) {
//alert('timetyped');

    // validate
    this.validate();
}

// Internal event handler which is fired when user selected a date.
WclTimeChooser.prototype.timeSelected = function(e) {

    // hide the time list, if the esc is pressed
    if (e.keyCode == 27) {
        this.hide();
        return;
    }

    // return if any other key than enter key is pressed.
    if (e.keyCode != 0 && e.keyCode != 13 && e.keyCode != null) {
        return;
    }

    // option element on time list
    var option =  WclTimeChooser.eventGetTarget(e);

    var cal = new GregorianCalendar();
    var timeFormat = new SimpleDateFormat();
    timeFormat.pattern = "H:m:s";
    timeFormat.dateFormatSymbols = SimpleDateFormat.getDefaultGregorianFormatSymbols();
    timeFormat.parse(option.value, cal);

    // update calendar in datepicker
    this._calendar.set("HOUR_OF_DAY", cal.get("HOUR_OF_DAY"));
    this._calendar.set("MINUTE", cal.get("MINUTE"));
    this._calendar.set("SECOND", cal.get("SECOND"));

    // update input text field and hidden text field according datepicker calendar.
    this.updateFields();

    // close timeChooser list
    this.hide();


    // throw onChange event
    if (this._onchange != null && this._onchange != undefined )  {
        this._onchange(e);
	}
}

// find ancestor form element
WclTimeChooser.findForm = function(element) {
    while (element != null && element.tagName != "FORM") {
        element = element.parentNode;
    }
    return element;
}

// get target object in event
WclTimeChooser.eventGetTarget = function(e) {
    if (e.srcElement != undefined) {
        return e.srcElement;
    }
    else if (e.target != undefined) {
        return e.target;
    }
    return undefined;
}

WclTimeChooser.prototype.addStyleSheet = function(css) {
    this._styleSheets[this._styleSheets.length] = css;
}

//
// Handle escape from outside chooser
//
WclTimeChooser.prototype.closeHandler = function(e) {

    if (!e)
    	e=window.event;

    // hide the time list, if the esc is pressed
    if (e.keyCode != undefined  &&  e.keyCode == 27) {
        hideAllTc(this);
        return;
    }

    // return if any other key than enter key is pressed.
    if (e.keyCode != 0 && e.keyCode != 13) {
        return;
    }
}

//
// Handle outside clicks
//
WclTimeChooser.prototype.closeClickHandler = function(e) {
//S_YQWG6UX3CK begins 
    if (!e) e=window.event;

    // If not a click forget
    //S_YQWG6UX3CKf_1 if (e.keyCode == undefined  &&  e.keyCode != 0) {
    //S_YQWG6UX3CKf_1     return;
    //S_YQWG6UX3CKf_1 }

    /**
      * Event handler for onClick for document, to close current WTimeChooser when the user clicks outside WTimeChooser
      */
    var tag = getEventTarget( e );

    // For accessibilty clicks the tag is the A(nchor), get the image.
    var tag1 = tag;
    if(tag1.nodeName != "IMG"  &&  tag1.childNodes.length != 0)  {
        tag1 = tag.childNodes[0];
    }

    if(tag1.nodeName == "IMG")  {
        if(tag1.className != null && tag1.className == "lwptcClassId")  {
            // Should be in if tc valid;
            return false;
        }
    }

    //if (tag.className != 'lwptcClassId') {
      //var result = getTimeChooser( e );
      //if ( result == null || result == undefined ) { 
            hideAllTc(this);
            return true;
      //}
    //}
    //return false;   
//S_YQWG6UX3CK ends  
}

//S_YQWG6UX3CK begins 
/**
 * Finds the time chooser component that generated the event.
 * event - the event object
 */
getTimeChooser=function(event) {
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
//S_YQWG6UX3CK ends 