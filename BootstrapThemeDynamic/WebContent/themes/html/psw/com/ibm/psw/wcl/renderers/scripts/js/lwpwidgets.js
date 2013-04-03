/*
* Selects all rows in the current page of the table
*/
function lwpTableSelectAll(inputElement, hoverTextOn, hoverTextOff)
{
	if(inputElement == null || inputElement.checked == null) 
		return;
	
	var parentForm = inputElement.form;
	var children = parentForm.elements;
	for(var i=0; i < children.length; i++)
	{
		var child = children[i];
		if(child != null)
		{
			if(child.name != null && child.name.indexOf("client-select") >= 0)
			{
				child.checked= !(inputElement.checked);
				child.click();
			}	
		}
	}
	//change the hover text
	if(inputElement.checked)
		inputElement.title = hoverTextOff;
	else
		inputElement.title = hoverTextOn;		
}

/*
* Highlights the currently selected row
*/
function lwpTableRowHighlight(inputElement, descriptionRow)
{
	if(inputElement != null)
	{
		var pNode = inputElement.parentNode;
		while(pNode != null)
		{
			if(pNode.tagName == "TR" || pNode.tagName == "tr") 
				break;
			else
				pNode = pNode.parentNode;					
		}
		
		if(pNode != null)
		{
			if (inputElement.checked)
			{
				var rowClassName = pNode.className;
				if (rowClassName.indexOf("wpsTableSelectedRow") == -1) 
				{
					pNode.className = pNode.className + " wpsTableSelectedRow";
				}
			}
			else
			{
				var rowClassName = pNode.className;
				if (rowClassName.indexOf("wpsTableSelectedRow") != -1) 
				{
					pNode.className = rowClassName.replace("wpsTableSelectedRow", "");
				}
			}
				
			if (descriptionRow)
			{
				var parentTable = pNode.parentNode;
				var rows = parentTable.rows;
				for(rowIndex=0; rowIndex < rows.length; rowIndex++)
				{
				    if (rows[rowIndex] == pNode)
				    {
					var nextRow = rows[rowIndex + 1];

					if(inputElement.checked)
						nextRow.className = "wpsTableRowDetail wpsTableSelectedRow";
					else
						nextRow.className = "wpsTableRowDetail";
				    }
				}
			}
		}						
	}
}

/*
* Returns false when no row is selected in the current page of the table
*/
function lwpTableCheckSelection(inputElement, exactlyOne)
{
	var bReturn = false;
	if(inputElement != null)
	{
		var parentForm = inputElement.form;
		var children = parentForm.elements;
		for(var i=0; i < children.length; i++)
		{
			var child = children[i];

			if( child != null && 
				child.name != null &&
				child.name.indexOf("client-select") >= 0)
			{
				if(child.checked)
				{
					if (exactlyOne && bReturn)
					{
						return false;
					}
					bReturn = true;
				}
			}
		}
	}

	return bReturn;		
}

/*
* Returns the values of all selected items in a table as an array.
*/
function lwpTableGetValues(inputElement)
{
	var vals = new Array();
	if(inputElement != null)
	{
		var parentForm = inputElement.form;
		var children = parentForm.elements;
		for(var i=0; i < children.length; i++)
		{
			var child = children[i];

			if( child != null && 
				child.name != null &&
				child.name.indexOf("client-select") >= 0)
			{
				if(child.checked)
				{
					vals[vals.length] = child.value;
				}
			}
		}
	}
	return vals;
}

/*
* Process the onClick event for buttons produced by <lwp:WButton> tag
*/
function lwpButtonOnClick(userValue, buttonName, formName, hiddenName, submitForm, buttonElement)
{
	if(userValue != null && userValue.length > 0)
	{
		var str = userValue.replace("\'", "'");
		var res = eval(str);
		if(!res) return false;
	}
	if(submitForm && buttonElement != null)
	{
		if(formName != null)
			setWFormAction(buttonName, formName, hiddenName);
		var formObject = buttonElement.form;
		if(formObject)
			formObject.submit();
	}
	return true;		
}

/*
* Change the image src, alt & title and text & title on a button produced by <lwp:WButton> tag
*/
function lwpChangeWButton(buttonName, formName, imgSrc, imgAlt, imgTitle, txt, txtTitle)
{
	lwpChangeWImageButton(buttonName, formName, imgSrc, imgAlt, imgTitle);
	lwpChangeWTextButton(buttonName, formName, txt, txtTitle);
}

/*
* Change the image src, alt & title on a button produced by <lwp:WButton> tag
*/
function lwpChangeWImageButton(buttonName, formName, imgSrc, imgAlt, imgTitle)
{
	if (buttonName != null && imgSrc != null && imgAlt != null && imgTitle != null)
	{
		var button = null;
		if (formName == null || formName.length == 0)
		{
			var buttonArray = document.getElementsByName(buttonName);	
			if (buttonArray.length > 0)
			{
				button = buttonArray[0];
			}
		}
		else
		{
			button = eval( "document.forms['" + formName + "']." + buttonName );
		}
		
		if (button != null) 
		{
			var image = button.childNodes[0];
			if (image != null) 
			{
				image.src = imgSrc;
				image.alt = imgAlt;
				image.title = imgTitle;
			}
		}
	}
}

/*
* Change the text & title on a button produced by <lwp:WButton> tag
*/
function lwpChangeWTextButton(buttonName, formName, txt, txtTitle)
{
	if (buttonName != null && txt != null && txtTitle != null)
	{
		var button = null;
		if (formName == null || formName.length == 0)
		{
			var buttonArray = document.getElementsByName(buttonName);	
			if (buttonArray.length > 0)
			{
				button = buttonArray[0];
			}

		}
		else
		{
			button = eval( "document.forms['" + formName + "']." + buttonName );
		}

		if (button != null) 
		{  	
			var id = (button.childNodes.length > 1) ? 1 : 0 ;
			var text = button.childNodes[id];
			if (text != null)
			{
				button.replaceChild(document.createTextNode(txt), text);
				button.title = txtTitle;
			}
		}
	}
}

/*
* Toggle Enable/Disable of a button produced by <lwp:WButton> tag
* Same as WButton tag, the disabled styleClass name is assumed to be postfixed with "Disabled", 
* and imgSrc will not be disabled.
*/
function lwpToggleButton(buttonName, formName, isEnabled)
{
	if (buttonName != null)
	{
		var button = null;
		if (formName == null || formName.length == 0)
		{
			var buttonArray = document.getElementsByName(buttonName);	
			if (buttonArray.length > 0)
			{
				button = buttonArray[0];
			}

		}
		else
		{
			button = eval( "document.forms['" + formName + "']." + buttonName );
		}
		
		if (button != null) 
		{
			var styleClass = button.className;
			var postfix = "Disabled";
			if (isEnabled == "true" && button.disabled)
			{
				button.className = styleClass.substring(0, styleClass.lastIndexOf(postfix));
				button.disabled = false;
			}
			else if (isEnabled == "false" && !button.disabled)
			{
				button.className = styleClass + postfix;
				button.disabled = true;
			}
			else if (isEnabled == null)
			{
				if (button.disabled)
				{
					button.className = styleClass.substring(0, styleClass.lastIndexOf(postfix));
				}
				else
				{
					button.className = styleClass + postfix;
				}
				button.disabled = !button.disabled;
			}
		}
	}	
}