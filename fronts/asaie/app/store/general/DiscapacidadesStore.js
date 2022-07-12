/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.DiscapacidadesStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'DiscapacidadesStore',
    fields  : [
        {name : 'COD_DISC'},
        {name : 'tipo'}
    ],
    data : [
        {COD_DISC : '1',tipo: 'DISCAPACIDADES INTEGRADAS AL AULA EN LA EDUCACIÓN FORMAL'},
        {COD_DISC : '2',tipo: 'DISCAPACIDADES NO INTEGRADAS AL AULA EN LA EDUCACIÓN FORMAL'},
        {COD_DISC : '3',tipo: 'DISCAPACIDADES EN AULAS ESPECIALES Y EN AULAS DE EDUCACIÓN FROMAL'},
        {COD_DISC : '4',tipo: 'NO OFRECE EDUCACIÓN PARA ESTE TIPO DE POBLACIÓN'}
    ]
});