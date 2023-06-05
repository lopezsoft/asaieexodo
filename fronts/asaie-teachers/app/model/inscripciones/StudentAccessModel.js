Ext.define('Admin.model.inscripciones.StudentAccessModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name : 'id'},
        { name : 'enrollment_id'},
        { name : 'notes', type : 'bool'},
        { name : 'newsletters', type : 'bool'},
        { name : 'certificates', type : 'bool'},
        { name : 'evaluations', type : 'bool'},
        { name : 'activities', type : 'bool'},
        { name : 'live_classes', type : 'bool'},
        { name : 'leveling', type : 'bool'}
    ]
});