/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.NivelEnsStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'NivelEnsStore',
    fields  : [
        {name : 'id'},
        {name : 'nivel'}
    ],
    data : [
        {id : '1',nivel: 'Preescolar'},
        {id : '2',nivel: 'Básica Primaria'},
        {id : '3',nivel: 'Básica Secundaria y Media'},
        {id : '4',nivel: 'Ciclo Complementario (normales)'},
        {id : '5',nivel: 'No aplica'}
    ]
});