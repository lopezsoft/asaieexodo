/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.UbicacionAdminStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'UbicacionAdminStore',
    fields  : [
        {name : 'id'},
        {name : 'tipo'}
    ],
    data : [
        {id : '1',tipo: 'Establecimiento educativo'},
        {id : '2',tipo: 'En Nivel Central (SED)'},
        {id : '3',tipo: 'En Comisión'},
        {id : '4',tipo: 'Otros'}
    ]
});