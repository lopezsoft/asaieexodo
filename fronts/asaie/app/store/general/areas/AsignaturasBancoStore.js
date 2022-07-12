/**
 * Created by LOPEZSOFT on 4/01/2016.
 */
Ext.define('Admin.store.general.AsignaturasBancoStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'AsignaturasBancoStore',
    requires : [
      'Admin.model.general.AsignaturasModel'
    ],
    model : 'Admin.model.general.AsignaturasModel',
    proxy : {
        url : 'General/get_select_asignaturas_banco'
    }
});
