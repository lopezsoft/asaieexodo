/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.model.admin.JornSedesModel',{
    extend  : 'Admin.model.base.BaseModel',
    idProperty  : 'id',
    fields  : [
        {name : 'id'},
        {name : 'id_sede'},
		{name : 'id_jornada'},
		{name : 'sede'},
		{name : 'jornada'}
    ]
});
