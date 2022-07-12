/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.EscalaStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'EscalaStore',
    requires: [
        'Admin.model.general.EscalaModel'
    ],
    model		: 'Admin.model.general.EscalaModel',
    proxy: {
        extraParams : {
            pdbTable : 'desempeños'
        },
		api: {
			create  : 'master/insertData',
			read    : 'General/get_escala_notas',
			update  : 'master/updateData',
			destroy : 'master/deleteData'
		}
    }
});
