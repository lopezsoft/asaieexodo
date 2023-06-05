Ext.define('Admin.store.docentes.observador.ItemsModelo3Store', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'ItemsModelo3Store',
    pageSize: 0,
    requires: [
    	'Admin.model.docentes.observador.ItemsModelo3Model'
    ],    
    model		: 'Admin.model.docentes.observador.ItemsModelo3Model',
    groupField  : 'aspecto',
    proxy: {
        extraParams  : {
            pdbTable    : 'obs_items_modelo_3'
        },
        api: {
		    create  : 'master/insertData',
		    read    : 'observer/get_itemsmodelo3',
		    update  : 'master/updateData',
		    destroy : 'master/deleteData'
		}
    }
});