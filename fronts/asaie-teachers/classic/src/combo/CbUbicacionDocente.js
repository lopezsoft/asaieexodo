Ext.define('Admin.combo.CbUbicacionDocente',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.UbicacionDocenteStore'
    ],
	alias	    : 'widget.CbUbicacionDocente',
	fieldLabel	: 'Ubicación',
	name		: 'id_ubicacion',
    displayField: 'tipo',
    valueField	: 'id',
	reference 	: 'CbUbicacionDocente',
    publishes   : 'value',
    store		: 'UbicacionDocenteStore'
});