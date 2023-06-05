/**
 * Created by LOPEZSOFT on 2/01/2016.
 */
Ext.define('Admin.store.docentes.ImportarDescriptoresStore', {
    extend  	: 'Admin.store.base.StoreUrl',
    storeId 	: 'ImportarDescriptoresStore',
    pageSize	: 0,
	groupField	: 'nombre_proceso',
    requires: [
        'Admin.model.docentes.ParceladorCliModel'
    ],

    model : 'Admin.model.docentes.ParceladorCliModel',

    proxy: {
        url : 'c_logros/get_importar_logros_ind'
    }
});
