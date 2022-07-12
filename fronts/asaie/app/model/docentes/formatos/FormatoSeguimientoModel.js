Ext.define('Admin.model.docentes.FormatoSeguimientoModel', {
   extend: 'Admin.model.base.BaseModel',
fields: [
		{ name: 'id'},   		
		{ name : 'enrollment_id'},
		{ name : 'teacher_id'},
		{ name : 'nombres'},
		{ name : 'obs'},
		{ name : 'grado'},
		{ name : 'grupo'},
		{ name : 'sede'},
		{ name : 'id_jorn'},
		{ name : 'id_grado'},
   		{ name: 'pv', type: 'bool'},
	    { name: 'tv', type: 'bool'},
	    { name: 'gw', type: 'bool'},
	    { name: 'gf', type: 'bool'},
	    { name: 'otro', type: 'bool'},
	    { name: 'ee', type: 'bool'},
	    { name: 'inter', type: 'bool'},
	    { name: 'tv2', type: 'bool'},
	    { name: 'dc', type: 'bool'}
     ]
});
