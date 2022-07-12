/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.CargoDocenteStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'CargoDocenteStore',
    fields  : [
        {name : 'cod_car'},
        {name : 'cargo_nom'}
    ],
    data : [
        {cod_car : '1',cargo_nom: 'Docente'},
        {cod_car : '2',cargo_nom: 'Directivo Docente'}
    ]
});