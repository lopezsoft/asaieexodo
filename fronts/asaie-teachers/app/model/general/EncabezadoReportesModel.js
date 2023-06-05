/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.model.general.EncabezadoReportesModel', {
    extend: 'Admin.model.base.BaseModel',
    fields: [
        { name : 'encabezado'},
        { name : 'dane' },
        { name : 'nit' },
        { name : 'resolucion'},
        { name : 'pie'},
        { name : 'foto'},
        { name : 'mime'}
    ]
});