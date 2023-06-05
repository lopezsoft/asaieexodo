/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.store.convivencia.SituacionesRegEstudiantesStore',{
    extend      : 'Admin.store.base.StoreApi',
    storeId     : 'SituacionesRegEstudiantesStore',
    pageSize    : 60,
    requires    : [
        'Admin.model.convivencia.SituacionesRegEstudiantesModel'
    ],
    proxy: {
        extraParams : {
            pdbTable    : 'conv_reg_situaciones_est'
        },
        api: {
            create  : 'c_convivencia/get_insertsituaciones_estudiantes',
            read    : 'c_convivencia/get_select_situaciones_estudiantes',
            update  : 'c_convivencia/get_update_situaciones_estudiantes',
            destroy : 'General/delete_data'
        }
    },
    model   : 'Admin.model.convivencia.SituacionesRegEstudiantesModel'
});