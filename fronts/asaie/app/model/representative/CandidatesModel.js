Ext.define('Admin.model.representative.CandidatesModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name  : 'enrollment_id', type : 'int'},
        { name  : 'candidacy_id', type : 'int'},
        { name  : 'candidate_id', type : 'int'},
        { name  : 'names'},
        { name  : 'grade'},
        { name  : 'group'},
        { name  : 'number'},
        { name  : 'candidacy_name'},
        { name  : 'availability_status', type: 'int'},
        { name  : 'image'},
        { name  : 'year'},
        { name  : 'type'}
    ]
});
