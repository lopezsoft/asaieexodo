/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.AreasStore', {
    extend: 'Admin.store.base.StoreApiSocket',
    storeId : 'AreasStore',
    requires: [
        'Admin.model.general.AreasModel'
    ],
    model		: 'Admin.model.general.AreasModel',
    proxy: {
		storeId : 'AreasStore',
		typeData: 'Ajax',
        extraParams : {
            pdbTable : 'areas',
			pdbAnio	 : Global.getYear(),
			pdbIdInst: 1
        },
        api: {
            create  : 'General/insert_data',
            read    : 'General/get_select_all',//['sqlQueryTable','requestQueryTable'],//'General/get_select',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    }
});
