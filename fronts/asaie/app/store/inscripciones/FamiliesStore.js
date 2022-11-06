Ext.define('Admin.store.inscripciones.FamiliesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'FamiliesStore',
    pageSize: 0,
    proxy: {
        extraParams : {
            pdbTable    : 'families',
            order       : '{"name1":"ASC", "name2":"ASC", "lastname1":"ASC"}'
        }
    },
    requires: [
        'Admin.model.inscripciones.FamiliaresModel'
    ],
    model   : 'Admin.model.inscripciones.FamiliaresModel'
});
