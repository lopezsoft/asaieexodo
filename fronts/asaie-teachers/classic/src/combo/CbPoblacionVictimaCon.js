Ext.define('Admin.combo.CbPoblacionVictimaCon',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.PoblacionVictimaConStore'
    ],
    initComponent: function(){
        Admin.getApplication().onStore('general.PoblacionVictimaConStore');
        this.callParent(arguments);
    },
	alias	    : 'widget.CbPoblacionVictimaCon',
	fieldLabel	: 'Población victima de conflicto',
	name		: 'pob_vict_conf',
    displayField: 'nombre',
    valueField	: 'id',
    itemId		: 'CbPoblacionVictimaCon',
	reference 	: 'CbPoblacionVictimaCon',
    publishes   : 'value',
    store		: 'PoblacionVictimaConStore'
});