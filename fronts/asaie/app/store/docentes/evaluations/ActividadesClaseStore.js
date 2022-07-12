/**
 * Created by LOPEZSOFT on 25/01/2016.
 */
Ext.define('Admin.store.docentes.ActividadesClaseStore',{
    extend  : 'Admin.store.base.StoreApiSocket',
    storeId : 'ActividadesClaseStore',
    requires : [
        'Admin.model.docentes.ActividadesClaseModel'
    ],

    model   : 'Admin.model.docentes.ActividadesClaseModel',

    proxy : {
		typeData	: 'Ajax',
        storeId 	: 'ActividadesClaseStore',
        extraParams : {
            pdbTable    : 'reg_actividades'
        },
        api: {
            create  : 'General/insert_data',
            read    : 'c_docentes/get_select_reg_actividades',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    }
});
