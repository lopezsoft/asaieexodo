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
            create  : '',
            read    : 'c_sql/db_docente',
            update  : 'General/update_data',
            destroy : ''
        }
    }
});
