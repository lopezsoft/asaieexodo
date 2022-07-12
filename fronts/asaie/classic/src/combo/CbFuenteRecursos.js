Ext.define('Admin.combo.CbFuenteRecursos',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.FuenteRecursosStore'
    ],
	alias	    : 'widget.CbFuenteRecursos',
	fieldLabel	: 'Fuente de recursos',
	name		: 'f_recurso',
    displayField: 'TIPO',
    valueField	: 'ID',
	reference 	: 'CbFuenteRecursos',
    publishes   : 'value',
    store		: 'FuenteRecursosStore'
});