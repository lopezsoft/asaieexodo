Ext.define('Admin.field.CustomDate',{
	extend : 'Ext.form.field.Date',
	labelAlign	: 'top',
    labelStyle	: 'font-weight:bold',
    // width 		: '99%',
	allowBlank 	: false,
	alias		: 'widget.customDate',
	xtype		: 'customdate',
	selectOnFocus  : true,
	msgTarget	: 'side',
	value		: new Date(),
	fieldLabel	: 'Fecha',
	format 		: 'd-m-Y',
	tooltip 	: ''
});