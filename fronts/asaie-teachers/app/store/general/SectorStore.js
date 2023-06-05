/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.SectorStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'SectorStore',
    fields  : [
        {name : 'COD_SEC'},
        {name : 'SECTOR'}
    ],
    data : [
        {COD_SEC : '1',SECTOR: 'OFICIAL'},
        {COD_SEC : '2',SECTOR: 'NO OFICIAL'}
    ]
});