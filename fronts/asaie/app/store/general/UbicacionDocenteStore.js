/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.UbicacionDocenteStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'UbicacionDocenteStore',
    fields  : [
        {name : 'id'},
        {name : 'tipo'}
    ],
    data : [
        {id : '1',tipo: 'Establecimiento educativo'},
        {id : '2',tipo: 'En Comisión'},
        {id : '3',tipo: 'Otros'}
    ]
});