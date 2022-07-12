Ext.define('Admin.store.general.ModelosObservadorStore', {
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'ModelosObservadorStore',
    requires: [
        'Admin.model.general.ModelosObservadorModel'
    ],
    model		: 'Admin.model.general.ModelosObservadorModel',
    proxy: {
        extraParams : {
            pdbTable : 'obs_modelos_observador'
        }
    }
});
