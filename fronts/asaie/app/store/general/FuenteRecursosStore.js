/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.FuenteRecursosStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'FuenteRecursosStore',
    fields  : [
        {name : 'ID'},
        {name : 'TIPO'}
    ],
    data : [
        {ID : '1',TIPO: 'SGP - Sistema General de Participaciones'},
        {ID : '2',TIPO: 'FNR'},
        {ID : '3',TIPO: 'Recursos adicionales presupuesto nacional MEN'},
        {ID : '4',TIPO: 'Otros Recursos de la Nación'},
        {ID : '5',TIPO: 'Recursos Propios'}
    ]
});