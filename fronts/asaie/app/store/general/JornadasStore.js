/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.JornadasStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'JornadasStore',
	requires: [
		'Admin.model.general.JornadasModel'
	],
	model		: 'Admin.model.general.JornadasModel',
	pageSize    : 5,
	proxy : {
		api: {
			create	: 'General/insert_data',
			read	: 'General/get_select_jornadas',
			update	: 'General/update_data',
			destroy	: 'General/delete_data'
		},
		extraParams: {
			pdbTable	: 'jornadas',
			pdbSede		: 0
		}
	}
});
