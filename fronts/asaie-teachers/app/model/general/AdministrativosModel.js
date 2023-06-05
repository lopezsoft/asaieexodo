Ext.define('Admin.model.general.AdministrativosModel', {
    extend: 'Admin.model.base.BaseModel',
    fields: [
		{ name: 'id' },
		{ name: 'estado', type: 'bool'},
		{ name: 'nombres' }
   	 ]
});

