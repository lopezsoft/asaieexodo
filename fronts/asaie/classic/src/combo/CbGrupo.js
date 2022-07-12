/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.combo.CbGrupo',{
    extend	: 'Admin.combo.CustomComboBox',
    requires: [
        'Admin.store.general.GrupoStore'
    ],
    alias	    : 'widget.CbGrupo',
    fieldLabel	: 'Grupo',
    name		: 'grupo',
    displayField: 'grupo',
    valueField	: 'grupo',
    itemId		: 'comboGrupo',
    reference 	: 'comboGrupo',
    publishes   : 'value',
    store       : 'GrupoStore',
    bind: {
        visible: '{comboGrados.value}'
    }
});