Ext.define('Admin.store.inscripciones.FamiliesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'FamiliesStore',
    pageSize: 0,
    proxy: {
        extraParams : {
            pdbTable    : 'families',
            order       : '{"name1,name2,lastname1,lastname2":"ASC"}'
        }
    },
    requires: [
        'Admin.model.inscripciones.FamiliaresModel'
    ],
    model   : 'Admin.model.inscripciones.FamiliaresModel'
});
