/**
 * calendar.js,v 1.1 2003/06/19 20:38:59 hokamoto Exp
 *
 * (C) Copyright International Business Machines Corp., 2001-2004
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U. S. Copyright Office.
 */

/**
 * GregorianCalendar object
 * GregorianCalendar is a JavaScript object to calculate the standard Gregorian calendar used by most of the world.
 *
 * Sample:
 *
 *      var cal = new GregorianCalendar();
 *      var s = ""
 *      s += "ERA: "                  + cal.get("ERA") + "\n";
 *      s += "YEAR: "                 + cal.get("YEAR") + "\n";
 *      s += "MONTH: "                + cal.get("MONTH") + "\n";
 *      s += "WEEK_OF_YEAR: "         + cal.get("WEEK_OF_YEAR") + "\n";
 *      s += "WEEK_OF_MONTH: "        + cal.get("WEEK_OF_MONTH") + "\n";
 *      s += "DATE: "                 + cal.get("DATE") + "\n";
 *      s += "DAY_OF_MONTH: "         + cal.get("DAY_OF_MONTH") + "\n";
 *      s += "DAY_OF_YEAR: "          + cal.get("DAY_OF_YEAR") + "\n";
 *      s += "DAY_OF_WEEK: "          + cal.get("DAY_OF_WEEK") + "\n";
 *      s += "DAY_OF_WEEK_IN_MONTH: " + cal.get("DAY_OF_WEEK_IN_MONTH") + "\n";
 *      s += "AM_PM: "                + cal.get("AM_PM") + "\n";
 *      s += "HOUR: "                 + cal.get("HOUR") + "\n";
 *      s += "HOUR_OF_DAY: "          + cal.get("HOUR_OF_DAY") + "\n";
 *      s += "MINUTE: "               + cal.get("MINUTE") + "\n";
 *      s += "SECOND: "               + cal.get("SECOND") + "\n";
 *      s += "MILLISECOND: "          + cal.get("MILLISECOND") + "\n";
 *      s += "ZONE_OFFSET: "          + cal.get("ZONE_OFFSET") + "\n";
 *
 *      var date = cal.getTime();    // get date
 *      document.write(date);
 *
 */

// GregorianCalendar

// public functions


/**
 * Constructor of GregorianCalendar
 * @return GregorianCalendar object
 */
GregorianCalendar = function() {

    /** public */
    this.date = new Date();
    this.firstDayOfWeek = 0;
    this.lenient = true;

    /** private */
    this.internal = new Array(20);

    this.getFunc = new Array(20);
    this.getFunc['ERA'] = GregorianCalendar.getEra;
    this.getFunc['YEAR'] = GregorianCalendar.getYear;
    this.getFunc['MONTH'] = GregorianCalendar.getMonth;
    this.getFunc['WEEK_OF_YEAR'] = GregorianCalendar.getWeekOfYear;
    this.getFunc['WEEK_OF_MONTH'] = GregorianCalendar.getWeekOfMonth;
    this.getFunc['DATE'] = GregorianCalendar.getDateOfMonth;
    this.getFunc['DAY_OF_MONTH'] = GregorianCalendar.getDateOfMonth;
    this.getFunc['DAY_OF_YEAR'] = GregorianCalendar.getDayOfYear;
    this.getFunc['DAY_OF_WEEK'] = GregorianCalendar.getDayOfWeek;
    this.getFunc['DAY_OF_WEEK_IN_MONTH'] = GregorianCalendar.getDayOfWeekInMonth;
    this.getFunc['AM_PM'] = GregorianCalendar.getAmPm;
    this.getFunc['HOUR'] = GregorianCalendar.getHour;
    this.getFunc['HOUR_OF_DAY'] = GregorianCalendar.getHourOfDay;
    this.getFunc['MINUTE'] = GregorianCalendar.getMinute;
    this.getFunc['SECOND'] = GregorianCalendar.getSecond;
    this.getFunc['MILLISECOND'] = GregorianCalendar.getMillisecond;
    this.getFunc['ZONE_OFFSET'] = GregorianCalendar.getZoneOffset;

    this.setFunc = new Array(20);
    this.setFunc['ERA'] = GregorianCalendar.setEra;
    this.setFunc['YEAR'] = GregorianCalendar.setYear;
    this.setFunc['MONTH'] = GregorianCalendar.setMonth;
    this.setFunc['WEEK_OF_YEAR'] = GregorianCalendar.setWeekOfYear;
    this.setFunc['WEEK_OF_MONTH'] = GregorianCalendar.setWeekOfMonth;
    this.setFunc['DATE'] = GregorianCalendar.setDateOfMonth;
    this.setFunc['DAY_OF_MONTH'] = GregorianCalendar.setDateOfMonth;
    this.setFunc['DAY_OF_YEAR'] = GregorianCalendar.setDayOfYear;
    this.setFunc['DAY_OF_WEEK'] = GregorianCalendar.setDayOfWeek;
    this.setFunc['DAY_OF_WEEK_IN_MONTH'] = GregorianCalendar.setDayOfWeekInMonth;
    this.setFunc['AM_PM'] = GregorianCalendar.setAmPm;
    this.setFunc['HOUR'] = GregorianCalendar.setHour;
    this.setFunc['HOUR_OF_DAY'] = GregorianCalendar.setHourOfDay;
    this.setFunc['MINUTE'] = GregorianCalendar.setMinute;
    this.setFunc['SECOND'] = GregorianCalendar.setSecond;
    this.setFunc['MILLISECOND'] = GregorianCalendar.setMillisecond;
    this.setFunc['ZONE_OFFSET'] = GregorianCalendar.setZoneOffset;

    this.addFunc = new Array(10);
    this.addFunc['YEAR'] = GregorianCalendar.addYear;
    this.addFunc['MONTH'] = GregorianCalendar.addMonth;
    this.addFunc['DAY_OF_MONTH'] = GregorianCalendar.addDayOfMonth;
    this.addFunc['DATE'] = GregorianCalendar.addDayOfMonth;
    this.addFunc['DAY_OF_WEEK'] = GregorianCalendar.addDayOfWeek;
    this.addFunc['HOUR'] = GregorianCalendar.addHour;
    this.addFunc['HOUR_OF_DAY'] = GregorianCalendar.addHour;
    this.addFunc['MINUTE'] = GregorianCalendar.addMinute;
    this.addFunc['SECOND'] = GregorianCalendar.addSecond;
    this.addFunc['MILLISECOND'] = GregorianCalendar.addMillisecond;

}

/**
 * Gets the value for a given date time field.
 * @param fieldName the given time field name.
 * @return the integer value to be got for the given date time field.
 */
GregorianCalendar.prototype.get = function(fieldName) {
    var getfunc = this.getFunc[fieldName];
    if (getfunc == undefined)
        return undefined;
    return getfunc(this);
}

/**
 * Sets the date time field with the given value.
 * @param fieldName the given datetime field name.
 * @param value     the integer value to be set for the given date time field.
 */
GregorianCalendar.prototype.set = function(fieldName, value) {
    var setfunc = this.setFunc[fieldName];
    if (setfunc != undefined)
        setfunc(this, value);
}

/**
 * Get date object.
 * @return the date object, NaN if any field is invalid in lenient mode.
 */
GregorianCalendar.prototype.getTime = function() {

    if (this.lenient != false)
        return this.date;

    // validate the following calendar fields strictly...
    if (this.validateField("ERA")
        && this.validateField("YEAR")
        && this.validateField("MONTH")
        && this.validateField("DAY_OF_MONTH")
        && this.validateField("AM_PM")
        && this.validateField("HOUR_OF_DAY")
        && this.validateField("MINUTE")
        && this.validateField("SECOND")
        && this.validateField("MILLISECOND"))
             return this.date;

    return (NaN);
}

/**
 * Set date object.
 * @param date date obj
 */
GregorianCalendar.prototype.setTime = function(date) {
    this.date = date;
}

/**
 * Add a signed amount to a specified field, using this calendar's rules.
 * For example, to add three days to the current date, you can call add("DATE", 3).
 *
 * @param field field name, such YEAR, MONTH, HOUR so on.
 * @param amount.
 */
GregorianCalendar.prototype.add = function(field, amount) {
    if (amount == 0)
        return;
    var addfunc = this.addFunc[field];
    if (addfunc != undefined) {
        addfunc(this, amount);
    }
}

/**
 * Creates and returns a copy of this object.
 * @return a clone of this instance.
 */
GregorianCalendar.prototype.clone = function() {
    var newcal = new this.constructor();
    newcal.setTime(new Date(this.date));
    newcal.lenient = this.lenient;
    newcal.firstDayOfWeek = this.firstDayOfWeek;
    return newcal;
}




// private functions

GregorianCalendar.prototype.validateField = function(fieldName) {
    var internalValue = this.internal[fieldName];
    if (internalValue == undefined)
        return true;
    var getValue = this.get(fieldName);
    if (getValue == undefined || internalValue == getValue)
        return true;
    return false;
}

GregorianCalendar.getEra = function(obj) {
    if (obj.date.getFullYear() < 0)
        return 0;
    return 1;
}

GregorianCalendar.getYear = function(obj) {
    return obj.date.getFullYear();
}

GregorianCalendar.getMonth = function(obj) {
    return obj.date.getMonth();
}

GregorianCalendar.getWeekOfYear = function(obj) {
    // get the first date of the year
    var date1 = new Date(obj.date.getFullYear(), 0, 1, 0, 0, 0, 0);
    // get the date of Monday of the first week in the year
    var weekday1 = date1.getDay();
    if (weekday1 != 0)
        date1.setTime(date1.getTime() - weekday1 * 86400000);
    var winy = Math.floor((obj.date.getTime() - date1.getTime())/ 604800000) + 1;
    return winy;
}

GregorianCalendar.getWeekOfMonth = function(obj) {
    // get the first date of the month
    var date1 = new Date(obj.date.getFullYear(), obj.date.getMonth(), 1, 0, 0, 0, 0);
    var weekday1 = date1.getDay();
    if (weekday1 != 0)
        date1.setTime(date1.getTime() - weekday1 * 86400000);
    var winm = Math.floor((obj.date.getTime() - date1.getTime()) / 604800000) + 1;
    return winm;
}

GregorianCalendar.getDateOfMonth = function(obj) {
    return obj.date.getDate();
}

GregorianCalendar.getDayOfYear = function(obj) {
    // get the first date of the year
    var date1 = new Date(obj.date.getFullYear(), 0, 1, 0, 0, 0, 0);
    var days = Math.floor((obj.date.getTime() - date1.getTime())/ 86400000) + 1;
    return days;
}

GregorianCalendar.getDayOfWeek = function(obj) {
    return obj.date.getDay();
}

GregorianCalendar.getDayOfWeekInMonth = function(obj) {
    // get the first date of the month
    var date1 = new Date(obj.date.getFullYear(), obj.date.getMonth(), 1, 0, 0, 0, 0);
    var weekdays = Math.floor((obj.date.getTime() - date1.getTime())/ 604800000) + 1;
    return weekdays;
}

GregorianCalendar.getAmPm = function(obj) {

    // update ampm & hour of half day
    var hour = obj.date.getHours();
    if (hour < 12)
        return 0;
    return 1;
}


GregorianCalendar.getHour = function(obj) {

    var hour = obj.date.getHours();
    if (hour >= 12)
        hour -= 12;
    return hour;
}

GregorianCalendar.getHourOfDay = function(obj) {
    return obj.date.getHours();
}

GregorianCalendar.getMinute = function(obj) {
    return obj.date.getMinutes();
}

GregorianCalendar.getSecond = function(obj) {
    return obj.date.getSeconds();
}

GregorianCalendar.getMillisecond = function(obj) {
    return obj.date.getMilliseconds();
}

GregorianCalendar.getZoneOffset = function(obj) {
    return obj.date.getTimezoneOffset();
}

GregorianCalendar.setEra = function(obj, value) {
}

GregorianCalendar.setYear = function(obj, value) {
    if (0 <= value && value <= 23)
        value += 2000;
    else if (value <= 99)
        value += 1900;
    obj.internal["YEAR"] = value;
    obj.date.setFullYear(value);
}

GregorianCalendar.setMonth = function(obj, value) {
    obj.internal["MONTH"] = value;
    obj.date.setMonth(value);
}

GregorianCalendar.setWeekOfYear = function(obj, value) {
}

GregorianCalendar.setWeekOfMonth = function(obj, value) {
}

GregorianCalendar.setDateOfMonth = function(obj, value) {
    obj.internal["DAY_OF_MONTH"] = value;
    obj.date.setDate(value);
}

GregorianCalendar.setDayOfYear = function(obj, value) {
}

GregorianCalendar.setDayOfWeek = function(obj, value) {

}

GregorianCalendar.setDayOfWeekInMonth = function(obj, value) {
}

GregorianCalendar.setAmPm = function(obj, value) {

    obj.internal["AM_PM"] = value;

    // get current hour
    var hour = obj.date.getHours();

    // update hour (0-11)
    if (value == 0) {
        if (hour >= 12) {
            // change hour to AM, if new value is AM and current hour is PM
			obj.set("HOUR_OF_DAY", hour - 12);
            obj.date.setHours(hour-12);
        }
    }
    else {
        if (hour < 12) {
            // change hour to PM, if new value is PM and current hour is AM
			obj.set("HOUR_OF_DAY", hour + 12);
            obj.date.setHours(hour+12);
        }
    }
}

GregorianCalendar.setHour = function(obj, value) {
    var hour = obj.date.getHours();
    if (hour >= 12) 	// add 12 hour if it is PM now.
        value += 12;
    obj.internal["HOUR_OF_DAY"] = value;
    obj.date.setHours(value);
}

GregorianCalendar.setHourOfDay = function(obj, value) {
    obj.internal["HOUR_OF_DAY"] = value;
    obj.date.setHours(value);
}

GregorianCalendar.setMinute = function(obj, value) {
    obj.internal["MINUTE"] = value;
    obj.date.setMinutes(value);
}

GregorianCalendar.setSecond = function(obj, value) {
    obj.internal["SECOND"] = value;
    obj.date.setSeconds(value);
}

GregorianCalendar.setMillisecond = function(obj, value) {
    obj.internal["MILLISECOND"] = value;
    obj.date.setMilliseconds(value);
}

GregorianCalendar.setZoneOffset = function(obj, value) {
}

GregorianCalendar.addYear = function(obj, amount) {
    obj.date.setFullYear(obj.date.getFullYear() + amount);
    obj.internal["YEAR"] = undefined;
}

GregorianCalendar.addMonth = function(obj, amount) {
    obj.date.setMonth(obj.date.getMonth() + amount);
    obj.internal["MONTH"] = undefined;
}

GregorianCalendar.addDayOfMonth = function(obj, amount) {
    obj.date.setDate(obj.date.getDate() + amount);
    obj.internal["DAY_OF_MONTH"] = undefined;
}

GregorianCalendar.addDayOfWeek = function(obj, amount) {
    obj.date.setDay(obj.date.getDay() + amount);
}

GregorianCalendar.addHour = function(obj, amount) {
    obj.date.setHours(obj.date.getHours() + amount);
    obj.internal["HOUR_OF_DAY"] = undefined;
}

GregorianCalendar.addMinute = function(obj, amount) {
    obj.date.setMinutes(obj.date.getMinutes() + amount);
    obj.internal["MINUTE"] = undefined;
}

GregorianCalendar.addSecond = function(obj, amount) {
    obj.date.setSeconds(obj.date.getSeconds() + amount);
    obj.internal["SECOND"] = undefined;
}

GregorianCalendar.addMillisecond = function(obj, amount) {
    obj.date.setMilliseconds(obj.date.getMilliseconds() + amount);
    obj.internal["MILLISECOND"] = undefined;
}





// Utility funcitons for Gregorian based calendar

GregorianBasedCalendar_init = function(obj) {
    /** public */
    obj.date = new Date();
    obj.firstDayOfWeek = 0;

    obj.getFunc['ERA'] = GregorianBasedCalendar_getEra;
    obj.getFunc['YEAR'] = GregorianBasedCalendar_getYear;

    obj.setFunc['ERA'] = GregorianBasedCalendar_setEra;
    obj.setFunc['YEAR'] = GregorianBasedCalendar_setYear;
}

GregorianBasedCalendar_getEra = function(obj) {
    for (var i = 0; i < obj.eras.length; i++) {
        var era = obj.eras[i];
        var date = new Date(era[0], era[1]-1, era[2], 0, 0, 0, 0);
        if (obj.date < date) {
            if (i == 0)
                return 0;
            return (i - 1);
        }
    }
    return (obj.eras.length - 1);
}

GregorianBasedCalendar_getYear = function(obj) {
    var i = GregorianBasedCalendar_getEra(obj);
    var era = obj.eras[i];
    var year = obj.date.getFullYear();
    return (year - era[0] + 1);
}

GregorianBasedCalendar_setEra = function(obj, value) {
    obj.internal["ERA"] = value;
    if (0 <= value && value < obj.eras.length) {
        var year = GregorianBasedCalendar_getYear(obj) + (obj.eras[value])[0] - 1;
        obj.date.setFullYear(year);
    }
}

GregorianBasedCalendar_setYear = function(obj, value) {
    obj.internal["YEAR"] = value;
    var era = GregorianBasedCalendar_getEra(obj);
    if (0 <= era && era < obj.eras.length) {
        var year = value + (obj.eras[era])[0] - 1;
        obj.date.setFullYear(year);
    }
}



// JapaneseCalendar

JapaneseCalendar = function() {
    /** public */
    this.date = new Date();
    this.firstDayOfWeek = 0;

    this.getFunc['ERA'] = GregorianBasedCalendar_getEra;
    this.getFunc['YEAR'] = GregorianBasedCalendar_getYear;

    this.setFunc['ERA'] = GregorianBasedCalendar_setEra;
    this.setFunc['YEAR'] = GregorianBasedCalendar_setYear;
}
JapaneseCalendar.prototype = new GregorianCalendar();
JapaneseCalendar.prototype.constructor = JapaneseCalendar;
JapaneseCalendar.prototype.eras =
[
         [645,    6, 19],     // Taika
         [650,    2, 15],     // Hakuchi
         [672,    1,  1],     // Hakuho
         [686,    7, 20],     // Shucho
         [701,    3, 21],     // Taiho
         [704,    5, 10],     // Keiun
         [708,    1, 11],     // Wado
         [715,    9,  2],     // Reiki
         [717,   11, 17],     // Yoro
         [724,    2,  4],     // Jinki
         [729,    8,  5],     // Tempyo
         [749,    4, 14],     // Tempyo-kampo
         [749,    7,  2],     // Tempyo-shoho
         [757,    8, 18],     // Tempyo-hoji
         [765,    1,  7],     // Tempho-jingo
         [767,    8, 16],     // Jingo-keiun
         [770,   10,  1],     // Hoki
         [781,    1,  1],     // Ten-o
         [782,    8, 19],     // Enryaku
         [806,    5, 18],     // Daido
         [810,    9, 19],     // Konin
         [824,    1,  5],     // Tencho
         [834,    1,  3],     // Showa
         [848,    6, 13],     // Kajo
         [851,    4, 28],     // Ninju
         [854,   11, 30],     // Saiko
         [857,    2, 21],     // Tennan
         [859,    4, 15],     // Jogan
         [877,    4, 16],     // Genkei
         [885,    2, 21],     // Ninna
         [889,    4, 27],     // Kampyo
         [898,    4, 26],     // Shotai
         [901,    7, 15],     // Engi
         [923,    4, 11],     // Encho
         [931,    4, 26],     // Shohei
         [938,    5, 22],     // Tengyo
         [947,    4, 22],     // Tenryaku
         [957,   10, 27],     // Tentoku
         [961,    2, 16],     // Owa
         [964,    7, 10],     // Koho
         [968,    8, 13],     // Anna
         [970,    3, 25],     // Tenroku
         [973,   12, 20],     // Ten-en
         [976,    7, 13],     // Jogen
         [978,   11, 29],     // Tengen
         [983,    4, 15],     // Eikan
         [985,    4, 27],     // Kanna
         [987,    4,  5],     // Ei-en
         [989,    8,  8],     // Eiso
         [990,   11,  7],     // Shoryaku
         [995,    2, 22],     // Chotoku
         [999,    1, 13],     // Choho
        [1004,    7, 20],     // Kanko
        [1012,   12, 25],     // Chowa
        [1017,    4, 23],     // Kannin
        [1021,    2,  2],     // Jian
        [1024,    7, 13],     // Manju
        [1028,    7, 25],     // Chogen
        [1037,    4, 21],     // Choryaku
        [1040,   11, 10],     // Chokyu
        [1044,   11, 24],     // Kantoku
        [1046,    4, 14],     // Eisho
        [1053,    1, 11],     // Tengi
        [1058,    8, 29],     // Kohei
        [1065,    8,  2],     // Jiryaku
        [1069,    4, 13],     // Enkyu
        [1074,    8, 23],     // Shoho
        [1077,   11, 17],     // Shoryaku
        [1081,    2, 10],     // Eiho
        [1084,    2,  7],     // Otoku
        [1087,    4,  7],     // Kanji
        [1094,   12, 15],     // Kaho
        [1096,   12, 17],     // Eicho
        [1097,   11, 21],     // Shotoku
        [1099,    8, 28],     // Kowa
        [1104,    2, 10],     // Choji
        [1106,    4,  9],     // Kasho
        [1108,    8,  3],     // Tennin
        [1110,    7, 13],     // Ten-ei
        [1113,    7, 13],     // Eikyu
        [1118,    4,  3],     // Gen-ei
        [1120,    4, 10],     // Hoan
        [1124,    4,  3],     // Tenji
        [1126,    1, 22],     // Daiji
        [1131,    1, 29],     // Tensho
        [1132,    8, 11],     // Chosho
        [1135,    4, 27],     // Hoen
        [1141,    7, 10],     // Eiji
        [1142,    4, 28],     // Koji
        [1144,    2, 23],     // Tenyo
        [1145,    7, 22],     // Kyuan
        [1151,    1, 26],     // Ninpei
        [1154,   10, 28],     // Kyuju
        [1156,    4, 27],     // Hogen
        [1159,    4, 20],     // Heiji
        [1160,    1, 10],     // Eiryaku
        [1161,    9,  4],     // Oho
        [1163,    3, 29],     // Chokan
        [1165,    6,  5],     // Eiman
        [1166,    8, 27],     // Nin-an
        [1169,    4,  8],     // Kao
        [1171,    4, 21],     // Shoan
        [1175,    7, 28],     // Angen
        [1177,    8,  4],     // Jisho
        [1181,    7, 14],     // Yowa
        [1182,    5, 27],     // Juei
        [1184,    4, 16],     // Genryuku
        [1185,    8, 14],     // Bunji
        [1190,    4, 11],     // Kenkyu
        [1199,    4, 27],     // Shoji
        [1201,    2, 13],     // Kennin
        [1204,    2, 20],     // Genkyu
        [1206,    4, 27],     // Ken-ei
        [1207,   10, 25],     // Shogen
        [1211,    3,  9],     // Kenryaku
        [1213,   12,  6],     // Kenpo
        [1219,    4, 12],     // Shokyu
        [1222,    4, 13],     // Joo
        [1224,   11, 20],     // Gennin
        [1225,    4, 20],     // Karoku
        [1227,   12, 10],     // Antei
        [1229,    3,  5],     // Kanki
        [1232,    4,  2],     // Joei
        [1233,    4, 15],     // Tempuku
        [1234,   11,  5],     // Bunryaku
        [1235,    9, 19],     // Katei
        [1238,   11, 23],     // Ryakunin
        [1239,    2,  7],     // En-o
        [1240,    7, 16],     // Ninji
        [1243,    2, 26],     // Kangen
        [1247,    2, 28],     // Hoji
        [1249,    3, 18],     // Kencho
        [1256,   10,  5],     // Kogen
        [1257,    3, 14],     // Shoka
        [1259,    3, 26],     // Shogen
        [1260,    4, 13],     // Bun-o
        [1261,    2, 20],     // Kocho
        [1264,    2, 28],     // Bun-ei
        [1275,    4, 25],     // Kenji
        [1278,    2, 29],     // Koan
        [1288,    4, 28],     // Shoo
        [1293,    8, 55],     // Einin
        [1299,    4, 25],     // Shoan
        [1302,   11, 21],     // Kengen
        [1303,    8,  5],     // Kagen
        [1306,   12, 14],     // Tokuji
        [1308,   10,  9],     // Enkei
        [1311,    4, 28],     // Ocho
        [1312,    3, 20],     // Showa
        [1317,    2,  3],     // Bunpo
        [1319,    4, 28],     // Geno
        [1321,    2, 23],     // Genkyo
        [1324,   12,  9],     // Shochu
        [1326,    4, 26],     // Kareki
        [1329,    8, 29],     // Gentoku
        [1331,    8,  9],     // Genko
        [1334,    1, 29],     // Kemmu
        [1336,    2, 29],     // Engen
        [1340,    4, 28],     // Kokoku
        [1346,   12,  8],     // Shohei
        [1370,    7, 24],     // Kentoku
        [1372,    4,  1],     // Bunch\u0169
        [1375,    5, 27],     // Tenju
        [1381,    2, 10],     // Kowa
        [1384,    4, 28],     // Gench\u0169
        [1384,    2, 27],     // Meitoku
        [1379,    3, 22],     // Koryaku
        [1387,    8, 23],     // Kakei
        [1389,    2,  9],     // Koo
        [1390,    3, 26],     // Meitoku
        [1394,    7,  5],     // Oei
        [1428,    4, 27],     // Shocho
        [1429,    9,  5],     // Eikyo
        [1441,    2, 17],     // Kakitsu
        [1444,    2,  5],     // Bun-an
        [1449,    7, 28],     // Hotoku
        [1452,    7, 25],     // Kyotoku
        [1455,    7, 25],     // Kosho
        [1457,    9, 28],     // Choroku
        [1460,   12, 21],     // Kansho
        [1466,    2, 28],     // Bunsho
        [1467,    3,  3],     // Onin
        [1469,    4, 28],     // Bunmei
        [1487,    7, 29],     // Chokyo
        [1489,    8, 21],     // Entoku
        [1492,    7, 19],     // Meio
        [1501,    2, 29],     // Bunki
        [1504,    2, 30],     // Eisho
        [1521,    8, 23],     // Taiei
        [1528,    8, 20],     // Kyoroku
        [1532,    7, 29],     // Tenmon
        [1555,   10, 23],     // Koji
        [1558,    2, 28],     // Eiroku
        [1570,    4, 23],     // Genki
        [1573,    7, 28],     // Tensho
        [1592,   12,  8],     // Bunroku
        [1596,   10, 27],     // Keicho
        [1615,    7, 13],     // Genwa
        [1624,    2, 30],     // Kan-ei
        [1644,   12, 16],     // Shoho
        [1648,    2, 15],     // Keian
        [1652,    9, 18],     // Shoo
        [1655,    4, 13],     // Meiryaku
        [1658,    7, 23],     // Manji
        [1661,    4, 25],     // Kanbun
        [1673,    9, 21],     // Enpo
        [1681,    9, 29],     // Tenwa
        [1684,    2, 21],     // Jokyo
        [1688,    9, 30],     // Genroku
        [1704,    3, 13],     // Hoei
        [1711,    4, 25],     // Shotoku
        [1716,    6, 22],     // Kyoho
        [1736,    4, 28],     // Genbun
        [1741,    2, 27],     // Kanpo
        [1744,    2, 21],     // Enkyo
        [1748,    7, 12],     // Kan-en
        [1751,   10, 27],     // Horyaku
        [1764,    6,  2],     // Meiwa
        [1772,   11, 16],     // An-ei
        [1781,    4,  2],     // Tenmei
        [1789,    1, 25],     // Kansei
        [1801,    2,  5],     // Kyowa
        [1804,    2, 11],     // Bunka
        [1818,    4, 22],     // Bunsei
        [1830,   12, 10],     // Tenpo
        [1844,   12,  2],     // Koka
        [1848,    2, 28],     // Kaei
        [1854,   11, 27],     // Ansei
        [1860,    3, 18],     // Man-en
        [1861,    2, 19],     // Bunkyu
        [1864,    2, 20],     // Genji
        [1865,    4,  7],     // Keio
        [1868,    9,  8],     // Meiji
        [1912,    7, 30],     // Taisho
        [1926,   12, 25],     // Showa
        [1989,    1,  8]      // Heisei
];

// TaiwaneseCalendar

TaiwaneseCalendar = function() {

    /** public */
    this.date = new Date();
    this.firstDayOfWeek = 0;

    this.getFunc['ERA'] = TaiwaneseCalendar.getEra;
    this.getFunc['YEAR'] = TaiwaneseCalendar.getYear;

    this.setFunc['ERA'] = TaiwaneseCalendar.setEra;
    this.setFunc['YEAR'] = TaiwaneseCalendar.setYear;
}
TaiwaneseCalendar.prototype = new GregorianCalendar();
TaiwaneseCalendar.prototype.constructor = TaiwaneseCalendar;
TaiwaneseCalendar.prototype.eras =
[
        [1912,    1,  1]     // Zhounghua minguo
];

TaiwaneseCalendar.getEra = function(obj) {

    var era = obj.eras[0];
    var date = new Date(era[0], era[1]-1, era[2], 0, 0, 0, 0);
    if (obj.date < date)
        return 0;
    return 1;
}

TaiwaneseCalendar.getYear = function(obj) {
    var era = obj.eras[0];
    var year = obj.date.getFullYear();
    if (TaiwaneseCalendar.getEra(obj) == 0) {
        return (era[0] - year);	        // before Zhounghua minguo
    }
    return (year - era[0] + 1);         // Zhounghua minguo
}

TaiwaneseCalendar.setEra = function(obj, value) {
    obj.internal["ERA"] = value;
    if (value == 0) {
        // before Zhounghua minguo
        var year = (obj.eras[0])[0] - TaiwaneseCalendar.getYear(obj);
        obj.date.setFullYear(year);
    }
    else if (value == 1) {
        // Zhounghua minguo era
        var year = TaiwaneseCalendar.getYear(obj) + (obj.eras[0])[0] - 1;
        obj.date.setFullYear(year);
    }
}

TaiwaneseCalendar.setYear = function(obj, value) {
    obj.internal["YEAR"] = value;
    var era = TaiwaneseCalendar.getEra(obj);
    if (era == 0) {
        var year = (obj.eras[era])[0] - value;
        obj.date.setFullYear(year);
    }
    else if (era == 1) {
        var year = value + (obj.eras[0])[0] - 1;
        obj.date.setFullYear(year);
    }
}



// BuddhistCalendar

BuddhistCalendar = function() {
    GregorianBasedCalendar_init(this);
}
BuddhistCalendar.prototype = new GregorianCalendar();
BuddhistCalendar.prototype.constructor = BuddhistCalendar;
BuddhistCalendar.prototype.eras =
[
        [-542,    1,  1]     // the birth of the Buddha
];


/**
 * IslamicCalendar object
 *
 * Sample:
 *
 *      var cal = new IslamicCalendar();
 *      var s = ""
 *      s += "ERA: "                  + cal.get("ERA") + "\n";
 *      s += "YEAR: "                 + cal.get("YEAR") + "\n";
 *      s += "MONTH: "                + cal.get("MONTH") + "\n";
 *      s += "WEEK_OF_YEAR: "         + cal.get("WEEK_OF_YEAR") + "\n";
 *      s += "WEEK_OF_MONTH: "        + cal.get("WEEK_OF_MONTH") + "\n";
 *      s += "DATE: "                 + cal.get("DATE") + "\n";
 *      s += "DAY_OF_MONTH: "         + cal.get("DAY_OF_MONTH") + "\n";
 *      s += "DAY_OF_YEAR: "          + cal.get("DAY_OF_YEAR") + "\n";
 *      s += "DAY_OF_WEEK: "          + cal.get("DAY_OF_WEEK") + "\n";
 *      s += "DAY_OF_WEEK_IN_MONTH: " + cal.get("DAY_OF_WEEK_IN_MONTH") + "\n";
 *      s += "AM_PM: "                + cal.get("AM_PM") + "\n";
 *      s += "HOUR: "                 + cal.get("HOUR") + "\n";
 *      s += "HOUR_OF_DAY: "          + cal.get("HOUR_OF_DAY") + "\n";
 *      s += "MINUTE: "               + cal.get("MINUTE") + "\n";
 *      s += "SECOND: "               + cal.get("SECOND") + "\n";
 *      s += "MILLISECOND: "          + cal.get("MILLISECOND") + "\n";
 *      s += "ZONE_OFFSET: "          + cal.get("ZONE_OFFSET") + "\n";
 *
 *      var date = cal.getTime();    // get date
 *      document.write(date);
 *
 */

IslamicCalendar = function() {

    /** public */
    this.date = new Date();
    this.firstDayOfWeek = 0;

    /** private */
    this.internal = new Array(20);

    this.getFunc = new Array(20);
    this.getFunc['ERA'] = IslamicCalendar.getEra;
    this.getFunc['YEAR'] = IslamicCalendar.getYear;
    this.getFunc['MONTH'] = IslamicCalendar.getMonth;
    this.getFunc['WEEK_OF_YEAR'] = IslamicCalendar.getWeekOfYear;
    this.getFunc['WEEK_OF_MONTH'] = IslamicCalendar.getWeekOfMonth;
    this.getFunc['DATE'] = IslamicCalendar.getDateOfMonth;
    this.getFunc['DAY_OF_MONTH'] = IslamicCalendar.getDateOfMonth;
    this.getFunc['DAY_OF_YEAR'] = IslamicCalendar.getDayOfYear;
    this.getFunc['DAY_OF_WEEK'] = IslamicCalendar.getDayOfWeek;
    this.getFunc['DAY_OF_WEEK_IN_MONTH'] = IslamicCalendar.getDayOfWeekInMonth;
    this.getFunc['AM_PM'] = IslamicCalendar.getAmPm;
    this.getFunc['HOUR'] = IslamicCalendar.getHour;
    this.getFunc['HOUR_OF_DAY'] = IslamicCalendar.getHourOfDay;
    this.getFunc['MINUTE'] = IslamicCalendar.getMinute;
    this.getFunc['SECOND'] = IslamicCalendar.getSecond;
    this.getFunc['MILLISECOND'] = IslamicCalendar.getMillisecond;
    this.getFunc['ZONE_OFFSET'] = IslamicCalendar.getZoneOffset;

    this.setFunc = new Array(20);
    this.setFunc['ERA'] = IslamicCalendar.setEra;
    this.setFunc['YEAR'] = IslamicCalendar.setYear;
    this.setFunc['MONTH'] = IslamicCalendar.setMonth;
    this.setFunc['WEEK_OF_YEAR'] = IslamicCalendar.setWeekOfYear;
    this.setFunc['WEEK_OF_MONTH'] = IslamicCalendar.setWeekOfMonth;
    this.setFunc['DATE'] = IslamicCalendar.setDateOfMonth;
    this.setFunc['DAY_OF_MONTH'] = IslamicCalendar.setDateOfMonth;
    this.setFunc['DAY_OF_YEAR'] = IslamicCalendar.setDayOfYear;
    this.setFunc['DAY_OF_WEEK'] = IslamicCalendar.setDayOfWeek;
    this.setFunc['DAY_OF_WEEK_IN_MONTH'] = IslamicCalendar.setDayOfWeekInMonth;
    this.setFunc['AM_PM'] = IslamicCalendar.setAmPm;
    this.setFunc['HOUR'] = IslamicCalendar.setHour;
    this.setFunc['HOUR_OF_DAY'] = IslamicCalendar.setHourOfDay;
    this.setFunc['MINUTE'] = IslamicCalendar.setMinute;
    this.setFunc['SECOND'] = IslamicCalendar.setSecond;
    this.setFunc['MILLISECOND'] = IslamicCalendar.setMillisecond;
    this.setFunc['ZONE_OFFSET'] = IslamicCalendar.setZoneOffset;

    this.addFunc = new Array(10);
    this.addFunc['YEAR'] = IslamicCalendar.addYear;
    this.addFunc['MONTH'] = IslamicCalendar.addMonth;
    this.addFunc['DAY_OF_MONTH'] = IslamicCalendar.addDayOfMonth;
    this.addFunc['DATE'] = IslamicCalendar.addDayOfMonth;
    this.addFunc['DAY_OF_WEEK'] = IslamicCalendar.addDayOfWeek;
    this.addFunc['HOUR'] = IslamicCalendar.addHour;
    this.addFunc['HOUR_OF_DAY'] = IslamicCalendar.addHour;
    this.addFunc['MINUTE'] = IslamicCalendar.addMinute;
    this.addFunc['SECOND'] = IslamicCalendar.addSecond;
    this.addFunc['MILLISECOND'] = IslamicCalendar.addMillisecond;
}

/**
 * Gets the value for a given date time field.
 * @param fieldName the given time field name.
 * @return the integer value to be got for the given date time field.
 */
IslamicCalendar.prototype.get = function(fieldName) {
    var getfunc = this.getFunc[fieldName];
    if (getfunc == undefined)
        return undefined;
    return getfunc(this);
}

/**
 * Sets the date time field with the given value.
 * @param fieldName the given datetime field name.
 * @param value     the integer value to be set for the given date time field.
 */
IslamicCalendar.prototype.set = function(fieldName, value) {
    var setfunc = this.setFunc[fieldName];
    if (setfunc != undefined)
        setfunc(this, value);
}

/**
 * Get date object.
 * @return the date object
 */
IslamicCalendar.prototype.getTime = function() {

    if (this.lenient != false)
        return this.date;

    // validate the following calendar fields strictly...
    if (this.validateField("ERA")
        && this.validateField("YEAR")
        && this.validateField("MONTH")
        && this.validateField("DAY_OF_MONTH")
        && this.validateField("AM_PM")
        && this.validateField("HOUR_OF_DAY")
        && this.validateField("MINUTE")
        && this.validateField("SECOND")
        && this.validateField("MILLISECOND"))
             return this.date;

    return (NaN);
}

/**
 * Set date object.
 * @param date date obj
 */
IslamicCalendar.prototype.setTime = function(date) {
    this.date = date;
}

/**
 * Add a signed amount to a specified field, using this calendar's rules.
 * For example, to add three days to the current date, you can call add("DATE", 3).
 *
 * @param field field name, such YEAR, MONTH, HOUR so on.
 * @param amount.
 */
IslamicCalendar.prototype.add = function(field, amount) {
    if (amount == 0)
        return;
    var addfunc = this.addFunc[field];
    if (addfunc != undefined) {
        addfunc(this, amount);
    }
}

/**
 * Creates and returns a copy of this object.
 * @param cal a instance of IslamicCalendar
 * @return a clone of this instance.
 */
IslamicCalendar.prototype.clone = function() {
    var newcal = new IslamicCalendar();
    newcal.setTime(new Date(this.date));
    newcal.lenient = this.lenient;
    newcal.firstDayOfWeek = this.firstDayOfWeek;
    return newcal;
}




// private functions


IslamicCalendar.prototype.validateField = function(fieldName) {
    var internalValue = this.internal[fieldName];
    if (internalValue == undefined)
        return true;
    var getValue = this.get(fieldName);
    if (getValue == undefined || internalValue == getValue)
        return true;
    return false;
}

IslamicCalendar.getEra = function(obj) {
    return 0;
}

IslamicCalendar.getYear = function(obj) {
    var date = IslamicCalendar.GregorianToIslamic(obj.date.getFullYear(), obj.date.getMonth(), obj.date.getDate());
    return date[0];
}

IslamicCalendar.getMonth = function(obj) {
    var date = IslamicCalendar.GregorianToIslamic(obj.date.getFullYear(), obj.date.getMonth(), obj.date.getDate());
    return date[1];
}

IslamicCalendar.getWeekOfYear = function(obj) {
    return undefined;
}

IslamicCalendar.getWeekOfMonth = function(obj) {
    return undefined;
}

IslamicCalendar.getDateOfMonth = function(obj) {
    var date = IslamicCalendar.GregorianToIslamic(obj.date.getFullYear(), obj.date.getMonth(), obj.date.getDate());
    return date[2];
}

IslamicCalendar.getDayOfYear = function(obj) {
    return undefined;
}

IslamicCalendar.getDayOfWeek = function(obj) {
    return obj.date.getDay();
}

IslamicCalendar.getDayOfWeekInMonth = function(obj) {
    return undefined;
}

IslamicCalendar.getAmPm = function(obj) {

    // update ampm & hour of half day
    var hour = obj.date.getHours();
    if (hour < 12)
        return 0;
    return 1;
}


IslamicCalendar.getHour = function(obj) {

    var hour = obj.date.getHours();
    if (hour >= 12)
        hour -= 12;
    return hour;
}

IslamicCalendar.getHourOfDay = function(obj) {
    return obj.date.getHours();
}

IslamicCalendar.getMinute = function(obj) {
    return obj.date.getMinutes();
}

IslamicCalendar.getSecond = function(obj) {
    return obj.date.getSeconds();
}

IslamicCalendar.getMillisecond = function(obj) {
    return obj.date.getMilliseconds();
}

IslamicCalendar.getZoneOffset = function(obj) {
    return obj.date.getTimezoneOffset();
}

IslamicCalendar.setEra = function(obj, value) {
}

IslamicCalendar.setYear = function(obj, value) {
    obj.internal["YEAR"] = value;
    var date = IslamicCalendar.GregorianToIslamic(obj.date.getFullYear(), obj.date.getMonth(), obj.date.getDate());
    var year = value;
    var month = date[1];
    var day = date[2];

    // validate date
    var maxday = IslamicCalendar.TotalDaysOfTheIslamicMonth(month, year);
    if (maxday < day) {
        day %= maxday;
    }

    date = IslamicCalendar.IslamicToGregorian(year, month, day);
    obj.date.setFullYear(date[0]);
    obj.date.setMonth(date[1]);
    obj.date.setDate(date[2]);
}

IslamicCalendar.setMonth = function(obj, value) {

    if (value == 0) {
        var gregorianDate = obj.date;
        var islamicYMD = IslamicCalendar.GregorianToIslamic(gregorianDate.getFullYear(), gregorianDate.getMonth(), gregorianDate.getDate());
        var gregorianYMD = IslamicCalendar.IslamicToGregorian(islamicYMD[0], 0, islamicYMD[2]);
        gregorianDate.setFullYear(gregorianYMD[0]);
        gregorianDate.setMonth(gregorianYMD[1]);
        gregorianDate.setDate(gregorianYMD[2]);
    }
    else if (value < 0) {
        IslamicCalendar.setMonth(obj, 0);
        IslamicCalendar.addMonth(obj, value);
    }
    else if (0 < value) {
        IslamicCalendar.setMonth(obj, 0);
        IslamicCalendar.addMonth(obj, value);
    }
    obj.internal["MONTH"] = value;
}

IslamicCalendar.setWeekOfYear = function(obj, value) {
}

IslamicCalendar.setWeekOfMonth = function(obj, value) {
}

IslamicCalendar.setDateOfMonth = function(obj, value) {

    if (value == 1) {
        var gregorianDate = obj.date;
        var islamicYMD = IslamicCalendar.GregorianToIslamic(gregorianDate.getFullYear(), gregorianDate.getMonth(), gregorianDate.getDate());
        var gregorianYMD = IslamicCalendar.IslamicToGregorian(islamicYMD[0], islamicYMD[1], 1);
        gregorianDate.setFullYear(gregorianYMD[0]);
        gregorianDate.setMonth(gregorianYMD[1]);
        gregorianDate.setDate(gregorianYMD[2]);
    }
    else if (value <= 0) {
        IslamicCalendar.setDateOfMonth(obj, 1);
        IslamicCalendar.addDayOfMonth(obj, value-1);
        return;
    }
    else if (1 < value) {
        IslamicCalendar.setDateOfMonth(obj, 1);
        IslamicCalendar.addDayOfMonth(obj, value-1);
    }
    obj.internal["DAY_OF_MONTH"] = value;
}

IslamicCalendar.setDayOfYear = function(obj, value) {
}

IslamicCalendar.setDayOfWeek = function(obj, value) {
    obj.date.setDay(value);
}

IslamicCalendar.setDayOfWeekInMonth = function(obj, value) {
}

IslamicCalendar.setAmPm = function(obj, value) {

    // get current hour
    var hour = obj.date.getHours();

    // update hour (0-11)
    if (!value) {
        if (hour >= 12) {
            // change hour to AM, if new value is AM and current hour is PM
            obj.date.setHours(hour-12);
        }
    }
    else {
        if (hour < 12) {
            // change hour to PM, if new value is PM and current hour is AM
            obj.date.setHours(hour+12);
        }
    }
    obj.internal["AM_PM"] = value;
}

IslamicCalendar.setHour = function(obj, value) {

    var hour = obj.date.getHours();
    if (hour >= 12) 	// add 12 hour if it is PM now.
        value += 12;
    obj.internal["HOUR_OF_DAY"] = value;
    obj.date.setHours(value);
}

IslamicCalendar.setHourOfDay = function(obj, value) {
    obj.internal["HOUR_OF_DAY"] = value;
    obj.date.setHours(value);
}

IslamicCalendar.setMinute = function(obj, value) {
    obj.internal["MINUTE"] = value;
    obj.date.setMinutes(value);
}

IslamicCalendar.setSecond = function(obj, value) {
    obj.internal["SECOND"] = value;
    obj.date.setSeconds(value);
}

IslamicCalendar.setMillisecond = function(obj, value) {
    obj.internal["MILLISECOND"] = value;
    obj.date.setMilliseconds(value);
}

IslamicCalendar.setZoneOffset = function(obj, value) {
}



IslamicCalendar.addYear = function(obj, amount) {
    var y, m, d;
    var gregorianDate;
    var gregorianYMD, islamicYMD;

    // Gregorian date -> Islamic date
    gregorianDate = obj.date;
    islamicYMD = IslamicCalendar.GregorianToIslamic(gregorianDate.getFullYear(), gregorianDate.getMonth(), gregorianDate.getDate());
    y = islamicYMD[0];
    m = islamicYMD[1];
    d = islamicYMD[2];

    // add year
    y += amount;

    // validate date
    var maxday = IslamicCalendar.TotalDaysOfTheIslamicMonth(m+1, y);
    if (maxday < d) {
        d = maxday;
    }

    // Islamic date -> Gregorian date
    gregorianYMD = IslamicCalendar.IslamicToGregorian(y, m, d);
    gregorianDate.setFullYear(gregorianYMD[0]);
    gregorianDate.setMonth(gregorianYMD[1]);
    gregorianDate.setDate(gregorianYMD[2]);

    obj.internal["YEAR"] = undefined;
}

IslamicCalendar.addMonth = function(obj, amount) {
    var y, m, d;
    var gregorianDate;
    var gregorianYMD, islamicYMD;

    // Gregorian date -> Islamic date
    gregorianDate = obj.date;
    islamicYMD = IslamicCalendar.GregorianToIslamic(gregorianDate.getFullYear(), gregorianDate.getMonth(), gregorianDate.getDate());
    y = islamicYMD[0];
    m = islamicYMD[1];
    d = islamicYMD[2];

    if (islamicYMD != undefined) {
        if (amount >= 0) {
            for (var i = 0; i < amount; i++) {
                if (m == 11) {
                    m = 0;
                    y++;
                }
                else {
                    m++;
                }
            }
        }
        else {
            amount = Math.abs(amount);
            for (var i = 0; i < amount; i++) {
                if (m == 0) {
                    m = 11;
                    y--;
                }
                else {
                    m--;
                }
            }
        }

        // validate date
        var maxday = IslamicCalendar.TotalDaysOfTheIslamicMonth(m+1, y);
        if (maxday < d) {
            d = maxday;
        }

        // Islamic date -> Gregorian date
        gregorianYMD = IslamicCalendar.IslamicToGregorian(y, m, d);
        gregorianDate.setFullYear(gregorianYMD[0]);
        gregorianDate.setMonth(gregorianYMD[1]);
        gregorianDate.setDate(gregorianYMD[2]);
    }

    obj.internal["MONTH"] = undefined;
}

IslamicCalendar.addDayOfMonth = function(obj, amount) {
    obj.date.setDate(obj.date.getDate() + amount);
    obj.internal["DAY_OF_MONTH"] = undefined;
}

IslamicCalendar.addDayOfWeek = function(obj, amount) {
    obj.date.setDay(obj.date.getDay() + amount);
}

IslamicCalendar.addHour = function(obj, amount) {
    obj.date.setHours(obj.date.getHours() + amount);
    obj.internal["HOUR_OF_DAY"] = undefined;
}

IslamicCalendar.addMinute = function(obj, amount) {
    obj.date.setMinutes(obj.date.getMinutes() + amount);
    obj.internal["MINUTE"] = undefined;
}

IslamicCalendar.addSecond = function(obj, amount) {
    obj.date.setSeconds(obj.date.getSeconds() + amount);
    obj.internal["SECOND"] = undefined;
}

IslamicCalendar.addMillisecond = function(obj, amount) {
    obj.date.setMilliseconds(obj.date.getMilliseconds() + amount);
    obj.internal["MILLISECOND"] = undefined;
}


var ISLAMIC_EPOCH=227014;		/* number of days before start of the Islamic calendar */

/*
 *	TotalDaysOfTheGregorianMonth
 *
 *	Calculate the total number of days of the Gregorian month
 *
 *	Inputs:
 *		year: Gregorian year
 *		month: Gregorian month
 *
 *	Returns:
 *		the number of days of the month
 *
 */
IslamicCalendar.TotalDaysOfTheGregorianMonth = function(month, year)
{
	switch (month)
	{
	case 2:
		if ((((year % 4) == 0) && ((year % 100) != 0)) || ((year % 400) == 0))
			return 29;
		else
			return 28;
	case 4:
	case 6:
	case 9:
	case 11:
		return 30;

	default:
		return 31;
	}
}

/*
 *	GregorianDateToTotalDays
 *
 *	This funciton calulates the number of days elapsed
 *	since the Gregorian date Sunday, December 31, 1 BC.
 *	eg) The Gregorian date January 1, 1 AD is 1.
 *
 *	Inputs:
 *		year: Gregorian year
 *		month: Gregorian month
 *		day: Gregorian day
 *
 *	Returns:
 *		the number of days elapsed since Dec 31, 1 BC.
 *
 */
IslamicCalendar.GregorianDateToTotalDays = function(month, day, year)
{
	var m;
	var days;

	/* calulate total days of this year */
	days = day;
	for (m = month - 1;  m > 0; m--)
		days += IslamicCalendar.TotalDaysOfTheGregorianMonth(m, year);


	/* this returns						*/
	/*	days this year					*/
	/*	+ days in previous years ignoring leap days	*/
	/*	+ Julian leap days before this year		*/
	/*	- prior century years				*/
	/*	+ prior years divisible by 400			*/
	year--;
	return (days + (365 * year) + Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400));
}


/* TotalDaysToGregorianDate
 *
 *	This funciton converts the number of days elapsed since the Gregorian date Sunday, December 31, 1 BC to Gregorian date
 *	eg) if days = 1, it returns the Gregorian date January 1, 1 AD
 *
 *	Inputs:
 *		days: the number of days elapsed since Dec 31, 1 BC.
 *
 *	Outputs:
 *		year: Gregorian year
 *		month: Gregorian month (1-12)
 *		day: Gregorian day
 *
 */
IslamicCalendar.TotalDaysToGregorianDate = function(days)
{
	var year, month, day;

	// Find the gregorian year

	for (year = Math.floor(days / 366); days >= IslamicCalendar.GregorianDateToTotalDays(1, 1, year+1); year++)
		;

	// Find the gregorian month
	for (month = 1; days > IslamicCalendar.GregorianDateToTotalDays(month, IslamicCalendar.TotalDaysOfTheGregorianMonth(month, year), year); month++)
		;

	// Find the gregorian day
	day = (days - IslamicCalendar.GregorianDateToTotalDays(month, 1, year) + 1);

        return [year, month, day];
}




/*
 *	TotalDaysOfTheIslamicMonth
 *
 *	This funciton calulates the number of days elapsed
 *	since the Gregorian date Sunday, December 31, 1 BC.
 *
 *	Inputs:
 *		year: Islamic year
 *		month: Islamic month (1-12)
 *
 *	Returns:
 *		the number of days of the Islamic month
 *
 */
IslamicCalendar.TotalDaysOfTheIslamicMonth = function(month, year)
{
	if (month % 2 == 1)
		return 30;
	else if (month == 12 && (11 * year + 14) % 30 < 11)	// month == 12 and leap year
		return 30;
	else
		return 29;

}

/*
 *	IslamicDateToTotalDays
 *
 *	This funciton calulates the number of days elapsed since Islamic starts
 *
 *	Inputs:
 *		year: Islamic year
 *		month: Islamic month
 *		day: Islamic day
 *
 *	Returns:
 *		the number of days elapsed since Islamic starts
 *
 */
IslamicCalendar.IslamicDateToTotalDays = function(month, day, year)
{
    return (day				                /* days of this month */
            + 29 * (month - 1)		                /* days of this year */
            + Math.floor(month / 2)
            + 354 * (year - 1)		                /* non-leap days totally */
            + Math.floor((3 + (11 * year)) / 30)	/* leap days totally */
            + ISLAMIC_EPOCH);                             /* days before start of calendar */
}

/* TotalDaysToIslamicDate
 *
 *	This funciton converts the number of days to the Islamic date
 *	eg) if days = 227014 + 1, it returns the Islamic date 1/1/1
 *
 *	Inputs:
 *		days: the number of days elapsed from Islamic date 1/1/1
 *
 *	Outputs: [year, month, day]
 *		year: Islamic year
 *		month: Islamic month (0-)
 *		day: Islamic day
 *
 */
IslamicCalendar.TotalDaysToIslamicDate = function(days) {
	var year, month, day;

	if (days <= ISLAMIC_EPOCH)
		{
		year = 0;
		month = 0;
		day = 0;
		return [0, 0, 0];
		}

	/* find the Islamic year */
	for (year = Math.floor((days - ISLAMIC_EPOCH) / 355); days >= IslamicCalendar.IslamicDateToTotalDays(1,1,year+1); year++)
		;

	/* find the Islamic month */
	for (month = 1; days > IslamicCalendar.IslamicDateToTotalDays(month, IslamicCalendar.TotalDaysOfTheIslamicMonth(month, year), year); month++)
		;

	/* find the Islamic day */
	day = (days - IslamicCalendar.IslamicDateToTotalDays(month,1,year) + 1);

        return [year, month, day];
}

// y: Gregorian year
// m: Gregorian month (0-11)
// d: Gregorian date
IslamicCalendar.GregorianToIslamic = function(y, m, d) {
    m++;
    var days = IslamicCalendar.GregorianDateToTotalDays(m,d,y);
    var date = (IslamicCalendar.TotalDaysToIslamicDate(days));
    date[1]--;
    return date;
}

// y: Islamic year
// m: Islamic month (0-11)
// d: Islamic date
IslamicCalendar.IslamicToGregorian = function(y, m, d) {
    m++;
    var days = IslamicCalendar.IslamicDateToTotalDays(m,d,y);
    var date = IslamicCalendar.TotalDaysToGregorianDate(days);
    date[1]--;
    return date;
}

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
	var month = -1;
	var pos = textpos;

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
                month = i;
                pos += months[i].length;
                break;
            }
        }
    }
    else {
        // number
        // if flag is on, get same bytes of token as bytes of symbols
        var len;
        if (obj.contiguousSymbols == true)
            var currentText = text.substr(textpos, width);
        else
            var currentText = text.substr(textpos);

        var n = parseInt(currentText, 10);
        if (!isNaN(n)) {
            month = n - 1;
            pos += SimpleDateFormat.countNumberText(currentText);
        }
    }

    if (month == -1)
        return (NaN);

    // preserve date for later adjustment
    var dayBefore = cal.get("DATE");

    // update internal calendar
    cal.set("MONTH", month);

    // decrement day if the month actually set in calendar object
    // is one month ahead
    if (dayBefore != cal.get("DATE")) {
        var monthAhead, monthSet;
        monthAhead = monthSet = cal.get("MONTH");
        while (monthAhead == monthSet) {
            cal.add("DATE", -1);
            monthSet = cal.get("MONTH");
        }
    }

    return pos;
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
            return (textpos + ampms[i].length);
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



