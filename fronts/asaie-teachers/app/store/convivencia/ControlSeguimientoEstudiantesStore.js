/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.store.convivencia.ControlSeguimientoEstudiantesStore',{
    extend      : 'Admin.store.base.StoreApi',
    storeId     : 'ControlSeguimientoEstudiantesStore',
    pageSize    : 60,
    requires    : [
        'Admin.model.convivencia.ControlSeguimientoEstudiantesModel'
    ],
    proxy: {
        extraParams : {
            pdbTable    : 'conv_control_seguimiento'
        },
        api: {
            create  : 'c_convivencia/insert_control_seguimiento_estudiantes',
            read    : 'c_convivencia/get_select_control_seguimiento_estudiantes',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    },
    model   : 'Admin.model.convivencia.ControlSeguimientoEstudiantesModel'
});