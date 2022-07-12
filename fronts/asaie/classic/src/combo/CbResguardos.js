Ext.define('Admin.combo.CbResguardos',{
	extend	: 'Admin.combo.CustomComboBox',
	 requires: [
       'Admin.store.general.ResguardosStore'
    ],
    initComponent: function(){
        Admin.getApplication().onStore('general.ResguardosStore');
        this.callParent(arguments);
    },
	alias	    : 'widget.CbResguardos',
	fieldLabel	: 'Resguardo',
	name		: 'cod_resgua',
    displayField: 'nombre_resguardo',
    valueField	: 'id',
    itemId		: 'CbResguardos',
	reference 	: 'CbResguardos',
    publishes   : 'value',
    store		: 'ResguardosStore'
});