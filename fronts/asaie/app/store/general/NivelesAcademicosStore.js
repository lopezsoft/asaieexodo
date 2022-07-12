/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.NivelesAcademicosStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'NivelesAcademicosStore',
	requires: [
		'Admin.model.general.NivelesAcademicosModel'
	],
	model		: 'Admin.model.general.NivelesAcademicosModel',
	proxy: {
		api: {
			create  : 'General/insert_data',
			read    : 'General/get_select_all',
			update  : 'General/update_data',
			destroy : 'General/delete_data'
		},
		extraParams : {
			pdbTable : 'niveles_estudio'
		}
	}
});
