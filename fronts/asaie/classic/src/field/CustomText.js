Ext.define('Admin.field.CustomText',{
	extend 		: 'Ext.form.field.Text',
	labelAlign	: 'top',
    labelStyle	: 'font-weight:bold',
    width 		: '100%',
	allowBlank 	: false,
	alias		: 'widget.customtext',
	selectOnFocus  : true,
	msgTarget	: 'side',
	tooltip 	: '',
    listeners: {
	    'focus' : function (customText, event, eOpts) {
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