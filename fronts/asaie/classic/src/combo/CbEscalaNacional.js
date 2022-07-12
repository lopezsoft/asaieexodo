Ext.define('Admin.combo.CbEscalaNacional',{
	extend	: 'Admin.combo.CustomComboBox',
	 requires: [
       'Admin.store.general.EscalaNacionalStore'
    ],
	alias	: 'widget.CbEscalaNacional',
	fieldLabel	: 'Escala nacional:',
	name		: 'id_escala',
    displayField: 'nombre_escala',
    valueField	: 'id',
    itemId		: 'CbEscalaNacional',
	reference 	: 'CbEscalaNacional',
	publishes   : 'value',
	store		: 'EscalaNacionalStore'
});
