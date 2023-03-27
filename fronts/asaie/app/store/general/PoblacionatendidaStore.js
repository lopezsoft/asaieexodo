Ext.define('Admin.store.general.PoblacionatendidaStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'PoblacionatendidaStore',
    fields  : [
        { name : 'id'},
        { name: 'nombre_sexo'},
        { name: 'abrev_sexo'}
    ],
    proxy: {
        extraParams: {
            pdbTable: 'sexo'
        }
    }
});
