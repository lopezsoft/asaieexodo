Ext.define('Admin.combo.CbEtnias',{
	extend	: 'Admin.combo.CustomComboBox',
	 requires: [
       'Admin.store.general.EtniasStore'
    ],
    initComponent: function(){
        Admin.getApplication().onStore('general.EtniasStore');
        this.callParent(arguments);
    },
	alias	    : 'widget.CbEtnias',
	fieldLabel	: 'Etnia',
	name		: 'cod_etnia',
    displayField: 'nombre_etnia',
    valueField	: 'id',
    itemId		: 'CbEtnias',
	reference 	: 'CbEtnias',
    publishes   : 'value',
    store		: 'EtniasStore'
});