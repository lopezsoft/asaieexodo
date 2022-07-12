/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.CalendarioStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'CalendarioStore',
    fields  : [
        {name : 'COD_CAL'},
        {name : 'CALENDARIO'}
    ],
    data : [
        {COD_CAL : '1',CALENDARIO: 'CALENDARIO A'},
        {COD_CAL : '2',CALENDARIO: 'CALENDARIO B'},
        {COD_CAL : '3',CALENDARIO: 'CALENDARIO C'}
    ]
});