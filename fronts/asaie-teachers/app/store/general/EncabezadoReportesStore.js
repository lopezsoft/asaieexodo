/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.store.general.EncabezadoReportesStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId: 'EncabezadoReportesStore',
    requires : [
        'Admin.model.general.EncabezadoReportesModel'
    ],
    model: 'Admin.model.general.EncabezadoReportesModel',
    proxy: {
        extraParams : {
            pdbTable    : 'encabezado_reportes'
        }
    }
});

