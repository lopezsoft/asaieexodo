Ext.define('Admin.combo.CbNombreCargoDocente',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.NombreCargoDocenteStore'
    ],
	alias	    : 'widget.CbNombreCargoDocente',
	fieldLabel	: 'Nombre del cargo',
	name		: 'n_cargo',
    displayField: 'nom_cargo',
    valueField	: 'id_nomb',
	reference 	: 'CbNombreCargoDocente',
    publishes   : 'value',
    store		: 'NombreCargoDocenteStore'
});