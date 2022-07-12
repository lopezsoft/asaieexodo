/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.TipoDiscapacidadStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'TipoDiscapacidadStore',
    fields      : [
        { name  : 'id'},
        { name  : 'nombre'}
    ],
    data    : [
        {id: 0, nombre : 'Ninguna'},
        {id: 1, nombre : 'Sordera Profunda'},
        {id: 2, nombre : 'Hipoacusia o Baja audición'},
        {id: 3, nombre : 'Baja visión diagnosticada'},
        {id: 4, nombre : 'Ceguera'},
        {id: 5, nombre : 'Parálisis cerebral'},
        {id: 6, nombre : 'Lesión neuromuscular'},
        {id: 7, nombre : 'Autismo'},
        {id: 8, nombre : 'Deficiencia cognitiva (Retardo Mental)'},
        {id: 9, nombre : 'Síndrome de Down'},
        {id: 10, nombre : 'Múltiple'},
        {id: 99, nombre : 'No aplica'}
    ]
});