Ext.define('Admin.store.docentes.CursosAsignadosActStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId : 'CursosAsignadosActStore',
    requires: [
    	'Admin.model.docentes.CargaModel'
    ],    
    model		: 'Admin.model.docentes.CargaModel',
    groupField  : 'asignatura',
    proxy: {
    	type	: 'ajax',
        url	    : 'master/getCursosAsignadosActividades'
    }
});

