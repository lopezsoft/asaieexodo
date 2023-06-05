Ext.define('Admin.store.general.ZonaStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId : 'ZonaStore',
    fields      : [
        { name  : 'id_zona'},
        { name  : 'tipo'}
    ],
    data    : [
        {id_zona : 0, tipo : 'Ninguna'},
        {id_zona : 1, tipo : 'Urbana'},
        {id_zona : 2, tipo : 'Rural'},
        {id_zona : 3, tipo : 'Urbana y Rural'}
    ]
});