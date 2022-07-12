/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.store.general.AceleracionStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId: 'AceleracionStore',
    requires : [
        'Admin.model.general.AceleracionModel'
    ],
    model: 'Admin.model.general.AceleracionModel',
    proxy: {
        extraParams : {
            pdbTable    : 'dimaceleracion'
        },
        api: {
            create  : '',
            read    : 'General/get_select',
            update  : 'General/update_data',
            destroy : ''
        }
    }
});

