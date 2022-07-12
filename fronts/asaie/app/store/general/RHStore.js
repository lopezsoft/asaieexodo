/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.RHStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'RHStore',
    fields  : [
        {name : 'tipo_sangre'}
    ],
    data : [
        {tipo_sangre : 'O+'},
        {tipo_sangre : 'O-'},
        {tipo_sangre : 'A+'},
        {tipo_sangre : 'A-'},
        {tipo_sangre : 'B+'},
        {tipo_sangre : 'B-'},
        {tipo_sangre : 'AB+'},
        {tipo_sangre : 'AB-'}
    ]
});