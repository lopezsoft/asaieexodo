Ext.define('Admin.combo.CbVinculacionDocente',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.VinculacionPersonalStore'
    ],
	alias	    : 'widget.CbVinculacionDocente',
	fieldLabel	: 'Tipo de vinculación',
	name		: 'cod_vin',
    displayField: 'nombre',
    valueField	: 'id',
	reference 	: 'CbVinculacionDocente',
    publishes   : 'value',
    store		: 'VinculacionPersonalStore'
});