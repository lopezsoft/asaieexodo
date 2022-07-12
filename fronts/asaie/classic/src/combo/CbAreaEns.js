Ext.define('Admin.combo.CbAreaEns',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.AreaEnsStore'
    ],
	alias	    : 'widget.CbAreaEns',
	fieldLabel	: 'Área a la que fue nombrado',
	name		: 'arean_ens',
    displayField: 'tipo',
    valueField	: 'id',
	reference 	: 'CbAreaEns',
    publishes   : 'value',
    store		: 'AreaEnsStore'
});