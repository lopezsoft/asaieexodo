Ext.define('Admin.combo.CbNivelEns',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.NivelEnsStore'
    ],
	alias	    : 'widget.CbNivelEns',
	fieldLabel	: 'Nivel educativo de enseñanza',
	name		: 'cod_ense',
    displayField: 'nivel',
    valueField	: 'id',
	reference 	: 'CbNivelEns',
    publishes   : 'value',
    store		: 'NivelEnsStore'
});