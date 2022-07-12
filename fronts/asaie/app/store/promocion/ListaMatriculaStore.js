/**
 * Created by LOPEZSOFT on 13/02/2016.
 */
Ext.define('Admin.store.promocion.ListaMatriculaStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'ListaMatriculaStore',
    pageSize: 100,
    proxy: {
        extraParams : {
            pdbTable : 'matriculas'
        },
        api: {
            create  : 'academic/insert_matriculas',
            read    : 'General/get_select_matricula_antiguos',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    },
    requires: [
        'Admin.model.inscripciones.MatriculasModel'
    ],
    model   : 'Admin.model.inscripciones.MatriculasModel'
});