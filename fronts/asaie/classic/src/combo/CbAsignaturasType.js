Ext.define('Admin.combo.CbAsignaturasType',{
	extend	: 'Admin.combo.CustomComboBox',
	 requires: [
        'Admin.store.general.AsignaturasTypeStore'
    ],
	alias	: 'widget.CbAsignaturasType',
	fieldLabel	: 'Asignatura:',
	name		: 'subject_related_id',
    displayField: 'asignatura',
    valueField	: 'id_pk',
    itemId		: 'comboAsignaturasTp',
	reference 	: 'comboAsignaturasTp',
    store		: 'AsignaturasTypeStore'
});
