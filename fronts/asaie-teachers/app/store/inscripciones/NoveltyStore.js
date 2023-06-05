/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.store.inscripciones.NoveltyStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'NoveltyStore',
    proxy: {
        extraParams : {
            pdbTable : 'registration_novelties'
        }
    },
    requires: [
        'Admin.model.inscripciones.NoveltyModel'
    ],
    model   : 'Admin.model.inscripciones.NoveltyModel'
});