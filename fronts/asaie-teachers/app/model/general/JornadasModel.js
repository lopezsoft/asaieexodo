/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.model.general.JornadasModel',{
    extend  : 'Admin.model.base.BaseModel',
	idProperty  : 'cod_jorn',
    fields      : [
        { name  : 'cod_jorn'},
        { name  : 'jornadas'}
    ]
});
