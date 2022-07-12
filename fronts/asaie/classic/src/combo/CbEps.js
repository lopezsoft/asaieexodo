/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.combo.CbEps',{
    extend	: 'Admin.combo.CustomComboBox',
    requires: [
        'Admin.store.general.EPSStore'
    ],
    initComponent: function(){
        Admin.getApplication().onStore('general.EPSStore');
        this.callParent(arguments);
    },
    alias	    : 'widget.CbEps',
    fieldLabel	: 'EPS Afiliado (a)',
    name		: 'id_eps',
    displayField: 'DES_EPS',
    valueField	: 'id',
    itemId		: 'CbEps',
    reference 	: 'CbEps',
    publishes   : 'value',
    store		: 'EPSStore'
});
