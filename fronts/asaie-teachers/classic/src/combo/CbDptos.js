/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.combo.CbDptos',{
    extend	: 'Admin.combo.CustomComboBox',
    requires: [
       'Admin.store.general.DptosStore'
    ],
    alias	    : 'widget.CbDptos',
    fieldLabel	: 'Departamento',
    name		: 'dpto',
    displayField: 'nombre',
    valueField	: 'dpto',
    itemId		: 'CbDptos',
    reference 	: 'CbDptos',
    publishes   : 'value',
    store		: 'DptosStore'
});
