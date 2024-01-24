Ext.define('Admin.store.general.AsignaturaStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'AsignaturaStore',
	pageSize: 60,
    requires: [
        'Admin.model.general.AsignaturaModel'
    ],
    model		: 'Admin.model.general.AsignaturaModel',
    proxy: {
        extraParams : {
            pdbTable : 'asignaturas',
			order       : '{"type": "ASC", "asignatura": "ASC"}',
        }
    }
});
