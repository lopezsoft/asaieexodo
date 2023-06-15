/**
 * Created by LOPEZSOFT on 03/12/2015.
 */
Ext.define('Admin.store.docentes.SugerenciasStore', {
    extend	: 'Admin.store.base.StoreApi',
    storeId	: 'SugerenciasStore',
    requires: [
        'Admin.model.docentes.SugerenciasModel'
    ],
    model		: 'Admin.model.docentes.SugerenciasModel',
    proxy: {
        extraParams : {
            pdbTable    : 'sugerencias'
        },
        api: {
            create  : 'academic-observations',
            read    : 'academic-observations',
            update  : 'crud',
            destroy : 'crud'
        }
    }
});
