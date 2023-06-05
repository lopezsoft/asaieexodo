/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.CaracterSchoolStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'CaracterSchoolStore',
    fields  : [
        {name : 'id_caracter'},
        {name : 'tipo'}
    ],
    data : [
        {id_caracter : '1',tipo: 'Académica'},
        {id_caracter : '2',tipo: 'Técnica'},
        {id_caracter : '3',tipo: 'Técnica/Académica'}
    ]
});
