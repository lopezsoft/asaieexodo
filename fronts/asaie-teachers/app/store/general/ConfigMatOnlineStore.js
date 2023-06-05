/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.ConfigMatOnlineStore', {
    extend: 'Admin.store.base.StoreApiSocket',
    storeId : 'ConfigMatOnlineStore',
    requires: [
        'Admin.model.general.ConfigMatOnlineModel'
    ],
    model		: 'Admin.model.general.ConfigMatOnlineModel',
    proxy: {
		storeId : 'ConfigMatOnlineStore',
		typeData: 'Ajax',
        extraParams : {
            pdbTable : 'config_matricula_enlinea'
        }
        // api: {
        //     create  : 'General/insert_data',
        //     read    : 'General/get_select_all',//['sqlQueryTable','requestQueryTable'],//'General/get_select',
        //     update  : 'General/update_data',
        //     destroy : 'General/delete_data'
        // }
    }
});
