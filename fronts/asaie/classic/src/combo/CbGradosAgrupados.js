Ext.define('Admin.combo.CbGradosAgrupados',{
	extend	: 'Admin.combo.CustomComboBox',
	 requires: [
       'Admin.store.general.GradosAgrupadosStore'
    ],
	alias	    : 'widget.CbGradosAgrupados',
	fieldLabel	: 'Grupo de grados',
	name		: 'id_grado_agrupado',
    displayField: 'nombre_grado_agrupado',
    valueField	: 'id',
	reference 	: 'CbPeriodosNiveles',
    publishes   : 'value',
    store		: 'GradosAgrupadosStore'
});
