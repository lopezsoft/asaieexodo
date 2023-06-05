/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.model.promocion.PromovidosModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        {name : 'student_id'},
		{name : 'grade_id'},
		{name : 'studyday_id'},
		{name : 'headq_id'},
        {name : 'nombres'},
        {name : 'grado'},
        {name : 'group'},
        {name : 'jornada'},
        {name : 'sede'},
        {name : 'year'}
    ]
});
