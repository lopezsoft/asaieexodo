/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.EstratoStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'EstratoStore',
    fields  : [
        {name : 'estrato'}
    ],
    data : [
        {estrato : '0'},
        {estrato : '1'},
        {estrato : '2'},
        {estrato : '3'},
        {estrato : '4'},
        {estrato : '5'},
        {estrato : '6'}
    ]
});