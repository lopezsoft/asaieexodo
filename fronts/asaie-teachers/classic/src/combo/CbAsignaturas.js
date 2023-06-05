Ext.define('Admin.combo.CbAsignaturas',{
	extend	: 'Admin.combo.CustomComboBox',
	 requires: [
        'Admin.store.general.AsignaturasStore'
    ],
	alias	: 'widget.CbAsignaturas',
	fieldLabel	: 'Asignatura:',
	name		: 'cod_asig',
    displayField: 'asignatura',
    valueField	: 'id_asig',
    itemId		: 'comboAsignaturas',
	reference 	: 'comboAsignaturas',
    store		: 'AsignaturasStore',
    autoLoadOnValue : false
});