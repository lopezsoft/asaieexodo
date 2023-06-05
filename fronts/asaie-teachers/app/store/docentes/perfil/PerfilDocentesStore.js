/**
 * Created by LOPEZSOFT on 2/05/2016.
 */
Ext.define('Admin.store.docentes.perfil.PerfilDocentesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'PerfilDocentesStore',
    requires: [
        'Admin.model.docentes.perfil.PerfilDocentesModel'
    ],
    model   : 'Admin.model.docentes.perfil.PerfilDocentesModel',
    proxy   : {
        api: {
            create  : 'General/insert_data',
            read    : 'c_docentes/get_select_docentes',
            update  : 'c_docentes/get_update_docentes',
            destroy : 'General/delete_data'
        },
        extraParams : {
            pdbTable    : 'docentes'
        }
    }
});