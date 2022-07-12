/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.model.general.AceleracionModel', {
    extend: 'Admin.model.base.BaseModel',
    idProperty  : 'id_pk',
    fields: [
        { name : 'id'  , type : 'int' },
        { name : 'id_inst' },
        { name : 'nombre' },
        { name : 'valor'}
    ]
});