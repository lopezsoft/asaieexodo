Ext.define('Admin.store.general.GradesAllStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'GradesAllStore',
    requires : [
        'Admin.model.general.GradosModel'
    ],
    model: 'Admin.model.general.GradosModel',
    proxy: {
		extraParams	:  {
			pdbTable	: 'grados',
			where		: '{"uso": "1"}'
		}
    }
});
