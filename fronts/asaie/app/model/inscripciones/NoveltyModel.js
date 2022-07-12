/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.model.inscripciones.NoveltyModel', {
    extend: 'Admin.model.base.BaseModel',
    idProperty: 'id',
    fields: [
        { name: 'id' },
        { name: 'id_register' },
        { name: 'id_state' },
        { name: 'motive' },
        { name: 'date' }
    ]
});
