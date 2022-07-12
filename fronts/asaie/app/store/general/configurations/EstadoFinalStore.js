/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.store.general.EstadoFinalStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId: 'EstadoFinalStore',
    requires : [
        'Admin.model.general.EstadoFinalModel'
    ],
    model: 'Admin.model.general.EstadoFinalModel',
    groupField: 'nombre_grado_agrupado',
    proxy: {
        extraParams : {
            pdbTable    : 'estado_estudiante'
        },
        api: {
			create  : 'master/insertData',
			read    : 'master/getEstadoFinalEstudiante',
			update  : 'master/updateData',
			destroy : 'master/deleteData'
		}
    }
});

