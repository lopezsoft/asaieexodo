/**
 * Created by LOPEZSOFT on 16/12/2015.
 */
Ext.define('Admin.store.docentes.BancoCliStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId:   'BancoCliStore',
    requires: [
        'Admin.model.docentes.BancoCliModel'
    ],
    model : 'Admin.model.docentes.BancoCliModel',
    proxy: {
        extraParams : {
          pbbTable : 'banco_cli'
        },
       url  : 'General/get_select_banco_cli'
    }
});