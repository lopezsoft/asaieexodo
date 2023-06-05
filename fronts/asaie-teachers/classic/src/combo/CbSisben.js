Ext.define('Admin.combo.CbSisben',{
	extend	: 'Admin.combo.ComboExpand',
	requires: [
        'Admin.store.general.SisbenStore'
    ],
    initComponent: function(){
        Admin.getApplication().onStore('general.SisbenStore');
        this.callParent(arguments);
    },
	alias		: 'widget.CbSisben',
	fieldLabel	: 'Sisben',
	name		: 'sisben',
    displayField: 'sisben',
    valueField	: 'sisben',
    itemId		: 'CbSisben',
    store		: 'SisbenStore',
    queryMode	: 'local'
});