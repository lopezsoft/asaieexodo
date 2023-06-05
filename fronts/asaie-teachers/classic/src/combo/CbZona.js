Ext.define('Admin.combo.CbZona',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.ZonaStore'
    ],
	alias	    : 'widget.CbZona',
	fieldLabel	: 'Zona:',
	name		: 'id_zona',
    displayField: 'tipo',
    valueField	: 'id_zona',
    itemId		: 'CbZona',
	reference 	: 'CbZona',
    publishes   : 'value',
    store		: 'ZonaStore'
});