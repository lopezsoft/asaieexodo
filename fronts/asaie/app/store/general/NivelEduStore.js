/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.NivelEduStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'NivelEduStore',
    fields  : [
        {name : 'id'},
        {name : 'tipo'}
    ],
    data : [
        {id : '0',tipo: 'Sin titulo'},
        {id : '1',tipo: 'Bachiller pedagógico'},
        {id : '2',tipo: 'Normalista superior'},
        {id : '3',tipo: 'Otro bachiller'},
        {id : '4',tipo: 'Técnico o tecnólogo en educación'},
        {id : '5',tipo: 'Técnico o tecnólogo en otras áreas'},
        {id : '6',tipo: 'Profesional o licenciado en educación'},
        {id : '7',tipo: 'Profesional en otras áreas, no licenciado'},
        {id : '8',tipo: 'Postgrado en educación'},
        {id : '9',tipo: 'Postgrado en otras áreas'}
    ]
});