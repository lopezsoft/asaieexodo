/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.general.EtnoEducadorStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'EtnoEducadorStore',
    fields  : [
        {name : 'id'},
        {name : 'tipo'}
    ],
    data : [
        {id : '1',tipo: 'Raizal'},
        {id : '2',tipo: 'Afrocolombiano'},
        {id : '3',tipo: 'Indigena'},
        {id : '4',tipo: 'No Aplica'}
    ]
});