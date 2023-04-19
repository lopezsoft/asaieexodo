Ext.define('Admin.store.representative.CandidatesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'CandidatesStore',
    requires: [
        'Admin.model.representative.CandidatesModel'
    ],
    model   : 'Admin.model.representative.CandidatesModel',
    proxy   : {
        extraParams : {
            pdbTable    : 'tp_candidates'
        },
        api : {
            create  : 'master/insertData',
            read    : 'representative/votes-white-candidates',
            update  : 'master/updateData',
            destroy : 'master/deleteData'
        }
    }
});
