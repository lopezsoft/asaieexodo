/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.model.inscripciones.HistorialModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        {name : 'id'},
        {name : 'id_student'},
        {name : 'date'},
        {name : 'id_grade'},
        {name : 'group'},
        {name : 'year'},
        {name : 'grado'},
        {name : 'jornada'},
        {name : 'sede'},
        {name : 'name_state'},
        {name : 'folio'},
        {name : 'book'},
        { name: 'registration_number'},
        { name: 'id_state'},
        { name: 'promoted'},
        {name : 'msg'}
    ]
});
