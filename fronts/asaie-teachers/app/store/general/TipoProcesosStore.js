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
        }
    }
});
