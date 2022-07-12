Ext.define('Admin.store.docentes.FormatoSeguimientoStore',{
    extend      : 'Admin.store.base.StoreApi',
    storeId     : 'FormatoSeguimientoStore',
	pageSize    : 0,
	proxy: {
		extraParams : {
            pdbTable : 'mom_formato_evaluacion'
        },
	    api: {
			create  : 'master/insertData',
			read    : 'formatos/getformato01',
			update  : 'master/updateData',
			destroy : 'master/deleteData'
		}
	},
    requires    : [
        'Admin.model.docentes.FormatoSeguimientoModel'
    ],
    model   : 'Admin.model.docentes.FormatoSeguimientoModel'
});
