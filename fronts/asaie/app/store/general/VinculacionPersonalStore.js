/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.VinculacionPersonalStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'VinculacionPersonalStore',
    fields  : [
        {name : 'id'},
        {name : 'nombre'}
    ],
    data : [
        {id : '1',nombre: 'Con nombramiento en propiedad'},
        {id : '2',nombre: 'Con nombramiento provisional en una vacante definitiva'},
        {id : '3',nombre: 'Con nombramiento provisional en una vacante temporal'},
        {id : '4',nombre: 'Con nombramiento en período de prueba'},
        {id : '5',nombre: 'Planta temporal'}
    ]
});