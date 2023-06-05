Ext.define('Admin.combo.CbParentescoFamiliar',{
	extend	: 'Admin.combo.CustomComboBox',
	requires: [
        'Admin.store.inscripciones.ParentescoFamiliarStore'
    ],
	alias		: 'widget.CbParentescoFamiliar',
	fieldLabel	: 'Parentesco',
	name		: 'id_relationship',
    displayField: 'name_kinship',
    valueField	: 'id',
    store		: 'ParentescoFamiliarStore'
});