Ext.define('Admin.model.representative.CandidaciesModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name  : 'id', type : 'int'},
        { name  : 'candidacy_name', type : 'string'},
        { name  : 'state', type : 'bool'}
    ]
});
