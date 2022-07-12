Ext.define('Admin.model.docentes.observador.AnotacionesM3Model', {
   extend: 'Admin.model.base.BaseModel',
   fields: [
   		{ name: 'id'},   		
   		{ name: 'id_observador'},
   		{ name: 'id_docente'},
   		{ name: 'anotacion'},
	    { name: 'compromiso_est'},
	    { name: 'compromiso_acu'},
	    { name: 'compromiso_inst'},
     	{ name: 'fecha'},
	   { name: 'periodo'}
     ]
});
