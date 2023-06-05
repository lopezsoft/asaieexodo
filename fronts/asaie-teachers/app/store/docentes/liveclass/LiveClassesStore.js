Ext.define('Admin.store.docentes.LiveClassesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'LiveClassesStore',
    requires : [
        'Admin.model.docentes.MaterialEducativoModel'
    ],
    model   : 'Admin.model.docentes.MaterialEducativoModel',
    proxy : {
        api: {
			create  : 'liveClasses/insertLiveClasses',
			read    : 'liveClasses/getLiveClasses',
			update  : 'master/updateData',
			destroy : 'master/deleteData'
		},
        extraParams : {
            pdbTable    : 'tl_live_classes'
        }
    }
});
