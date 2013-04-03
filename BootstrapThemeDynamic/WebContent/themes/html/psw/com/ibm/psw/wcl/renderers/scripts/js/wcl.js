/*********************************************************** {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM
* Tivoli Presentation Services
*
* (C) Copyright IBM Corp. 2002,2003 All Rights Reserved.
*
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
************************************************************ {COPYRIGHT-END} ***
*******************************************************************************/

/*******************************************************************************
* This file contains all of the javascript functions used by the WCL renderers.
* The functions defined here must be stateless -- that is, no member variables
* can be defined, so all state information must be passed into the function
* as parameters.
*******************************************************************************/

////////////////////////////////////////////////////////////////////////////////
// frame reload manager functions
////////////////////////////////////////////////////////////////////////////////

/** FrameReloadManager, AWFrame **
 * framePath - the path from the current page to the frame to be reloaded
 * reloadURL - the url to load into that frame
 */
function fMgr( framePath, reloadURL )
{
   if (framePath != null && reloadURL != null) {
      var frame = eval(framePath);
      if (frame != null && frame.location != null) {
         var useReload = false;
         try {
            // We have to check if the reloadURL matches the end of the
            // frame's location.href (except for the anchor, if any).
            // If so, this is the case that Netscape may ignore on
            // location.replace() so we set a flag to use location.reload(true)
            // instead.  This is done inside a try/catch block because
            // examining the location.hash and location.href may fail
            // of the location is a URL on anther domain.
            var hashLength = 0;
            if (frame.location.hash != null)
               hashLength = frame.location.hash.length;
            if (hashLength > 0) {
               var offset = frame.location.href.length - (hashLength + reloadURL.length);
               if ((offset >= 0) && (frame.location.href.indexOf(reloadURL) == offset)) {
                  useReload = true;
               }
            }
         }
         catch(e) { }
         if (useReload)
            frame.location.reload(true);
         else
            frame.location.replace(reloadURL);
      }
   }
}

////////////////////////////////////////////////////////////////////////////////
// form input component functions
////////////////////////////////////////////////////////////////////////////////

/** AWInputComponent **
 * action - the name of the action. do not encode because it is used as the
 *          value of a hidden input field.
 * formName - this encoded name of the form
 * wclhidden - the encoded name of the hidden field
 */
function frmAct(action, formName, wclhidden) {
   if (document != null && document.forms != null && formName != null) {
      var form = document.forms[formName];
      if (form != null) {
         form[wclhidden].value=action;
      }
   }
}

/** WComboBox **
 * textfield - the editable text field for the combobox
 * value - the value of the selected option
 * addOption - the value of the "add" option
 * comboImg - the image rendered next to the label of the dropdown
 * textImg - the image rendered next to the text field
 * statusName - the style class id for the status (normal, required, error)
 */
function editbx(textfield, value, addOption, comboImg, textImg, statusName) {
   if (textfield != null) {
      if (value != addOption) {
         textfield.disabled = true;
         textfield.className = "te1";
         if (comboImg != null) {
            comboImg.style.display = "inline";
         }
         if (textImg != null) {
            textImg.style.display = "none";
         }
      } else {
         textfield.disabled = false;
         if (statusName != null) {
            textfield.className = statusName;
         }
         if (comboImg != null) {
            comboImg.style.display = "none";
         }
         if (textImg != null) {
            textImg.style.display = "inline";
         }
      }
   }
}


/** WComboBox and WSelectionBox to cause an onChange in Netscape 7 with up and down arrow keys **
 * selObj - the selection object
 * event - the key event
 */
function chgEvt(selObj, event) {

   if(WClient.isBrowserMozilla() && WClient.isBrowserVersion7Up())
   {

      var wEvent = new WEvent(event);
      if(wEvent.getKeyCode() == 38 || wEvent.getKeyCode() == 40)
      {
         selObj.blur();
         selObj.focus();
      }
   }

}



////////////////////////////////////////////////////////////////////////////////
// complex component functions
////////////////////////////////////////////////////////////////////////////////

/** WMessageBox **
 * name - the name of the close hyperlink
 * ids - the ids associated with the close hyperlink
 * formName - the encoded name of the form
 * wclhidden - the encoded name of the hidden field for the close hyperlink name
 * wclMessageClosed - the encodedName of the hidden field for the ids
 */
function msgAct(name, ids, formName, wclhidden, wclMessageClosed) {
   if (document != null && document.forms != null && formName != null) {
      var form = document.forms[formName];
      if (form != null) {
         eval( "form." + wclhidden + ".value = '" + name + "'" );
         eval( "form." + wclMessageClosed + ".value = '" + ids + "'" );
         form.submit();
      }
   }
   return false;
}

/** WNotebook **
 * formName - the encoded name of the form
 * actionName - the name of the action being performed
 * actionValue - the name of the component performing the action
 * actionNameEnc - the encoded name of the action being performed
 * wclhidden - the encoded name of the hidden field
 * wclanchor - the encoded name of the hidden field for the anchor
 */
function doNb(formName, actionName, actionValue, actionNameEnc, wclhidden, wclanchor) {
   return doSubmit(formName, actionName, actionValue, null, actionNameEnc, wclhidden, wclanchor);
}

/** WWizard **
 * formName - the encoded name of the form
 * actionName - the name of the action being performed
 * actionValue - the name of the component performing the action
 * actionNameEnc - the encoded name of the action being performed
 * wclhidden - the encoded name of the hidden field
 * wclanchor - the encoded name of the hidden field for the anchor
 */
function doWiz(formName, actionName, actionValue, actionNameEnc, wclhidden, wclanchor) {
   return doSubmit(formName, actionName, actionValue, null, actionNameEnc, wclhidden, wclanchor);
}

/** WTree (for the expand/collapse events) **
 * formName - the encoded name of the form
 * actionName - the name of the action being performed
 * actionValue - the name of the component performing the action
 * anchorName - the name of the anchor used when the page is refreshed
 * actionNameEnc - the encoded name of the action being performed
 * wclhidden - the encoded name of the hidden field
 * wclanchor - the encoded name of the hidden field for the anchor
 * idName - the encoded name of the hidden field that specifies which tree in the form is performing the action
 */
function doTree(formName, actionName, actionValue, anchorName, actionNameEnc, wclhidden, wclanchor, idName){
   if (document != null && document.forms != null && formName != null) {
      var form = document.forms[formName];
      if (form != null) {
			if(idName != null){
				 eval("form." + idName + ".value = '" + idName + "'");
			}
		}
	}
	return doSubmit(formName, actionName, actionValue, anchorName, actionNameEnc, wclhidden, wclanchor);
}

/**
 * formName - the encoded name of the form
 * actionName - the name of the action being performed
 * actionValue - the name of the component performing the action
 * anchorName - the name of the anchor used when the page is refreshed
 * actionNameEnc - the encoded name of the action being performed
 * wclhidden - the encoded name of the hidden field
 * wclanchor - the encoded name of the hidden field for the anchor
 */
function doSubmit(formName, actionName, actionValue, anchorName, actionNameEnc, wclhidden, wclanchor) {
   if (document != null && document.forms != null && formName != null) {
      var form = document.forms[formName];
      if (form != null) {
         if (actionName != null) {
            eval("form." + actionNameEnc + ".value = '" + actionValue + "'");
            eval("form." + wclhidden + ".value = '" + actionName + "'");
         }

         // We have to store the anchor as a hidden field so that it gets passed
         // along when the form's method is GET.  (When the method is GET, the
         // parameters on the form's action are ignored!)  The date ensures we'll
         // have a unique URL so that a URL can be invoked twice consecutively.
         /*if (anchorName != null) {
            var aDate = new Date();
            eval("form." + wclanchor + ".value = '" + anchorName + '_' + aDate.getTime() + "'");
            form.action += '#' + anchorName;
         } */
         if (anchorName != null) {
            var aDate = new Date();
			if(wclanchor != null)
				eval("form." + wclanchor + ".value = '" + anchorName + '_' + aDate.getTime() + "'");
            var idx = form.action.indexOf('#');
            if (idx > -1) {
                // strip off the anchor that's already on the url
                form.action = form.action.substring(0, idx);
            }
            form.action += '#' + anchorName;
         }

         form.submit();
      }
   }
   return false;
}

/** WPopupMenu **
 * formName - the encoded name of the form
 * actionName - the unique name of the action being performed
 * actionValue - the name of the component performing the action
 * actionNameEnc - the encoded name of the action being performed
 * menuID - the name of the unique id of the popup menu
 * menuCmd - the encoded name of the action being performed
 * wclhidden - the encoded name of the hidden field
 */
function doPop(formName, actionName, actionValue, actionNameEnc, menuID, menuCmd, wclhidden)
{
   if (document != null && document.forms != null && formName != null) {
       var form = document.forms[formName];
       if (form != null) {
           if (actionName != null && actionNameEnc != null && wclhidden != null) {
             eval("form['" + actionNameEnc + "'].value = '" + actionValue + "'");
             eval("form['" + wclhidden + "'].value = '" + actionName + "'");
           }
           // We have to store the command name as a hidden field so that it gets passed
           // along when the form is submitted.
           if (menuID != null) {
             eval("form['" + menuID + "'].value = '" + menuCmd + "'");
           }

           form.submit();
       }
   }
   return false;
}

/** WTable **
 * formName - the encoded name of the form
 * anchorName - the name of the anchor used when the page is refreshed
 * wclanchor - the encoded name of the hidden field for the anchor
 */
function doAnchor(formName, anchorName, wclanchor) {
   var form = document.forms[formName];
   if (form != null && anchorName != null && wclanchor != null) {
      var aDate = new Date().getTime();
      eval("form." + wclanchor + ".value = '" + aDate + "'");

      // remove existing anchorName
      var index = form.action.indexOf( "#" );
      if ( index != -1 )
      {
          form.action = form.action.substring( 0, index );
      }
      form.action += '#' + anchorName;

      var inputName = "wclAnchorHash";
      var input  = document.getElementById( inputName );
      if ( !input )
      {
          input = document.createElement( "INPUT" );
          with ( input )
          {
              type  = "hidden";
              id    = inputName;
              name  = inputName;
          }
          form.appendChild( input );
      }
      input.value = anchorName;
   }
   return true;
}

/** WTable **
 * formName - the encoded name of the form
 * actionName - the name of the action being performed
 * actionValue - the name of the component performing the action
 * anchorName - the name of the anchor used when the page is refreshed
 * actionNameEnc - the encoded name of the action being performed
 * wclhidden - the encoded name of the hidden field
 * wclanchor - the encoded name of the hidden field for the anchor
 */
function doTbl(formName, actionName, actionValue, anchorName, actionNameEnc, wclhidden, wclanchor) {
   if (document != null && document.forms != null && formName != null) {
      var form = document.forms[formName];
      if (form != null) {
         if (actionName != null) {
            eval("form." + actionNameEnc + ".value = '" + actionValue + "'");
            eval("form." + wclhidden + ".value = '" + actionName + "'");
         }

         doAnchor(formName, anchorName, wclanchor);

         form.submit();
      }
      return false;
   }
}

/** WTable **
 * toggles the background color for a row in the wtable
 */
function doTgl(inputElement) {
   if (inputElement != null)
   {
      var cells = inputElement.parentNode.parentNode.parentNode.childNodes;
      if (cells != null)
      {
         var suffix = cells[0].className.substring(cells[0].className.indexOf("s") > -1 ? 4 : 3);
         var style = "tbl" + (inputElement.checked ? "s" : "") + suffix;
         for (var i=0; i<cells.length; i++)
         {
            cells[i].className = style;
         }
      }
   }
   return true;
}

/** WTable **
 * toggles radio buttons in wtable
 */
function doRTgl(radioElement) {
   if (radioElement != null) {
      var radioGroup = radioElement.form.elements[radioElement.name];
      var done = false;
      if (!radioGroup.length)
         radioGroup = new Array(radioElement);
      for (var i=0; !done && i<radioGroup.length; i++) {
         if (radioGroup[i].parentNode.parentNode.className.indexOf("tbls2") == 0) {
            done = doTgl(radioGroup[i]);
            if (radioGroup[i] == radioElement)
               radioElement.checked = false;
         }
      }
      doTgl(radioElement);
   }
   return true;
}

/** WTable **
 * formName - the encoded name of the form
 * conditionsName - the encoded name of the conditions dropdown
 * startNumberName - the encoded name of the start number
 * endNumberName - the encoded name of the end number
 */
function numUpdate(formName, conditionsName, startNumberName, endNumberName) {
   var form = document.forms[formName];
     if (form != null) {
        var index = eval("form." + conditionsName + ".selectedIndex;");
        eval("form." + startNumberName+ ".parentNode.parentNode.parentNode.style.visibility=index == 0 ? 'hidden' : 'visible'");
        eval("form." + endNumberName + ".parentNode.parentNode.parentNode.style.visibility=index !=7 && index != 8? 'hidden' : 'visible'");
     }
   return true;
}

/** WTable **
 * formName - the encoded name of the form
 * conditionsName - the encoded name of the conditions dropdown
 * startDateName - the encoded name of the start date chooser
 * startTimeName - the encoded name of the start time chooser
 * endDateName - the encoded name of the end date chooser
 * endTimeName - the encoded name of the end time chooser
 */
function dateUpdate(formName, conditionsName, startDateName, startTimeName, endDateName, endTimeName) {
   var form = document.forms[formName];
     if (form != null) {
        var index = eval("form." + conditionsName + ".selectedIndex;");
        eval("form." + startDateName+ ".parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.visibility=index == 0 ? 'hidden' : 'visible'");
        eval("form." + startTimeName+ ".parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.visibility=index == 0 ? 'hidden' : 'visible'");
        eval("form." + endDateName+ ".parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.visibility=index !=3 ? 'hidden' : 'visible'");
        eval("form." + endTimeName+ ".parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.visibility=index !=3 ? 'hidden' : 'visible'");
     }
   return true;
}

/** WFDALayout **
 * Use this method to create a state object to track the current state of
 * the FDA.  The FDA renderer should instantiate a state object and store
 * it in a var with an encoded name to prevent namespace collisions.
 * Components that use the same FDA should refer to the same var by using
 * encodeName on the FDA id.  The state object should be passed into the FDA
 * toggle method.
 *
 * fdaId - the id of the fda layout
 * defaultId - the id of the default div
 */
function fdaState( fdaId, defaultId ) {
   // the id of the fda layout
   this.fdaId = fdaId;
   // the id of the default div
   this.defaultId = defaultId;
   // the id of the div that is currently shown
   this.currentId = this.defaultId;
}

/** WFDALayout **
 * Use this method to toggle the current text displayed in the FDA.
 *
 * fdaState - the state object that keeps track of the current FDA text.
 *    the javascript var will be initialized by the FDA renderer, so other
 *    components should refer to the same var by using encodeName on the FDA id.
 * contentId - the id of the fda content to display, or null to disply the default
 */
function fdaDesc( fdaState, contentId ) {
   if ( fdaState != null ) {
      if ( fdaState.currentId != null ) {
         var hideMe = document.getElementById( fdaState.currentId );
         if ( hideMe != null ) {
             hideMe.style.display = "none";
             fdaState.currentId = null;
         }
      }

      // appending "Div" here is a bit unorthodox, but calls to this function
      // shouldn't need to know about it
      var nextId = ( contentId != null ) ? contentId + "Div" : fdaState.defaultId;
      if ( nextId != null ) {
         var showMe = document.getElementById( nextId );
         if ( showMe != null ) {
             showMe.style.display = "inline";
             fdaState.currentId = nextId;
         }
         /*
         // this would set the fda to the default content if the requested
         // content was not found.  not sure if this is the expected behavior?
         else if ( nextId != fdaState.defaultId ) {
            nextId = fdaState.defaultId;
            showMe = document.getElementById( nextId );
            if ( showMe != null ) {
               showMe.style.display = "inline";
               fdaState.currentId = nextId;
            }
         }
         */
      }
   }
   return true;
}

/** WDualList **
 * dualListId - the id of the dual list component
 * formName - the encoded name of the form
 * leftBoxName - the encoded name of the left/from box
 * rightBoxName - the encoded name of the right/to box
 * addButtonName - the encoded name of the add button
 * removeButtonName - the encoded name of the remove button
 * upButtonName - the encoded name of the up button
 * downButtonName - the encoded name of the down button
 */
function dlState( dualListId, formName, leftBoxName, rightBoxName, addButtonName, removeButtonName, upButtonName, downButtonName ) {
   this.dualListId = dualListId;
   this.formName = formName;
   this.leftBoxName = leftBoxName;
   this.rightBoxName = rightBoxName;
   this.addButtonName = addButtonName;
   this.removeButtonName = removeButtonName;
   this.upButtonName = upButtonName;
   this.downButtonName = downButtonName;
}

/** WDualList **
 * dualListState - the state object that keeps track of the current dual list.
 *    the javascript var will be initialized by the dual list renderer
 * isLeftBox - true indicates left box, false indicates right box
 */
function dlSelAll( dualListState, isLeftBox ) {
   if ( dualListState != null ) {
      var listName = (isLeftBox) ? dualListState.leftBoxName : dualListState.rightBoxName;
      var listBox = eval( "document.forms['" + dualListState.formName + "']." + listName );
      if ( listBox != null ) {
         for (i = 0; i < listBox.options.length; i++ ) {
            listBox.options[i].selected = true;
         }
      }
   }
}

/** WDualList **
 * dualListState - the state object that keeps track of the current dual list.
 *    the javascript var will be initialized by the dual list renderer
 * isLeftBox - true indicates left box, false indicates right box
 */
function dlMove( dualListState, isLeftBox ) {
   if ( dualListState != null ) {
      var fromName = (isLeftBox) ? dualListState.leftBoxName : dualListState.rightBoxName;
      var toName = (isLeftBox) ? dualListState.rightBoxName : dualListState.leftBoxName;
      var fromList = eval( "document.forms['" + dualListState.formName + "']." + fromName );
      var toList = eval( "document.forms['" + dualListState.formName + "']." + toName );
      if ( toList != null && fromList != null ) {
         toList.selectedIndex = -1;
         var lastIndex = -1;
         var index = fromList.selectedIndex;
         while (-1 != index) {
            lastIndex = index;
            var selectedOption = fromList.options[index];
            var newOption = new Option( selectedOption.text, selectedOption.value );
            toList.options[toList.options.length] = newOption;
            toList.options[toList.options.length - 1].selected = true;
            fromList.options[index] = null;
            index = fromList.selectedIndex;
         }
         if ((-1 != lastIndex) && (0 < fromList.options.length)) {
            if (lastIndex >= fromList.options.length) {
               lastIndex--;
            }
            fromList.options[lastIndex].selected = true;
         }
      }
   }
}

/** WDualList **
 * dualListState - the state object that keeps track of the current dual list.
 *    the javascript var will be initialized by the dual list renderer
 * isAddButton - whether the button being used is the add button
 * isLeftBox - true indicates left box, false indicates right box
 */
function dlUpdate( dualListState, isAddButton, isLeftBox ) {
   if ( dualListState != null ) {
      var listName = (isLeftBox) ? dualListState.leftBoxName : dualListState.rightBoxName;
      var listBox = eval( "document.forms['" + dualListState.formName + "']." + listName );
      var buttonName = (isAddButton) ? dualListState.addButtonName : dualListState.removeButtonName;
      var button = eval( "document.forms['" + dualListState.formName + "']." + buttonName );
      if ( button != null && listBox != null ) {
         button.disabled = (-1 == listBox.selectedIndex);
         if ( button.disabled ) {
            button.className = 'b3';
         }
         else {
            button.className = 'b1';
         }
      }
   }
}

/** WDualList **
 * dualListState - the state object that keeps track of the current dual list.
 *    the javascript var will be initialized by the dual list renderer
 * isLeftBox - true indicates left box, false indicates right box
 * direction - negative value indicates moving up, positive value indicates moving down
 */
function dlReorder( dualListState, isLeftBox, direction ) {
   if ( dualListState != null ) {
      var listName = (isLeftBox) ? dualListState.leftBoxName : dualListState.rightBoxName;
      var listBox = eval( "document.forms[ '" + dualListState.formName + "']." + listName );
      if ( listBox != null ) {
         var start = (direction < 0) ? 0 : listBox.options.length - 1;
         var end   = (direction < 0) ? listBox.options.length : -1;
         while ((start != end) &&
                (0 <= start) &&
                (start < listBox.options.length) &&
                listBox.options[start].selected)
         {
            start -= direction;
         }
         for (var i = start; (i != end) && (0 <= i) && (i < listBox.options.length); i -= direction ) {
            if (listBox.options[i].selected) {
               var partner = i + direction;
               if ((0 <= partner) && (listBox.options.length > partner)) {
                  var temp1 = listBox.options[i];
                  var tempText = temp1.text;
                  var tempValue = temp1.value;
                  var tempSelect = temp1.selected;
                  var temp2 = listBox.options[partner];
                  temp1.text = temp2.text;
                  temp1.value = temp2.value;
                  temp1.selected= temp2.selected;
                  temp2.text = tempText;
                  temp2.value = tempValue;
                  temp2.selected = tempSelect;
               }
            }
         }
      }
   }
}
