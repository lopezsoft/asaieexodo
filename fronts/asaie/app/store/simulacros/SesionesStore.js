/**
 * Created by LOPEZSOFT on 29/01/2016.
 */
Ext.define('Admin.store.simulacros.SesionesStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'SesionesStore',
    pageSize: 60,
    requires    : [
        'Admin.model.simulacros.SesionesModel'
    ],
    model   : 'Admin.model.simulacros.SesionesModel',
    proxy   : {
        url : 'General/get_select_estudiantes'
    }
});