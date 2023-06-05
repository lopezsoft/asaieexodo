/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.SisbenStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'SisbenStore',
    fields  : [
        {name : 'sisben'}
    ],
    data : [
        {sisben : '0'},
        {sisben : '1'},
        {sisben : '2'},
        {sisben : '3'},
        {sisben : '4'},
        {sisben : '5'},
        {sisben : '6'},
        {sisben : '9 No aplica'}
    ]
});