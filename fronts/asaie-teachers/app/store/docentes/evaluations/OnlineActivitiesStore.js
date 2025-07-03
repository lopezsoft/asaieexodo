Ext.define('Admin.store.docentes.OnlineActivitiesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'OnlineActivitiesStore',
    requires : [
        'Admin.model.docentes.MaterialEducativoModel'
    ],
    model   : 'Admin.model.docentes.MaterialEducativoModel',
    proxy : {
        api: {
			create  : 'online-activities/create',
			read    : 'online-activities',
			update  : 'crud',
			destroy : 'crud'
		},
        extraParams : {
            pdbTable    : 'ta_online_activities'
        }
    }
});
