Ext.define('Admin.field.FileField',{
	extend		: 'Ext.form.field.File',
	alias		: 'widget.FileField',
	name		: 'foto',
	fieldLabel	: 'Foto del estudiante',
	labelAlign	: 'left',
    labelStyle	: 'font-weight:bold',
	labelWidth	: 180,
	width		: '100%',
	msgTarget	: 'side',
	buttonText	: 'Seleccionar un archivo en el equipo',
	allowBlank 	: false,
	buttonOnly 	: true,
	ui			: 'facebook',
	iconCls     :'x-fa fa-camera'
});