/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.MetodologiasStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'MetodologiasStore',
    requires: [
        'Admin.model.general.MetodologiasModel'
    ],
    model   : 'Admin.model.general.MetodologiasModel',
	proxy	: {
		extraParams : {
			pdbTable 	: 'metodologias'
		}	,
		api: {
			create  : 'General/insert_data',
			read    : 'General/get_select_all',
			update  : 'General/update_data',
			destroy : 'General/delete_data'
		}
	}
});
