Ext.define('Admin.store.inscripciones.FamiliesStudentStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'FamiliesStudentStore',
    proxy: {
        extraParams : {
            pdbTable : 'aux_families_students'
        },
        api: {
			create  : 'crud',
			read    : 'families/families-student',
			update  : 'crud',
			destroy : 'crud'
		}
    },
    requires: [
        'Admin.model.inscripciones.FamiliaresModel'
    ],
    model   : 'Admin.model.inscripciones.FamiliaresModel'
});
