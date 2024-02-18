Ext.define('Admin.field.NumberField',{
	extend	: 'Ext.form.field.Number',
	minValue 	: 0,
	maxValue	: 100000000000000,
	allowDecimals 	: true,
	decimalSeparator:'.',
	hideTrigger		: true,
    keyNavEnabled	: false,
    labelAlign	: 'top',
    labelStyle	: 'font-weight:bold',
    width 		: '100%',
	allowBlank 	: false,
	alias		: 'widget.customnumberfield',
	selectOnFocus  : true,
	tooltip 	: '',
	emptyText 	: 'Digite los datos',
	labelWidth	: 180,
    listeners: {
	    'focus' : function (textField, event, eOpts) {
	        if (!Ext.isEmpty(this.tooltip)) {
	            new Ext.ToolTip({
	                target : this.id,
	                trackMouse : true,
	                maxWidth : 300,
	                minWidth : 100,
	                minHeight: 5,
	                html : '<p align="justify">'+this.tooltip +'</p>'
	            });
	        }
	    }
	}
});
