/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.TipoSchoolStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'TipoSchoolStore',
    fields  : [
        {name : 'id_test'},
        {name : 'tipo'}
    ],
    data : [
        {id_test : '1',tipo: 'Institución'},
        {id_test : '2',tipo: 'Centro'}
    ]
});
