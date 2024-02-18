Ext.define('Admin.field.YearField',{
	extend	: 'Admin.field.NumberField',
	allowBlank	: false,
	name		: 'year',
	value		: new Date().getFullYear(),
	maxValue	: 2030,
	minValue	: 1950,
	alias		: 'widget.yearField',
	xtype		: 'yearField',
	hideTrigger	: false,
	tooltip     : 'Año lectivo',
	// itemId      : 'yearField',
	labelAlign	: 'top',
	fieldLabel	: 'Año'
});
