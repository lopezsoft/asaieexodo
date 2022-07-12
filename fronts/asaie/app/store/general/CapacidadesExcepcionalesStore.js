/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.CapacidadesExcepcionalesStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'CapacidadesExcepcionalesStore',
    fields      : [
        { name  : 'id'},
        { name  : 'nombre'}
    ],
    data    : [
        {id: 0, nombre :'Ninguno'},
        {id: 1, nombre :'Superdotado'},
        {id: 2, nombre :'Con talento científico'},
        {id: 3, nombre :'Con talento tecnológico'},
        {id: 4, nombre :'Con talento subjetivo'},
        {id: 99, nombre :'No Aplica'}
    ]
});