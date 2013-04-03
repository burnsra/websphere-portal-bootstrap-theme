/**
 * dateFormat.js,v 1.1 2003/06/19 20:38:59 hokamoto Exp
 *
 * (C) Copyright International Business Machines Corp., 2001-2004
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U. S. Copyright Office.
 */

/**
 * SimpleDateFormat
 * SimpleDateFormat is a JavaScript object for formatting and parsing dates.
 * It allows for formatting (date -> text), parsing (text -> date).
 * SimpleDateFormat accepts the date format pattern for formatting and parsing.
 * See a document about JDK's java.text.SimpleDateFormat for details.
 *
 * Sample:
 *
 *     // setup locale-sensitive date format symbols.
 *     var dfs = new DateFormatSymbols();
 *     dfs.eras = new Array("BC", "AD");
 *     dfs.ampmStrings = new Array("AM", "PM");
 *     dfs.months = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
 *     dfs.shortMonths = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
 *     dfs.weekdays = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
 *     dfs.shortWeekdays = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
 *
 *     // setup SimpleDateFormat object
 *     var pattern = "yyyy.MM.dd G 'at' hh:mm:ss a";
 *     var sdf = new SimpleDateFormat();
 *     sdf.pattern = pattern;
 *     sdf.dateFormatSymbols = dfs;
 *
 *     var date = new Date();
 *     var cal = new GregorianCalendar();
 *     cal.setTime(date);
 *     document.write(sdf.format(cal));        // convert calendar -> text
 *
 *     document.write("<br>");
 *
 *     var datetext = "2003.12.14 AD at 10:52:23 PM";
 *     sdf.parse(datetext, cal);      // convert text -> calendar
 *     date = cal.getTime();
 *     document.write(date);
 *
 */

// DateFormatSymbols

/**
 * Constructor of DateFormatSymbols for SimpleDateFormat
 * @return DateFormatSymbols object
 */
DateFormatSymbols = function() {
    this.ampmStrings = null;
    this.eras = null;
    this.months = null;
    this.shortMonths = null;
    this.weekdays = null;
    this.shortWeekdays = null;
    this.zoneStrings = null;
};



// SimpleDateFormat

/**
 * Constructor of SimpleDateFormat.
 * Setup pattern and dateFormatSymbols after calling this constructor.
 * @return SimpleDateFormat object
 */
SimpleDateFormat = function() {

    /** public */

    this.pattern = "";
    this.dateFormatSymbols = null;


    /** private */

    // function table for format() to convert date to text
    this.formatFunc = new Array(20);
    this.formatFunc['G'] = SimpleDateFormat.formatEra;
    this.formatFunc['y'] = SimpleDateFormat.formatYear;
    this.formatFunc['u'] = SimpleDateFormat.formatYear;
    this.formatFunc['M'] = SimpleDateFormat.formatMonthInYear;
    this.formatFunc['d'] = SimpleDateFormat.formatDayInMonth;
    this.formatFunc['h'] = SimpleDateFormat.formatHourInAmPm;
    this.formatFunc['H'] = SimpleDateFormat.formatHourInDay;
    this.formatFunc['m'] = SimpleDateFormat.formatMinuteInHour;
    this.formatFunc['s'] = SimpleDateFormat.formatSecondInMinute;
    this.formatFunc['S'] = SimpleDateFormat.formatMillisecond;
    this.formatFunc['E'] = SimpleDateFormat.formatDayInWeek;
    this.formatFunc['D'] = SimpleDateFormat.formatDayInYear;
    this.formatFunc['F'] = SimpleDateFormat.formatDayOfWeekInMonth;
    this.formatFunc['w'] = SimpleDateFormat.formatWeekInYear;
    this.formatFunc['W'] = SimpleDateFormat.formatWeekInMonth;
    this.formatFunc['a'] = SimpleDateFormat.formatAmPmMarker;
    this.formatFunc['k'] = SimpleDateFormat.formatHourInDay2;
    this.formatFunc['K'] = SimpleDateFormat.formatHourInAmPm2;
    this.formatFunc['z'] = SimpleDateFormat.formatTimezone;

    // function table for parse() to convert text to date
    this.parseFunc = new Array(20);
    this.parseFunc['G'] = SimpleDateFormat.parseEra;
    this.parseFunc['y'] = SimpleDateFormat.parseYear;
    this.parseFunc['u'] = SimpleDateFormat.parseYear;
    this.parseFunc['M'] = SimpleDateFormat.parseMonthInYear;
    this.parseFunc['d'] = SimpleDateFormat.parseDayInMonth;
    this.parseFunc['h'] = SimpleDateFormat.parseHourInAmPm;
    this.parseFunc['H'] = SimpleDateFormat.parseHourInDay;
    this.parseFunc['m'] = SimpleDateFormat.parseMinuteInHour;
    this.parseFunc['s'] = SimpleDateFormat.parseSecondInMinute;
    this.parseFunc['S'] = SimpleDateFormat.parseMillisecond;
    this.parseFunc['E'] = SimpleDateFormat.parseDayInWeek;
//  this.parseFunc['D'] = SimpleDateFormat.parseDayInYear;               /* not implemented */
//  this.parseFunc['F'] = SimpleDateFormat.parseDayOfWeekInMonth;        /* not implemented */
//  this.parseFunc['w'] = SimpleDateFormat.parseWeekInYear;              /* not implemented */
//  this.parseFunc['W'] = SimpleDateFormat.parseWeekInMonth;             /* not implemented */
    this.parseFunc['a'] = SimpleDateFormat.parseAmPmMarker;
    this.parseFunc['k'] = SimpleDateFormat.parseHourInDay2;
    this.parseFunc['K'] = SimpleDateFormat.parseHourInAmPm2;
//  this.parseFunc['z'] = SimpleDateFormat.parseTimezone;             /* not implemented */

    this.contiguousSymbols = false;
}

/**
 * Formats a Date into a date/time stri
 * @param Calendar obj or Calendar obj
 * @return the formatted time stri
 */
SimpleDateFormat.prototype.format = function(cal) {

    if (!cal || this.pattern.length == 0)
        return "";

    var dateText = "";
    var c;
    var width;
    var formatfunc;
    var stateEscaped = false;

    for (var offset = 0; offset < this.pattern.length; offset += width) {

        c = this.pattern.charAt(offset);

        // count length of date pattern chars
        for (width = 0; width + offset < this.pattern.length && this.pattern.charAt(width + offset) == c; width++)
            ;

        if (c == "'") {

            // replace "''" with "'"
            if (width > 1) {
                var len = Math.floor(width / 2);
                for (var i = 0; i < len; i++) {
                    dateText += "'";
                }
                offset += len * 2;
                width -= len * 2;
            }

            // change the escape state to escape between quote chars
            if (width == 1) {
                 if (stateEscaped == true)
                     stateEscaped = false;
                 else
                     stateEscaped = true;
                 continue;
            }
        }

        if (stateEscaped == false) {
            formatfunc = this.formatFunc[c];
            if (formatfunc != undefined) {
                // this is a pattern text, convert it to the real date text
                dateText += formatfunc(this, cal, width);
            } else {
                // this is not pattern text.just output as is.
                for (var i = 0; i < width; i++)
                    dateText += c;
            }
        } else {
            // escape string between quote chars
            for (var i = 0; i < width; i++)
                dateText += c;
        }

    }

    return dateText;
}

/**
 * Parse a date/time stri
 * @param text             the date/time string to be parsed
 * @param cal              calendar object to update (optional)
 * @return JavaScript Date object, or NaN if the date text can not be parsed
 */
SimpleDateFormat.prototype.parse = function(text, cal) {

    if (text == null || text == undefined || text.length == 0 || this.pattern.length == 0)
        return NaN;

    // if not text, get the text
    if (typeof(text) != 'string')
        text = text.toString();

    var textpos = 0;
    var c;
    var width;
    var parsefunc;
    var stateEscaped = false;
    var n;

    // if there is no calendar to update, instantiate cal from GregorianCalendar
    if (cal == null || cal == undefined) {
        cal = new GregorianCalendar();
    }

    for (var offset = 0; offset < this.pattern.length; offset += width) {

        c = this.pattern.charAt(offset);

        // count length of date pattern chars
        for (width = 0; width + offset < this.pattern.length && this.pattern.charAt(width + offset) == c; width++)
            ;

        if (c == "'") {

            // recalc offset & width
            if (width > 1) {
                var len = Math.floor(width / 2);
                offset += len * 2;
                width -= len * 2;
            }

            // change the escape state to escape between quote chars
            if (width == 1) {
                 if (stateEscaped == true) {
                     stateEscaped = false;
                 } else {
                     stateEscaped = true;
                 }
                 continue;
            }
        }

        if (stateEscaped == false && c != "'")
            parsefunc = this.parseFunc[c];
        else
            parsefunc = undefined;
        if (parsefunc != undefined) {
            /*
             * !!! Hack to support for ISO 8601 compact pattern !!!
             * ISO 8601 compact pattern does not have any separator between symbols.
             * contiguousSymbols flag is on, when there is no separator between date symbol tokens.
             */
            var ch;
            var nSymbols = 0;
            for (var i = offset; i < this.pattern.length; i++) {     // count num of contiguous symbols
                if (this.parseFunc[this.pattern.charAt(i)] == undefined)
                    break;
                nSymbols++;
            }
            var nNumbers = 0;
            for (var i = textpos; i < text.length; i++) {            // count num of contiguous numbers
                ch = text.charAt(i);
                if (isNaN(ch))
                    break;
                nNumbers++;
            }
            // set true if no separator between symbols
            if (nSymbols == nNumbers)
                this.contiguousSymbols = true;
            else
                this.contiguousSymbols = false;


            // Pattern symbol found, convert it to the real date text
            // the output textpos indicates the next position to parse.
            textpos = parsefunc(this, text, textpos, width, cal);
            if (isNaN(textpos))
                return NaN;

        } else {

            // handle non pattern synbol text
            for (var i = 0; i < width; i++) {
                if (c.toLowerCase() != text.charAt(textpos + i).toLowerCase()) {
                    return NaN;
				}
			}
            textpos += width;
        }

    }

    // return date object
    var date = cal.getTime();
    if (date == null)
        return NaN;
    return date;
}



// local functions






SimpleDateFormat.paddingZero = function(text, width) {

    if (text == null || text == undefined)
        return "";

    // change the format to string, if it is not stri
    if (typeof(text) != "string")
        text = text.toString();

    if (text.length >= width)
        return text;
    len = width - text.length;
    for (var i = 0; i < len; i++) {
        text = '0' + text;
    }
    return text;
}

SimpleDateFormat.formatEra = function(obj, cal, width) {
    var index = cal.get("ERA");
    var eras = obj.dateFormatSymbols.eras;
    if (!eras || !(typeof(eras) == "object" && eras.constructor == Array))
        return "";
    if (index < 0 || index >= eras.length )
        return "";
    return eras[index];
}

SimpleDateFormat.formatYear = function(obj, cal, width) {
    var year = cal.get("YEAR").toString();
    if (width == 2 && year.length >= 2)
           return year.slice(year.length - 2, year.length);
    return SimpleDateFormat.paddingZero(year, width);
}

SimpleDateFormat.formatMonthInYear = function(obj, cal, width) {
    var month = cal.get("MONTH");
    if (width < 3)
        return SimpleDateFormat.paddingZero(month+1, width, '0');    // number form

    if (width == 3)
        months = obj.dateFormatSymbols.shortMonths;   // short text form
    else
        months = obj.dateFormatSymbols.months;   // full text form
    if (!months || !(typeof(months) == "object" && months.constructor == Array) || month >= months.length)
        return "";
    return months[month];
}

SimpleDateFormat.formatDayInMonth = function(obj, cal, width) {
    var day = cal.get("DATE")
    return SimpleDateFormat.paddingZero(day, width);
}

// hour in am/pm (1~12)
SimpleDateFormat.formatHourInAmPm = function(obj, cal, width) {
    var hour = cal.get("HOUR");
    if (!hour)
        hour = 12;
    return SimpleDateFormat.paddingZero(hour, width);
}

// hour in day (0~23)
SimpleDateFormat.formatHourInDay = function(obj, cal, width) {
    var hour = cal.get("HOUR_OF_DAY");
    return SimpleDateFormat.paddingZero(hour, width);
}

SimpleDateFormat.formatMinuteInHour = function(obj, cal, width) {
    var min = cal.get("MINUTE");
    return SimpleDateFormat.paddingZero(min, width);
}

SimpleDateFormat.formatSecondInMinute = function(obj, cal, width) {
    var sec = cal.get("SECOND");
    return SimpleDateFormat.paddingZero(sec, width);
}

SimpleDateFormat.formatMillisecond = function(obj, cal, width) {
    var msec = cal.get("MILLISECOND");
    return SimpleDateFormat.paddingZero(msec, width);
}

SimpleDateFormat.formatDayInWeek = function(obj, cal, width) {
    var weekday = cal.get("DAY_OF_WEEK");
    var weekdays;
    if (width >= 4)
        weekdays = obj.dateFormatSymbols.weekdays;   // full text form
    else
        weekdays = obj.dateFormatSymbols.shortWeekdays;   // short text form
    if (!weekdays || !(typeof(weekdays) == "object" && weekdays.constructor == Array) || weekday >= weekdays.length)
        return "";
    return weekdays[weekday];
}

SimpleDateFormat.formatDayInYear = function(obj, cal, width) {
    var day = cal.get("DAY_OF_YEAR");
    return SimpleDateFormat.paddingZero(day, width);
}

SimpleDateFormat.formatDayOfWeekInMonth = function(obj, cal, width) {
    var weekdays = cal.get("DAY_OF_WEEK_IN_MONTH");
    return SimpleDateFormat.paddingZero(weekdays, width);
}

SimpleDateFormat.formatWeekInYear = function(obj, cal, width) {
    return "";
}

SimpleDateFormat.formatWeekInMonth = function(obj, cal, width) {
    return "";
}

SimpleDateFormat.formatAmPmMarker = function(obj, cal, width) {
    var ampmStrings = obj.dateFormatSymbols.ampmStrings;
    if (!ampmStrings || !(typeof(ampmStrings) == "object" && ampmStrings.constructor == Array))
        return "";
    var index = cal.get("AM_PM");
    if (index < 0 || index >= ampmStrings.length)
        return "";
    return ampmStrings[index];
}

// hour in day (1~24)
SimpleDateFormat.formatHourInDay2 = function(obj, cal, width) {
    var hour = cal.get("HOUR_OF_DAY");
    if (!hour)
        hour = 24;
    return SimpleDateFormat.paddingZero(hour, width);
}

// hour in am/pm (0~11)
SimpleDateFormat.formatHourInAmPm2 = function(obj, cal, width) {
    var hour = cal.get("HOUR");
    if (hour == 12)
        hour = 0;
    return SimpleDateFormat.paddingZero(hour, width);
}

SimpleDateFormat.formatTimezone = function(obj, cal, width) {

    var offset = cal.get("ZONE_OFFSET");
    var plusminus;
    if (offset > 0)
        plusminus = "+";
    else
        plusminus = "-";
    offset = Math.abs(offset);
    var h = SimpleDateFormat.paddingZero(parseInt(offset / 60), 2);
    var m = SimpleDateFormat.paddingZero(offset % 60, 2);
    return "GMT" + plusminus + h + ":" + m;
}



SimpleDateFormat.countNumberText = function(text) {
    if (typeof(text) != 'string')
        text = text.toString();
    var i;
    for (i = 0; i < text.length; i++) {
        c = text.charAt(i);
        if (c.charCodeAt(0) < '0'.charCodeAt(0) || '9'.charCodeAt(0) < c.charCodeAt(0))
            break;
    }
    return i;
}


SimpleDateFormat.parseEra = function(obj, text, textpos, width, cal) {
    var eras = obj.dateFormatSymbols.eras;
    if (!eras || (!(typeof(eras) == "object" && eras.constructor == Array)))
        return (NaN);
    for (var i = 0; i < eras.length; i++)  {
        if (text.substr(textpos, eras[i].length).toLowerCase() == eras[i].toLowerCase()) {
            cal.set("ERA", i);
            return (textpos + eras[i].length);
        }
    }
    return (NaN);
}

SimpleDateFormat.parseYear = function(obj, text, textpos, width, cal) {

    var i;
    var ntext;
    var yeartext = "";
    var year;
    var len = text.length;

    // if flag is on, get same bytes of token as bytes of symbols
    if (obj.contiguousSymbols == true) {
        if (textpos + width < len) {
            len = textpos + width;
        }
    }

    for (i = textpos; i < len; i++) {
        ntext = text.charAt(i);
        if (isNaN(parseInt(ntext, 10)))
            break;
        yeartext += ntext;
    }
    if (yeartext.length == 0)
        return (NaN);
    year = parseInt(yeartext, 10);
    if (isNaN(year))
        return (NaN);

    cal.set("YEAR",year);
    return (textpos + yeartext.length);
}

SimpleDateFormat.parseMonthInYear = function(obj, text, textpos, width, cal) {

    if (width >= 3) {

        // text
        var months;
        if (width >= 4)
            months = obj.dateFormatSymbols.months;
        else
            months = obj.dateFormatSymbols.shortMonths;

        // check if months is valid or not
        if (!months || !(typeof(months) == "object" && months.constructor == Array))
            return (NaN);

        for (var i = 0; i < months.length; i++)  {
            if (text.substr(textpos, months[i].length).toLowerCase() == months[i].toLowerCase()) {
                cal.set("MONTH", i);
                return (textpos + months[i].length);
            }
        }
        return (NaN);
    }

    // number

    // if flag is on, get same bytes of token as bytes of symbols
    var len;
    if (obj.contiguousSymbols == true)
        var currentText = text.substr(textpos, width);
    else
        var currentText = text.substr(textpos);
    var n = parseInt(currentText, 10);
    if (isNaN(n))
        return (NaN);
    cal.set("MONTH", n-1);
    return (textpos + SimpleDateFormat.countNumberText(currentText));
}

SimpleDateFormat.parseDayInMonth = function(obj, text, textpos, width, cal) {

    // if flag is on, get same bytes of token as bytes of symbols
    var len;
    if (obj.contiguousSymbols == true)
        var currentText = text.substr(textpos, width);
    else
        var currentText = text.substr(textpos);

    var n = parseInt(currentText, 10);
    if (isNaN(n))
        return (NaN);
    cal.set("DATE", n);
    return (textpos + SimpleDateFormat.countNumberText(currentText));
}

SimpleDateFormat.parseHourInAmPm = function(obj, text, textpos, width, cal) {

    // if flag is on, get same bytes of token as bytes of symbols
    var len;
    if (obj.contiguousSymbols == true)
        var currentText = text.substr(textpos, width);
    else
        var currentText = text.substr(textpos);
    var n = parseInt(currentText, 10);
    if (isNaN(n))
        return (NaN);
    cal.set("HOUR", n);

    return (textpos + SimpleDateFormat.countNumberText(currentText));
}

SimpleDateFormat.parseHourInDay = function(obj, text, textpos, width, cal) {

    // if flag is on, get same bytes of token as bytes of symbols
    var len;
    if (obj.contiguousSymbols == true)
        var currentText = text.substr(textpos, width);
    else
        var currentText = text.substr(textpos);

    var n = parseInt(currentText, 10);
    if (isNaN(n))
        return (NaN);
    cal.set("HOUR_OF_DAY", n);
    return (textpos + SimpleDateFormat.countNumberText(currentText));
}

SimpleDateFormat.parseMinuteInHour = function(obj, text, textpos, width, cal) {

    // if flag is on, get same bytes of token as bytes of symbols
    var len;
    if (obj.contiguousSymbols == true)
        var currentText = text.substr(textpos, width);
    else
        var currentText = text.substr(textpos);

    var n = parseInt(currentText, 10);
    if (isNaN(n))
        return (NaN);
    cal.set("MINUTE", n);
    return (textpos + SimpleDateFormat.countNumberText(currentText));
}

SimpleDateFormat.parseSecondInMinute = function(obj, text, textpos, width, cal) {

    // if flag is on, get same bytes of token as bytes of symbols
    var len;
    if (obj.contiguousSymbols == true)
        var currentText = text.substr(textpos, width);
    else
        var currentText = text.substr(textpos);

    var n = parseInt(currentText, 10);
    if (isNaN(n))
        return (NaN);
    cal.set("SECOND", n);
    return (textpos + SimpleDateFormat.countNumberText(currentText));
}

SimpleDateFormat.parseMillisecond = function(obj, text, textpos, width, cal) {
    var currentText = text.substr(textpos);
    var n = parseInt(currentText, 10);
    if (isNaN(n))
        return (NaN);
    cal.set("MILLISECOND", n);
    return (textpos + SimpleDateFormat.countNumberText(currentText));
}

SimpleDateFormat.parseDayInYear = function(obj, text, textpos, width, cal) {
    /* not implemented */
    return (NaN);
}

SimpleDateFormat.parseDayOfWeekInMonth = function(obj, text, textpos, width, cal) {
    /* not implemented */
    return (NaN);
}

SimpleDateFormat.parseWeekInYear = function(obj, text, textpos, width, cal) {
    /* not implemented */
    return (NaN);
}

SimpleDateFormat.parseWeekInMonth = function(obj, text, textpos, width, cal) {
    /* not implemented */
    return (NaN);
}

SimpleDateFormat.parseHourInDay2 = function(obj, text, textpos, width, cal) {
    /* hour in day (1~24) */
    var currentText = text.substr(textpos);
    var n = parseInt(currentText, 10);
    if (isNaN(n))
        return (NaN);
    cal.set("HOUR_OF_DAY", n);

    return (textpos + SimpleDateFormat.countNumberText(currentText));
}

SimpleDateFormat.parseHourInAmPm2 = function(obj, text, textpos, width, cal) {
    /* hour in am/pm (0~11) */
    var currentText = text.substr(textpos);
    var n = parseInt(currentText, 10);
    if (isNaN(n))
        return (NaN);
    cal.set("HOUR", n);

    return (textpos + SimpleDateFormat.countNumberText(currentText));
}

SimpleDateFormat.parseDayInWeek = function(obj, text, textpos, width, cal) {
    var weekdays = obj.dateFormatSymbols.weekdays;
    if (width >= 4)
        weekdays = obj.dateFormatSymbols.weekdays;   // full text form
    else
        weekdays = obj.dateFormatSymbols.shortWeekdays;   // short text form
    if (!weekdays || !(typeof(weekdays) == "object" && weekdays.constructor == Array))
        return (NaN);

    for (var i = 0; i < weekdays.length; i++)  {
        if (text.substr(textpos, weekdays[i].length).toLowerCase() == weekdays[i].toLowerCase()) {
            cal.set("DAY_OF_WEEK", i);
            return (textpos + weekdays[i].length);
        }
    }
    return (NaN);
}

SimpleDateFormat.parseAmPmMarker = function(obj, text, textpos, width, cal) {

    var ampms = obj.dateFormatSymbols.ampmStrings;
    if (!ampms || !(typeof(ampms) == "object" && ampms.constructor == Array))
        return (NaN);

    for (var i = 0; i < ampms.length; i++)  {
        if (text.substr(textpos, ampms[i].length).toLowerCase() == ampms[i].toLowerCase()) {

            cal.set("AM_PM", i);
            return (i);
        }
    }
    return (NaN);
}


SimpleDateFormat.getDefaultGregorianFormatSymbols = function() {
    var dfs = new DateFormatSymbols();
    dfs.eras = ["BC", "AD"];
    dfs.ampmStrings = ["AM", "PM"];
    dfs.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    dfs.shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    dfs.weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    dfs.shortWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return dfs;
}

/*
SimpleDateFormat.getDefaultBuddhistFormatSymbols = function() {
    var dfs = new DateFormatSymbols();
    dfs.eras = ["BE"];
    dfs.ampmStrings = ["AM", "PM"];
    dfs.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    dfs.shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    dfs.weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    dfs.shortWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return dfs;
}

SimpleDateFormat.getDefaultIslamicFormatSymbols = function() {
    var dfs = new DateFormatSymbols();
    dfs.eras = ["AH"];
    dfs.ampmStrings = ["AM", "PM"];
    dfs.months = ["Muharram","Safar","Rabi' I","Rabi' II","Jumada I","Jumada I","Rajab","Sha'ban","Ramadan","Shawwal","Dhu'l-Qi'dah","Dhu'l-Hijjah"];
    dfs.shortMonths = ["Muharram","Safar","Rabi' I","Rabi' II","Jumada I","Jumada I","Rajab","Sha'ban","Ramadan","Shawwal","Dhu'l-Qi'dah","Dhu'l-Hijjah"];
    dfs.weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    dfs.shortWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return dfs;
}

SimpleDateFormat.getDefaultJapaneseFormatSymbols = function() {
    var dfs = new DateFormatSymbols();
    dfs.eras = ["\\u660E\\u6CBB", "\\u5927\\u6B63", "\\u662D\\u548C", "\\u5E73\\u6210"];        // Meiji, Taisho, Showa, Heisei
    dfs.ampmStrings = ["\\u5348\\u524d", "\\u5348\\u5f8c"];
    dfs.months = ["1\\u6708", "2\\u6708", "3\\u6708", "4\\u6708", "5\\u6708", "6\\u6708", "7\\u6708", "8\\u6708", "9\\u6708", "10\\u6708", "11\\u6708", "12\\u6708"];
    dfs.shortMonths = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    dfs.weekdays = ["\\u65e5\\u66dc\\u65e5", "\\u6708\\u66dc\\u65e5", "\\u706b\\u66dc\\u65e5", "\\u6c34\\u66dc\\u65e5", "\\u6728\\u66dc\\u65e5", "\\u91d1\\u66dc\\u65e5", "\\u571f\\u66dc\\u65e5"];
    dfs.shortWeekdays = ["\\u65e5", "\\u6708", "\\u706b", "\\u6c34", "\\u6728", "\\u91d1", "\\u571f"];
    return dfs;
}

SimpleDateFormat.getDefaultTaiwaneseFormatSymbols = function() {
    var dfs = new DateFormatSymbols();
    dfs.eras = ["\\u4e2d\\u83ef\\u6c11\\u570b"];
    dfs.ampmStrings = ["\\u4e0a\\u5348", "\\u4e0b\\u5348"];
    dfs.months = ["\\u4e00\\u6708", "\\u4e8c\\u6708", "\\u4e09\\u6708", "\\u56db\\u6708", "\\u4e94\\u6708", "\\u516d\\u6708", "\\u4e03\\u6708", "\\u516b\\u6708", "\\u4e5d\\u6708", "\\u5341\\u6708", "\\u5341\\u4e00\\u6708", "\\u5341\\u4e8c\\u6708"];
    dfs.shortMonths = ["\\u4e00\u6708", "\\u4e8c\u6708", "\\u4e09\u6708", "\\u56db\u6708", "\\u4e94\u6708", "\\u516d\u6708", "\\u4e03\u6708", "\\u516b\u6708", "\\u4e5d\u6708", "\\u5341\u6708", "\\u5341\u4e00\u6708", "\\u5341\u4e8c\u6708"];
    dfs.weekdays = ["\\u661f\u671f\u65e5", "\\u661f\u671f\u4e00", "\\u661f\u671f\u4e8c", "\\u661f\u671f\u4e09", "\\u661f\u671f\u56db", "\\u661f\u671f\u4e94", "\\u661f\u671f\u516d"];
    dfs.shortWeekdays = ["\\u661f\u671f\u65e5", "\\u661f\u671f\u4e00", "\\u661f\u671f\u4e8c", "\\u661f\u671f\u4e09", "\\u661f\u671f\u56db", "\\u661f\u671f\u4e94", "\\u661f\u671f\u516d"];
    return dfs;
}
*/
