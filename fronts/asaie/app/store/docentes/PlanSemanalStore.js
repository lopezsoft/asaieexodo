/**
 * Created by LOPEZSOFT on 14/12/2015.
 */
Ext.define('Admin.store.docentes.PlanSemanalStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId: 'PlanSemanalStore',
    requires : [
        'Admin.model.docentes.PlanSemanalModel'
    ],
    model : 'Admin.model.docentes.PlanSemanalModel',
    proxy: {
        extraParams : {
            pdbTable : 'plan_semanal_clases'
        },
        api : {
            create  : 'c_parcelador/insert_plan',
            read    : 'c_parcelador/get_select_plan',
            update  : 'c_parcelador/get_update_plan',
            destroy : 'General/delete_data'
        }
    }
});