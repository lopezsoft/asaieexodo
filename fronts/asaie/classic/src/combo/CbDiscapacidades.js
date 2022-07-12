Ext.define('Admin.combo.CbDiscapacidades',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.DiscapacidadesStore'
    ],
	alias	    : 'widget.CbDiscapacidades',
	fieldLabel	: 'Discapadicdad atendida',
	name		: 'DISCA',
    displayField: 'tipo',
    valueField	: 'COD_DISC',
	reference 	: 'CbDiscapacidades',
    publishes   : 'value',
    store		: 'DiscapacidadesStore'
});