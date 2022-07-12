Ext.define('Admin.combo.CbCargoDocente',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.CargoDocenteStore'
    ],
	alias	    : 'widget.CbCargoDocente',
	fieldLabel	: 'Cargo',
	name		: 'cod_car',
    displayField: 'cargo_nom',
    valueField	: 'cod_car',
	reference 	: 'CbCargoDocente',
    publishes   : 'value',
    store		: 'CargoDocenteStore'
});