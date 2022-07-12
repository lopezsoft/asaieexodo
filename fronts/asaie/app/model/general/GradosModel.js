/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.GradosModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields: [
		{name: 'id_nivel', type : 'int'},
        {name: 'cod_grado' },
        {name: 'grado' },
		{name: 'uso', type	: 'bool'}
    ]
});
