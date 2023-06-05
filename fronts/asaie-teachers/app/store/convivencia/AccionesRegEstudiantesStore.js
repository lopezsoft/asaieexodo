/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.store.convivencia.AccionesRegEstudiantesStore',{
    extend      : 'Admin.store.base.StoreApi',
    storeId     : 'AccionesRegEstudiantesStore',
    requires    : [
        'Admin.model.convivencia.AccionesRegEstudiantesModel'
    ],
    proxy: {
        extraParams : {
            pdbTable    : 'conv_reg_acciones_est'
        },
        api: {
            create  : 'c_convivencia/get_insertacciones_estudiantes',
            read    : 'c_convivencia/get_select_acciones_estudiantes',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    },
    model   : 'Admin.model.convivencia.AccionesRegEstudiantesModel'
});