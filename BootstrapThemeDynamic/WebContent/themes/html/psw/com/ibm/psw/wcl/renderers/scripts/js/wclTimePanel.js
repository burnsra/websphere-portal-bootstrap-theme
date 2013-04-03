/*********************************************************** {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM                                               
* Tivoli Presentation Services                                   
*                                                    
* (C) Copyright IBM Corp. 2000,2003 All Rights Reserved.                            
*                                                               
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
************************************************************ {COPYRIGHT-END} ***/

/**
 * @param secureURL URL pointing to content served using HTTPS. This URL will
 *        be used to set the src attribute of a transparent IFRAME that is used
 *        to fix bleeding of HTMLSelectElements through absolutely
 *        positioned HTMLElements in Internet Explorer. If using a secure
 *        server, this URL must be specified at the risk of experiencing
 *        "Secure/Non-Secure" warnings issued by the browser. The URL must
 *        be secure and from the same domain as the containing window/frame.
 */
function TimeChooser(id, textID, buttonID, is24hr, showSeconds, isLTR, tabIndex, secureURL) { 
    this.id = id;
    this.textID = textID;
    this.buttonID = buttonID;
    this.is24hr = is24hr;
    this.isOrderTimeAmpm = true;
    this.showSeconds = showSeconds;
    this.isLTR = isLTR;
    this.tabIndex = tabIndex; 
    this.secureURL = ( secureURL ? secureURL : null ); 
    this.title = null;
    this.layer = null;

    // stores text
    this.text = new Array();
    // stores style sheets
    this.styleSheets = new Array();
    // stores elements by id
    this.elementsById = new Array();

    //functions
    this.showTimeChooser = TimeChooser_show;
    this.hideTimeChooser = TimeChooser_hide;
    this.setText = TimeChooser_setText;
    this.getText = TimeChooser_getText;
    this.makeId = TimeChooser_makeId;
    this.getElementById = TimeChooser_getElementById;
    this.addStyleSheet = TimeChooser_addStyleSheet;
    this.createTimeDiv = TimeChooser_createTimeDiv;
    this.parseTime = TimeChooser_parseTime;
    this.parseTimeShort = TimeChooser_parseTimeShort;
    this.formatNumber = TimeChooser_formatNumber;
}

function TimeChooser_makeId(id, element) {
    var eid = this.id + "_" + id;
    if (element != null) {
        this.elementsById[eid] = element;
    }
    return eid;
}

function TimeChooser_getElementById(id, aDoc) {
    if (aDoc != null)
        return aDoc.getElementById(id);
    else
        return document.getElementById(id);
}


function TimeChooser_setText(textKey, textObj) {
    this.text[textKey] = textObj;
}

function TimeChooser_getText(textKey) {
    var rText = this.text[textKey];
    if (rText == null) {
        rText = textKey;
    }
    return rText;
}

function TimeChooser_addStyleSheet(css) {
    this.styleSheets[this.styleSheets.length] = css;
}

function TimeChooser_hide() {
  if (this.layer != null)
    this.layer.setVisible(false);
}

function TimeChooser_show(shouldFocus) {
	// Parse textfield first to detect the initial time format.
	var doc = null;
	var textfield = this.getElementById(this.textID, doc);
	var timevalues
	if (this.showSeconds)
	{
		// Long format
		timevalues = this.parseTime(textfield.value);
	}
	else
	{
		// Short format
		timevalues = this.parseTimeShort(textfield.value);
	}
   if (this.layer == null || !this.layer.isRendered()) { 
      this.layer = WLayerFactory.createWLayer(this.id, self, false, true, false, this.secureURL ); 
      this.layer.setHTMLElement(this.createTimeDiv());
      this.layer.render();
   }
   else if (this.layer != null && this.layer.isVisible()) { 
       this.hideTimeChooser();
       return;
   }

   var posX = WUtilities.getLeft(textfield, true);
   var posY = WUtilities.getTop(textfield, true) + WUtilities.getHeight(textfield, true);

   if (!this.isLTR)
       posX -= this.layer.getDimension().getWidth() - WUtilities.getWidth(textfield);

   this.getElementById(this.makeId("hours"), doc).value = timevalues[0];
   this.getElementById(this.makeId("minutes"), doc).value = timevalues[1];
   this.getElementById(this.makeId("seconds"), doc).value = timevalues[2];
   if (!this.is24hr) {
       var ampm = this.getElementById(this.makeId("ampm"), doc);
       ampm.selectedIndex = ampm.options[1].value.toUpperCase() == timevalues[3].toUpperCase() ? 1 : 0;
   }
   this.layer.setPosition(new Position(posX, posY));
   this.layer.setVisible(true);
   // This is a work around to ensure that the focus is called only on the second time to avoid page skip
   if (shouldFocus == true)
   {
	  if(this.isLTR && !this.is24hr && !this.isOrderTimeAmpm)
	  {
		  this.getElementById(this.makeId("ampm"), doc).focus();
	  }
	  else
	  {
		  this.getElementById(this.makeId("hours"), doc).focus();
	  }
   }
}

function TimeChooser_createTimeDiv() {
   var div = document.createElement("DIV");
   var hidden = document.createElement("INPUT");
   var table = document.createElement("TABLE");
   var thead = document.createElement("THEAD");
   var tbody = document.createElement("TBODY");
   var tfoot = document.createElement("TFOOT");
   var ctable = document.createElement("TABLE"); 
   var cbody = document.createElement("TBODY"); 
   var tr = document.createElement("TR");
   var td = document.createElement("TD");
   var nbsp = document.createElement("SPAN");
   var ok = document.createElement("INPUT");
   var cancel = document.createElement("INPUT");
   var hours = document.createElement("INPUT");
   var minutes = document.createElement("INPUT");
   var seconds = document.createElement("INPUT");
   var ampm = document.createElement("SELECT");
   var option = document.createElement("OPTION");

   div.id = this.makeId("timeDiv", div);
   // allow for dynamic sizing in Netscape and IE
   if ( !WClient.isBrowserMozilla() || WClient.isBrowserNetscape() ) 
   {
       div.style.width = "0%";
   }

   ok.type = "button";
   ok.value = this.getText("OK");
   ok.className="b1";   
   ok.onmouseover = TimeChooser_buttonOverHandler;
   ok.onmouseout = TimeChooser_buttonOutHandler;
   ok.onclick = TimeChooser_buttonOkHandler;
   cancel.type = "button";
   cancel.value = this.getText("CANCEL");
   cancel.className="b1";  
   cancel.onmouseover = TimeChooser_buttonOverHandler;
   cancel.onmouseout = TimeChooser_buttonOutHandler;
   cancel.onclick = TimeChooser_buttonCancelHandler;
   hours.type = "text";
   hours.size = 2;
   hours.maxLength = 2;
   hours.className="te1"; 
   hours.id = this.makeId("hours", hours);
   minutes.type = "text";
   minutes.size = 2;
   minutes.maxLength = 2;
   minutes.className="te1"; 
   minutes.id = this.makeId("minutes", minutes);
   seconds.type = this.showSeconds ? "text" : "hidden";
   seconds.size = "2";
   seconds.maxLength = 2;
   seconds.className="te1"; 
   seconds.id = this.makeId("seconds", seconds);
   ampm.className="cb1";    
   ampm.id = this.makeId("ampm", ampm);

   option.innerHTML = this.getText("AM");
   option.value = this.getText("AM");
   ampm.appendChild(option);
   option = document.createElement("OPTION");
   option.innerHTML = this.getText("PM");
   option.value = this.getText("PM");
   ampm.appendChild(option);

   if (this.tabIndex != 0) { 
       ok.tabIndex = this.tabIndex;
       cancel.tabIndex = this.tabIndex;
       hours.tabIndex = this.tabIndex;
       minutes.tabIndex = this.tabIndex;
       seconds.tabIndex = this.tabIndex;
       ampm.tabIndex = this.tabIndex;
   }

   hidden.type = "hidden";
   hidden.value = this.id;
   div.appendChild(hidden);

   table.border = 0;
   table.cellSpacing = 0;
   table.cellPadding = 0;
   table.dir = this.isLTR ? "LTR" : "RTL";
   table.className="tc4"; 
   nbsp.innerHTML = "&nbsp;";

   div.appendChild(table);
   table.appendChild(thead);

   
   ctable.border = 0;
   ctable.cellSpacing = 0;
   ctable.cellPadding = 0;
   ctable.dir = "LTR";    
   ctable.className = "tc5";     
   tr = document.createElement("TR");
   td = document.createElement("TD");
   td.className = "tc6";   
   table.appendChild(thead);

   thead.appendChild(tr);
   tr.appendChild(td);

   
   td.appendChild(ctable);
   ctable.appendChild(cbody);
   tr = document.createElement("TR");
   td = document.createElement("TD");
   cbody.appendChild(tr);
   tr.appendChild(td);
   td.className="tc1";  
  if (!this.isLTR) {
   td.innerHTML = this.getText("&nbsp;");

   td = document.createElement("TD");
   tr.appendChild(td);
   td.innerHTML = this.getText("HOURS");
   td.className="tc1"; 
   
   td = document.createElement("TD");
   tr.appendChild(td);
   td.innerHTML = this.getText("MINUTES");
   td.className="tc1"; 


   if (this.showSeconds) {
       td = document.createElement("TD");
       tr.appendChild(td);
       td.innerHTML = this.getText("SECONDS");
       td.className="tc1"; 
   }
   


   tr = document.createElement("TR");

   td = document.createElement("TD");
   td.className="tc2"; 
   ctable.appendChild(tbody); 
   tbody.appendChild(tr)
   tr.appendChild(td);
   if (!this.is24hr)
       td.appendChild(ampm);
   else                          
       td.innerHTML = "&nbsp;";


   td = document.createElement("TD");
   td.className="tc2"; 
   tr.appendChild(td);
   td.appendChild(hours);

   td = document.createElement("TD");
   td.className="tc2"; 
   tr.appendChild(td);  
   td.appendChild(minutes);

   if (this.showSeconds) {
       td = document.createElement("TD");
       td.className="tc2"; 
       tr.appendChild(td);
   }
   td.appendChild(seconds);

 } 
 else 
{
	 // LtoR

	 if (!this.is24hr && !this.isOrderTimeAmpm)
	 {
		 // if time later, empty headline for ampm
		 td.innerHTML = "&nbsp;";

		 // Then hours headline td
		 td = document.createElement("TD");
		 tr.appendChild(td);
		 td.className="tc1"; 
	 }

   td.innerHTML = this.getText("HOURS");

   td = document.createElement("TD");
   tr.appendChild(td);
   td.innerHTML = this.getText("MINUTES");
   td.className="tc1"; 

   if (this.showSeconds) {
       td = document.createElement("TD");
       tr.appendChild(td);
       td.innerHTML = this.getText("SECONDS");
       td.className="tc1"; 
   }
   
	 if (!this.is24hr && this.isOrderTimeAmpm)
	 {
		 //empty headline for ampm tag (order is time first)
		 td = document.createElement("TD");
		 tr.appendChild(td);
		 td.innerHTML = "&nbsp;";
		 td.className="tc1";
	 }

	 //
	 // Second TR section : Actual input field
	 //
   tr = document.createElement("TR");
   
   if (!this.isOrderTimeAmpm)
   {
	   //ampm first
	   td = document.createElement("TD");
	   td.className="tc2"; 
	   tr.appendChild(td);
	   if (!this.is24hr)
		   td.appendChild(ampm);
	   else                          
		   td.innerHTML = "&nbsp;";
   }
	 
   td = document.createElement("TD");
   td.className="tc2"; 
   ctable.appendChild(tbody); 
   tbody.appendChild(tr)
   tr.appendChild(td);
   td.appendChild(hours);

   td = document.createElement("TD");
   td.className="tc2"; 
   tr.appendChild(td);
   td.appendChild(minutes);

   if (this.showSeconds) {
       td = document.createElement("TD");
       td.className="tc2"; 
       tr.appendChild(td);
   }
   td.appendChild(seconds);

   if (this.isOrderTimeAmpm)
   {
	   //ampm later
	   td = document.createElement("TD");
	   td.className="tc2"; 
	   tr.appendChild(td);
	   if (!this.is24hr)
		   td.appendChild(ampm);
	   else                          
		   td.innerHTML = "&nbsp;";
   }
}
   tr = document.createElement("TR");
   td = document.createElement("TD");
   td.className="tc3"; 
   table.appendChild(tfoot);
   tfoot.appendChild(tr);
   tr.appendChild(td);
   td.colSpan = this.showSeconds ? 4 : 3;
   td.alignment = "left";
   td.appendChild(ok);
   td.appendChild(nbsp);
   td.appendChild(cancel);

   return div;
}

/**
 * Parse time string of short formats.
 * @param sTime e.g. 10:23 AM
 * @return array of {HH, MM, "00", aa}. If am/pm is not specified, set it "AM".
 */
function TimeChooser_parseTimeShort(sTime) {
	// Define default values
    var timefields = new Array("00", "00", "00", "AM");
    // Clear any spaces
    var regSpace = /\s+/g;
    sTime = sTime.replace(regSpace, '')
    
    if (sTime != null && sTime.length > 0) {
    	// Prepare RegExp objects
    	var regTimeFirst = /(\d+):(\d+)(\D+)/;  	// HH:MM a
    	var regTimeLater = /(\D+)(\d+):(\d+)/;		// a HH:MM
    	var regTimeOnly = /(\d+):(\d+)/;			// HH:MM
    	
    	var parms = null;
    	if ((parms = regTimeFirst.exec(sTime)) != null)
    	{
    		timefields[0] = this.formatNumber(parms[1]);
    		timefields[1] = this.formatNumber(parms[2]);
    		timefields[3] = parms[3].replace(regSpace, '');
    		this.isOrderTimeAmpm = true;
    	}
    	else if ((parms = regTimeLater.exec(sTime)) != null)
    	{
    		timefields[0] = this.formatNumber(parms[2]);
    		timefields[1] = this.formatNumber(parms[3]);
    		timefields[3] = parms[1].replace(regSpace, '');
    		this.isOrderTimeAmpm = false;
    	}
    	else if ((parms = regTimeOnly.exec(sTime)) != null)
    	{
    		// Backup plan in case no AM/PM specified
    		timefields[0] = this.formatNumber(parms[1]);
    		timefields[1] = this.formatNumber(parms[2]);
    	}
    }

    return timefields;
}

function TimeChooser_parseTime(sTime) {
    var timefields = new Array("00", "00", "00", "AM");

    if (sTime != null && sTime.length > 0) {
        var re = /:/g;
        var parms = sTime.replace(re, " ").split(" ");

        if (parms.length > 0)
            timefields[0] = this.formatNumber(parms[0]);

        if (parms.length > 1)
            timefields[1] = this.formatNumber(parms[1]);

        if (parms.length > 2 && this.showSeconds)
            timefields[2] = this.formatNumber(parms[2]);

        if (parms.length > 0 && !this.is24hr)
            timefields[3] = parms[parms.length - 1];
    }

    return timefields;
}

function TimeChooser_formatNumber(number) {
   var anumber = parseInt(number, 10);
   var fnumber = "00" + (isNaN(anumber) ? "" : anumber);

   return fnumber.substring(fnumber.length-2);
}

function TimeChooser_formatTime(timechooser, hours, minutes, seconds, ampm) {
   var time = timechooser.formatNumber(hours) + ":" + timechooser.formatNumber(minutes);

   if (timechooser.showSeconds)
       time += ":" + timechooser.formatNumber(seconds);

   if (!timechooser.is24hr)
   {
	   if (timechooser.isOrderTimeAmpm)
	   {
		   time += " " + ampm;
	   }
	   else
	   {
		   time = ampm + time;
	   }
   }

   return time;
}

function TimeChooser_getTimeChooser(event) {
    var tc = null;
    var tag = getEventTarget(event);
    while (tag != null && tag.tagName != "DIV") {
        tag = tag.parentNode;
        if (tag != null && tag.tagName == "DIV") {
            tc = eval(tag.childNodes[0].value);
            break;
        }
    }
    return tc;
}

function validateTime(hours, minutes, seconds)
{
	if (hours != "" && (hours < "00" || hours > "24"))
		return -1;
	if (minutes != "" && (minutes < "00" || minutes > "60"))
		return -1;
	if (seconds != "" && (seconds < "00" || seconds > "60"))
		return -1;
	return 1; 
}

function TimeChooser_buttonOkHandler(event) {
    TimeChooser_buttonOutHandler(event);

    var tc = TimeChooser_getTimeChooser(event);
    if (tc != null) {
        // gather time field values
        var doc = getEventTarget(event).ownerDocument;
        var hours = tc.getElementById(tc.makeId("hours"), doc).value;
        var minutes = tc.getElementById(tc.makeId("minutes"), doc).value;
        var seconds = tc.getElementById(tc.makeId("seconds"), doc ).value;
        var ampm = tc.is24hr ? "" : tc.getElementById(tc.makeId("ampm"), doc).value;
        alert("hours = " + hours);
        alert("minutes = " + minutes);
        alert("seconds = " + seconds);
		var vt = validateTime(hours, minutes, seconds);
		if (vt == 1)
		{
        // update the time text field
        var timeInput = tc.getElementById(tc.textID);
        timeInput.value = TimeChooser_formatTime(tc, hours, minutes, seconds, ampm);

        // cancel the dialog
        TimeChooser_buttonCancelHandler(event);
        }
        else
        {
        	alert("Please make sure time is correct before continue...");
        }
    }
    else
       alert("TimeChooser_buttonOkHandler - null");
}


function TimeChooser_buttonCancelHandler(event) {
    TimeChooser_buttonOutHandler(event);

    var tc = TimeChooser_getTimeChooser(event);
    if (tc != null) {
        tc.hideTimeChooser();

        // set focus on the time button
        var timeButton = tc.getElementById(tc.buttonID);
        timeButton.focus();
    }
    else
       alert("TimeChooser_buttonCancelHandler - null")
}

function TimeChooser_buttonOverHandler(event) {
    var tag = getEventTarget(event);
    if (tag != null) {
        tag.className = "b2";  
        if (document.all)
            tag.style.height = "100%";
    }
}

function TimeChooser_buttonOutHandler( event ) {
    var tag = getEventTarget(event);
    if (tag != null) {
        tag.className = "b1";   
        if (document.all)
            tag.style.height = "100%";
    }
}
