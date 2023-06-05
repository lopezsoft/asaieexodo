Ext.define('Admin.field.TextField',{
	extend 		: 'Ext.form.field.Text',
	labelAlign	: 'top',
    labelStyle	: 'font-weight:bold',
    width 		: '100%',
	allowBlank 	: false,
	alias		: 'widget.TextField',
	selectOnFocus  : true,
	//labelWidth	: 180,
	msgTarget	: 'side',
	tooltip 	: '',
    //emptyText 	: 'Digite los datos',
    listeners: {
	    'focus' : function (textField, event, eOpts) {
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