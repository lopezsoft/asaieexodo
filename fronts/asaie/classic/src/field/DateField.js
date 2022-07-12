Ext.define('Admin.field.DateField',{
	extend : 'Ext.form.field.Date',
	labelAlign	: 'top',
    labelStyle	: 'font-weight:bold',
    width 		: '99%',
	allowBlank 	: false,
	alias		: 'widget.DateField',
	selectOnFocus  : true,
	msgTarget	: 'side',
	value		: new Date(),
	fieldLabel	: 'Fecha',
	format 		: 'd-m-Y',
	// labelWidth	: 180,
	tooltip : ''
});