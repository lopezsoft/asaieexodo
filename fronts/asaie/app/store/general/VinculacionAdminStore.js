/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.VinculacionAdminStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'VinculacionAdminStore',
    fields  : [
        {name : 'id'},
        {name : 'nombre'}
    ],
    data : [
        {id : '1',nombre: 'Con nombramiento en propiedad'},
        {id : '2',nombre: 'Con nombramiento provisional'},
        {id : '3',nombre: 'Supliendo situaciones admon temporales y/o supernumerarios'}
    ]
});