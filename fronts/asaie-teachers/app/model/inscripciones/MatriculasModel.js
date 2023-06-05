/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.model.inscripciones.MatriculasModel', {
    extend: 'Admin.model.base.BaseModel',
    idProperty: 'id',
    fields: [
        { name: 'id' },
        { name: 'id_headquarters' },
        { name: 'id_student' },
        { name: 'promoted' },
        { name: 'id_state' },
        { name: 'id_study_day' },
        { name: 'inst_address' },
        { name: 'inst_origin' },
        { name: 'obs' },
        { name: 'date' },
        { name: 'id_grade' },
        { name: 'year' },
        { name: 'id_group' },
        { name: 'folio' },
        { name: 'registration_number' },
        { name: 'book' },
        { name: 'promoted' }
    ]
});
