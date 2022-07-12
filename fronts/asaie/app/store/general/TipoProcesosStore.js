/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.TipoProcesosStore', {
    extend: 'Admin.store.base.StoreApiSocket',
    storeId : 'TipoProcesosStore',
    requires: [
        'Admin.model.general.TipoProcesosModel'
    ],
    model		: 'Admin.model.general.TipoProcesosModel',
    proxy: {
		storeId : 'TipoProcesosStore',
		typeData: 'Ajax',
        extraParams : {
            pdbTable : 'tipo_procesos_educativos'
        },
        api: {
            create  : 'General/insert_data',
            read    : 'General/get_select_all',//['sqlQueryTable','requestQueryTable'],//'General/get_select',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    }
});
