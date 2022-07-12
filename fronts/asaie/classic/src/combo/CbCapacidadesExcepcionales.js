Ext.define('Admin.combo.CbCapacidadesExcepcionales',{
	extend	: 'Admin.combo.ComboExpand',
	 requires: [
       'Admin.store.general.CapacidadesExcepcionalesStore'
    ],
    initComponent: function(){
        Admin.getApplication().onStore('general.CapacidadesExcepcionalesStore');
        this.callParent(arguments);
    },
	alias	    : 'widget.CbCapacidadesExcepcionales',
	fieldLabel	: 'Capacidades excepcionales',
	name		: 'cap_exc',
    displayField: 'nombre',
    valueField	: 'id',
    itemId		: 'CbCapacidadesExcepcionales',
	reference 	: 'CbCapacidadesExcepcionales',
    publishes   : 'value',
    store		: 'CapacidadesExcepcionalesStore'
});