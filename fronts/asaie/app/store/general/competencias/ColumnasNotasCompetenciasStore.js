/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.ColumnasNotasCompetenciasStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'ColumnasNotasCompetenciasStore',
    requires: [
        'Admin.model.general.ColumnasNotasCompetenciasModel'
    ],
    model		: 'Admin.model.general.ColumnasNotasCompetenciasModel',
    proxy: {
        extraParams : {
            pdbTable : 'columnas_notas_competencias'
        },
        api: {
            create  : 'General/insert_data',
            read    : 'General/get_select_columnas_notas_competencias',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    }
});
