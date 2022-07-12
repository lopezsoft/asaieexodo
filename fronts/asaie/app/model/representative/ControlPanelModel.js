Ext.define('Admin.model.representative.ControlPanelModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name  : 'year'},
        { name  : 'voting_table'},
        { name  : 'school_name'},
        { name  : 'null_vote_attempts'},
        { name  : 'voting_type', type: 'int'},
        { name  : 'certificate_header'},
        { name  : 'start_date'},
        { name  : 'closing_time'},
        { name  : 'start_time'},
    ]
});
