Ext.define('Admin.combo.CbEstado',{
	extend	: 'Admin.combo.CustomComboBox',
	requires: [
        'Admin.store.general.EstadoStore'
    ],
	alias		: 'widget.CbEstado',
	fieldLabel	: 'Estado',
	name		: 'id_state',
    displayField: 'name_state',
    valueField	: 'id',
    itemId		: 'CbEstado',
    store		: 'EstadoStore'
});
