Ext.define('Admin.store.docentes.OnlineActivitiesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'OnlineActivitiesStore',
    requires : [
        'Admin.model.docentes.MaterialEducativoModel'
    ],
    model   : 'Admin.model.docentes.MaterialEducativoModel',
    proxy : {
        api: {
			create  : 'activities/insertActivities',
			read    : 'activities/getActivities',
			update  : 'master/updateData',
			destroy : 'master/deleteData'
		},
        extraParams : {
            pdbTable    : 'ta_online_activities'
        }
    }
});