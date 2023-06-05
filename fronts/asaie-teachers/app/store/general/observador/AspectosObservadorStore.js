/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.AspectosObservadorStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'AspectosObservadorStore',
    requires: [
        'Admin.model.general.AspectosObservadorModel'
    ],
    model		: 'Admin.model.general.AspectosObservadorModel',
    proxy: {
        extraParams : {
            pdbTable : 'obs_items_modelos'
        }
    }
});