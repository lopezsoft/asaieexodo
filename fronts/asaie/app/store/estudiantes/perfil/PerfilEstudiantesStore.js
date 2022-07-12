/**
 * Created by LOPEZSOFT on 2/05/2016.
 */
Ext.define('Admin.store.estudiantes.perfil.PerfilEstudiantesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'PerfilEstudiantesStore',
    requires: [
        'Admin.model.estudiantes.perfil.PerfilEstudiantesModel'
    ],
    model   : 'Admin.model.estudiantes.perfil.PerfilEstudiantesModel',
    proxy   : {
        api: {
            create  : 'xx/cx',
            read    : 'students/get_select_perfil',
            update  : 'General/update_data',
            destroy : 'xx/cb'
        },
        extraParams : {
            pdbTable    : 'usuarios_estu'
        }
    }
});