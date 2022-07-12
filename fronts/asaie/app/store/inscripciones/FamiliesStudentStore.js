Ext.define('Admin.store.inscripciones.FamiliesStudentStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'FamiliesStudentStore',
    proxy: {
        extraParams : {
            pdbTable : 'aux_families_students'
        },
        api: {
			create  : 'master/insertData',
			read    : 'families/getFamiliesStudent',
			update  : 'master/updateData',
			destroy : 'master/deleteData'
		}
    },
    requires: [
        'Admin.model.inscripciones.FamiliaresModel'
    ],
    model   : 'Admin.model.inscripciones.FamiliaresModel'
});
