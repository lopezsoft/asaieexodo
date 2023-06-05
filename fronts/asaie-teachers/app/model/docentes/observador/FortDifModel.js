Ext.define('Admin.model.docentes.observador.FortDifModel', {
   extend: 'Admin.model.base.BaseModel',
   fields: [
   		{ name: 'id'},   		
   		{ name: 'id_observador'},
   		{ name: 'id_docente'},
   		{ name: 'tipo'},
   		{ name: 'descripcion'},     	
       	{ name: 'estado'},
     	{ name: 'fecha'}
     ]
});