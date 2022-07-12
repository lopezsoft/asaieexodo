/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.AreaEnsStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'AreaEnsStore',
    fields  : [
        {name : 'id'},
        {name : 'tipo'}
    ],
    data : [
        {id : '1',tipo: 'Preescolar'},
        {id : '2',tipo: 'Primaria'},
        {id : '3',tipo: 'Ciencias naturales y educación ambiental'},
        {id : '4',tipo: 'Ciencias sociales'},
        {id : '5',tipo: 'Educacion artística - artes plásticas'},
        {id : '6',tipo: 'Educación artística - música'},
        {id : '7',tipo: 'Educación artística - artes escénicas'},
        {id : '8',tipo: 'Educación artística - danzas'},
        {id : '9',tipo: 'Educación física, recreación y deporte'},
        {id : '10',tipo: 'Educación ética y en valores'},
        {id : '11',tipo: 'Educación religiosa'},
        {id : '12',tipo: 'Humanidades y lengua castellana'},
        {id : '13',tipo: 'Idioma extranjero francés'},
        {id : '14',tipo: 'Idioma extranjero inglés'},
        {id : '15',tipo: 'Matemáticas'},
        {id : '16',tipo: 'Tecnología e informática'},
        {id : '17',tipo: 'Ciencias naturales química'},
        {id : '18',tipo: 'Ciencias naturales fí­sica'},
        {id : '19',tipo: 'Filosofía'},
        {id : '20',tipo: 'Ciencias económicas y políticas'},
        {id : '21',tipo: 'Áreas de apoyo para educación especial'},
        {id : '22',tipo: 'No aplica'}
    ]
});