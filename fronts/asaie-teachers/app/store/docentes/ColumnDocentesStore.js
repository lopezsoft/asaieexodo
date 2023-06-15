Ext.define('Admin.store.docentes.ColumnDocentesStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId	: 'ColumnDocentesStore',
    groupField  : 'grupo',
    requires: [
    	'Admin.model.docentes.ColumnDocentesModel'
    ],
    model		: 'Admin.model.docentes.ColumnDocentesModel',
    proxy: {
        extraParams : {
            pdbTable    : 'config_columns_theacher'
        },
        api: {
            create  : 'crud',
            read    : 'teachers/column-notes',
            update  : 'crud',
            destroy : 'crud'
        }
    }
});
