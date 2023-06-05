Ext.define('Admin.model.docentes.observador.ItemsModelo3Model', {
   extend: 'Admin.model.base.BaseModel',
   fields: [
   		{ name: 'id'},   		
   		{ name: 'id_observador'},
   		{ name: 'id_docente'},
   		{ name: 'id_item_criterio'},
   		{ name: 'n1', type: 'bool'},
	    { name: 'n2', type: 'bool'},
	    { name: 'n3', type: 'bool'},
	    { name: 'n4', type: 'bool'},
	    { name: 'av1', type: 'bool'},
	    { name: 'av2', type: 'bool'},
	    { name: 'av3', type: 'bool'},
	    { name: 'av4', type: 'bool'},
	    { name: 'cs1', type: 'bool'},
	    { name: 'cs2', type: 'bool'},
	    { name: 'cs3', type: 'bool'},
	    { name: 'cs4', type: 'bool'},
	    { name: 's1', type: 'bool'},
	    { name: 's2', type: 'bool'},
	    { name: 's3', type: 'bool'},
	    { name: 's4', type: 'bool'},
       	{ name: 'estado'},
	    { name: 'criterio'},
	    { name: 'aspecto'},
     	{ name: 'fecha'}
     ]
});