/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.DocumentosStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'DocumentosStore',
	proxy	: {
		extraParams: {
			pdbTable: 'documentos'
		}
	},
    fields      : [
        { name  : 'id'},
        { name  : 'tipo'},
        { name  : 'abrev'},
        { name  : 'estado'},
    ]
});
