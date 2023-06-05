Ext.define('Admin.store.docentes.CoursesLiveClassesStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId : 'CoursesLiveClassesStore',
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

