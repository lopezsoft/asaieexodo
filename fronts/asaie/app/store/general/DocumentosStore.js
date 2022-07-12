/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.DocumentosStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'DocumentosStore',
    fields      : [
        { name  : 'id'},
        { name  : 'tipo'}
    ],
    data    : [
        {id : 0, tipo : 'Ninguno'},
        {id : 1, tipo : 'Cédula de Ciudadanía'},
        {id : 2, tipo : 'Tarjeta de Identidad'},
        {id : 3, tipo : 'Cédula de Extranjería ó Identificación de Extranjería'},
        {id : 5, tipo : 'Registro Civil de Nacimiento'},
        {id : 6, tipo : 'Número de Identificación Personal (NIP)'},
        {id : 7, tipo : 'Número Único de Identificación Personal (NUIP)'},
        {id : 8, tipo : 'Número de Identificación establecido por la Secretaría de  Educación'},
        {id : 9, tipo : 'Certificado Cabildo'}
    ]
});