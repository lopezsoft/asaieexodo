Ext.define('Admin.store.general.ConfiguracionesStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'ConfiguracionesStore',
    requires: [
        'Admin.model.general.ConfiguracionesModel'
    ],
    model		: 'Admin.model.general.ConfiguracionesModel',
    proxy: {
        extraParams : {
            pdbTable : 'config001'
        },
		api: {
			create  : 'crud',
			read    : 'settings/general-setting',
			update  : 'crud',
			destroy : 'crud'
		}
    }
});
