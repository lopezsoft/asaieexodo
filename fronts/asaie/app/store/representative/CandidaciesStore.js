Ext.define('Admin.store.representative.CandidaciesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'CandidaciesStore',
    requires: [
        'Admin.model.representative.CandidaciesModel'
    ],
    model   : 'Admin.model.representative.CandidaciesModel',
    proxy   : {
        extraParams : {
            pdbTable    : 'tp_candidacies'
        },
    }
});
