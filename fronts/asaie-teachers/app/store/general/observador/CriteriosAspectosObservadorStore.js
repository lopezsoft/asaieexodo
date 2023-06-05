/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.CriteriosAspectosObservadorStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'CriteriosAspectosObservadorStore',
    requires: [
        'Admin.model.general.CriteriosAspectosObservadorModel'
    ],
    model		: 'Admin.model.general.CriteriosAspectosObservadorModel',
    proxy: {
        extraParams : {
            pdbTable : 'obs_criterios'
        }
    }
});