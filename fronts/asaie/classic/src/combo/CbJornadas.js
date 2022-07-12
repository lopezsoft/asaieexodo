/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.combo.CbJornadas',{
    extend	: 'Admin.combo.CustomComboBox',
    requires: [
        'Admin.store.general.JornadasStore'
    ],
    alias	: 'widget.CbJornadas',
    fieldLabel	: 'Jornada',
    name		: 'cod_jorn',
    displayField: 'jornada',
    valueField	: 'cod_jorn',
    itemId		: 'comboJornadas',
    reference 	: 'comboJornadas',
    publishes   : 'value',
    store		: 'JornadasStore'
});
