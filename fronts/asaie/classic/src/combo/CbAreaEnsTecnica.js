Ext.define('Admin.combo.CbAreaEnsTecnica',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.AreaTecnicaStore'
    ],
	alias	    : 'widget.CbAreaEnsTecnica',
	fieldLabel	: 'Área de enseñanza técnica',
	name		: 'id_area_tec',
    displayField: 'tipo',
    valueField	: 'id',
	reference 	: 'CbAreaEnsTecnica',
    publishes   : 'value',
    store		: 'AreaTecnicaStore'
});