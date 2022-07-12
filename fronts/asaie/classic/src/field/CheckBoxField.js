Ext.define('Admin.field.CheckBoxField',{
	extend 		: 'Ext.form.field.Checkbox',
	labelAlign	: 'left',
    labelStyle	: 'font-weight:bold',
	alias		: 'widget.customcheckboxfield',
	labelWidth	: 180,
	msgTarget	: 'side',
	uncheckedValue  : 0,
	inputValue      : 1,
    tooltip 	: '',
	publishes   : 'value',
    listeners: {
	    'focus' : function (CheckBoxField, event, eOpts) {
	        var me = this;
	        if (!Ext.isEmpty(this.tooltip)) {
	            new Ext.ToolTip({
	                target : this.id,
	                trackMouse : true,
	                maxWidth : 300,
	                minWidth : 100,
	                html : '<p align="justify">'+ this.tooltip +'</p>'
	            });
	        }
	    }
	}
});