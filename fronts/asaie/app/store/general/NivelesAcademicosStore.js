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
		extraParams : {
			pdbTable : 'niveles_estudio'
		}
	}
});
