/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.AreaTecnicaStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'AreaTecnicaStore',
    fields  : [
        {name : 'id'},
        {name : 'tipo'}
    ],
    data : [
        {id : '1',tipo: 'Finanzas - Administración y Seguros'},
        {id : '2',tipo: 'Ventas y Servicios'},
        {id : '3',tipo: 'Ciencias Naturales y Aplicadas'},
        {id : '4',tipo: 'Salud'},
        {id : '5',tipo: 'Ciencias Sociales, Educación, Servicios Gubernamentales y Religión'},
        {id : '6',tipo: 'Cultura, Arte, Esparcimiento y Deporte'},
        {id : '7',tipo: 'Explotación Primaria y Extractiva'},
        {id : '8',tipo: 'Operadores del Equipo y Transporte Instalación y Mantenimiento'},
        {id : '9',tipo: 'Procesamiento, Fabricación y Ensamble'},
        {id : '10',tipo: 'Otras'},
        {id : '11',tipo: 'No aplica'}
    ]
});