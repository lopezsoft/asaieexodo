Ext.define('Admin.model.general.DocentesModel', {
    extend: 'Admin.model.base.BaseModel',
	idProperty : 'id_docente',
    fields: [
		{ name: 'id_docente' },
		{ name: 'estado', type: 'bool'},
		{ name: 'nombres' }
   	 ]
});

