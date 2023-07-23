/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.store.general.WatermarkStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId: 'WatermarkStore',
    fields: [
		{name: 'id', type: 'int'},
		{name: 'file_description', type: 'string'},
		{name: 'url', type: 'string'},
		{name: 'state', type: 'bool'},
	],
    proxy: {
        extraParams : {
            pdbTable    : 'watermark_files',
        },
        api: {
            create  : 'files/watermark',
            read    : 'files/watermark',
            update  : 'files/watermark',
            destroy : 'files/watermark'
        }
    }
});

