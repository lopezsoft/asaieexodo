/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.PoblacionVictimaConStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'PoblacionVictimaConStore',
    fields      : [
        { name  : 'id'},
        { name  : 'nombre'}
    ],
    data    : [
        {id : 1, nombre : 'En situación de desplazamiento'},
        {id : 2, nombre : 'Desvinculados de grupos armados'},
        {id : 3, nombre : 'Hijos de adultos desmovilizados'},
        {id : 9, nombre : 'No Aplica'}
    ]
});