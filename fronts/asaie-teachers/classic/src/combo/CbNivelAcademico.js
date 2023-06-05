Ext.define('Admin.combo.CbNivelAcademico',{
	extend	: 'Admin.combo.CustomComboBox',
	 requires: [
       'Admin.store.general.NivelesAcademicosStore'
    ],
	alias	    : 'widget.CbNivelAcademico',
	fieldLabel	: 'Nivel académico',
	name		: 'id_nivel',
    displayField: 'nombre_nivel',
    valueField	: 'id',
	reference 	: 'CbNivelAcademico',
    itemId      : 'CbNivelAcademico',
    publishes   : 'value',
    store		: 'NivelesAcademicosStore'
});
