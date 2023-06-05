Ext.define('Admin.store.general.JornadasStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'JornadasStore',
	requires: [
		'Admin.model.general.JornadasModel'
	],
	model		: 'Admin.model.general.JornadasModel',
	proxy : {
		extraParams: {
			pdbTable	: 'jornadas',
		}
	}
});
