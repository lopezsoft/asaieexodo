/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.store.general.ExtraModulesStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId: 'ExtraModulesStore',
    fields: [
		{name: 'id', type: 'int'},
		{name: 'module_name', type: 'string'},
		{name: 'is_active', type: 'bool'},
		{name: 'status', type: 'bool'},
	],
    proxy: {
        extraParams : {
            pdbTable    : 'school_modules',
			withOutDb	: true,
        },
        api: {
            create  : 'crud',
            read    : 'school/system-modules',
            update  : 'crud',
            destroy : 'crud'
        }
    }
});

