Ext.define('Admin.combo.CbTipoFamiliar',{
	extend	: 'Admin.combo.CustomComboBox',
	requires: [
        'Admin.store.inscripciones.TipoFamiliarStore'
    ],
	alias		: 'widget.CbTipoFamiliar',
	itemId		: 'CbTipoFamiliar',
	reference	: 'CbTipoFamiliar',
	fieldLabel	: 'Tipo',
	name		: 'id_type',
    displayField: 'family_type_name',
    valueField	: 'id',
    store		: 'TipoFamiliarStore'
});