Ext.define('Admin.combo.CbCaracterEstablecimiento',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.CaracterSchoolStore'
    ],
	alias	    : 'widget.CbCaracterEstablecimiento',
	fieldLabel	: 'Caracter',
	name		: 'ID_CARACTER',
    displayField: 'tipo',
    valueField	: 'id_caracter',
	reference 	: 'CbCaracterEstablecimiento',
    publishes   : 'value',
    store		: 'CaracterSchoolStore'
});
