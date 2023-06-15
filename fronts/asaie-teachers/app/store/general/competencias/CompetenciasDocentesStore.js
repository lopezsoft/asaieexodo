/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.store.general.CompetenciasDocentesStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId: 'CompetenciasDocentesStore',
    requires : [
        'Admin.model.general.CompetenciasModel'
    ],
    model: 'Admin.model.general.CompetenciasModel',
    proxy: {
        extraParams : {
            pdbTable 	: 'competencias',
			pdbGrado	: 5
        },
		api: {
			create  : 'crud',
			read    : 'competence/by-group-grades',
			update  : 'crud',
			destroy : 'crud'
		}
    }
});

