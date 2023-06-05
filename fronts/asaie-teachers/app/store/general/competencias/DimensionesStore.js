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
			create  : 'crud',
			read    : 'settings/competencies',
			update  : 'crud',
			destroy : 'crud'
		}
    }
});

