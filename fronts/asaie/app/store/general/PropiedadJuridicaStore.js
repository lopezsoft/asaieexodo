/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.PropiedadJuridicaStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'PropiedadJuridicaStore',
    fields  : [
        {name : 'COD_SEC'},
        {name : 'COD_PROP'},
        {name : 'PROP_SERV'}
    ],
    data : [
        {COD_SEC : '1',COD_PROP : '01',PROP_SERV: 'Oficial'},
        {COD_SEC : '1',COD_PROP : '02',PROP_SERV: 'Educación misional contratada'},
        {COD_SEC : '1',COD_PROP : '03',PROP_SERV: 'Oficial régimen especial'},
        {COD_SEC : '2',COD_PROP : '11',PROP_SERV: 'Persona natural o Sociedad'},
        {COD_SEC : '2',COD_PROP : '12',PROP_SERV: 'Comunidad religiosa'},
        {COD_SEC : '2',COD_PROP : '13',PROP_SERV: 'Cooperativo'},
        {COD_SEC : '2',COD_PROP : '14',PROP_SERV: 'Comunidad'},
        {COD_SEC : '2',COD_PROP : '15',PROP_SERV: 'Fundación'},
        {COD_SEC : '2',COD_PROP : '16',PROP_SERV: 'Caja de compensación'},
        {COD_SEC : '2',COD_PROP : '17',PROP_SERV: 'Federaciones o Corporaciones'},
        {COD_SEC : '2',COD_PROP : '18',PROP_SERV: 'Otro No Oficial'}
    ]
});