Ext.define('Admin.combo.CbUbicacionAdmin',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.UbicacionAdminStore'
    ],
	alias	    : 'widget.CbUbicacionAdmin',
	fieldLabel	: 'Ubicación',
	name		: 'id_ubicacion',
    displayField: 'tipo',
    valueField	: 'id',
	reference 	: 'CbUbicacionAdmin',
    publishes   : 'value',
    store		: 'UbicacionAdminStore'
});