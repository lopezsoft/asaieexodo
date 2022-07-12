/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.EstadoStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'EstadoStore',
	pageSize	: 10,
    fields  : [
        {name : 'id'},
        {name : 'name_state'}
    ],
    proxy	: {
		api: {
			create  : 'General/insert_data',
			read    : 'General/get_select_all',
			update  : 'General/update_data',
			destroy : 'General/delete_data'
		},
		extraParams	: {
			pdbTable	: 'registration_status'
		}
	}
});
