Ext.define('Admin.combo.CbPoblacionAtendida',{
	extend	: 'Admin.combo.CustomComboBox',
	 requires: [
       'Admin.store.general.PoblacionatendidaStore'
    ],
	alias	    : 'widget.CbPoblacionAtendida',
	fieldLabel	: 'Población atendida',
	name		: 'GENERO',
    displayField: 'nombre_sexo',
    valueField	: 'id',
	reference 	: 'CbPoblacionAtendida',
    publishes   : 'value',
    store		: 'PoblacionatendidaStore'
});