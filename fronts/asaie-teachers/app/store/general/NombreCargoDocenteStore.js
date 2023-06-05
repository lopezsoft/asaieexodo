/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.NombreCargoDocenteStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'NombreCargoDocenteStore',
    fields  : [
        {name : 'id_nomb'},
        {name : 'nom_cargo'},
        {name : 'cod_car'}
    ],
    data : [
        {id_nomb : '1',nom_cargo: 'Docente de aula',                    cod_car : '1'},
        {id_nomb : '2',nom_cargo: 'Docente con funciones de apoyo',     cod_car : '1'},
        {id_nomb : '3',nom_cargo: 'Docente con funciones de orientador',cod_car : '1'},
        {id_nomb : '4',nom_cargo: 'Coordinador',                        cod_car : '2'},
        {id_nomb : '5',nom_cargo: 'Director rural',                     cod_car : '2'},
        {id_nomb : '6',nom_cargo: 'Rector',                             cod_car : '2'},
        {id_nomb : '7',nom_cargo: 'Director de núcleo',                 cod_car : '2'},
        {id_nomb : '8',nom_cargo: 'Supervisor de educación',            cod_car : '2'},
        {id_nomb : '9',nom_cargo: 'Docentes con funciones de tutor',    cod_car : '1'}
    ]
});