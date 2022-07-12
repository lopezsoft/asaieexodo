/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.store.general.DimensionesStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId: 'DimensionesStore',
	groupField: 'nombre_grado_agrupado',
    requires : [
        'Admin.model.general.CompetenciasModel'
    ],
    model: 'Admin.model.general.CompetenciasModel',
    proxy: {
        extraParams : {
            pdbTable    : 'competencias',
            pdbType     : 1
        },
		api: {
			create  : 'General/insert_data',
			read    : 'General/get_select_competencias',
			update  : 'General/update_data',
			destroy : 'General/delete_data'
		}
    }
});

