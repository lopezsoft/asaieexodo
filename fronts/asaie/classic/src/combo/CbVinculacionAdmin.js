Ext.define('Admin.combo.CbVinculacionAdmin',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.VinculacionAdminStore'
    ],
	alias	    : 'widget.CbVinculacionAdmin',
	fieldLabel	: 'Tipo de vinculación',
	name		: 'id_vinculacion',
    displayField: 'nombre',
    valueField	: 'id',
	reference 	: 'CbVinculacionAdmin',
    publishes   : 'value',
    store		: 'VinculacionAdminStore'
});