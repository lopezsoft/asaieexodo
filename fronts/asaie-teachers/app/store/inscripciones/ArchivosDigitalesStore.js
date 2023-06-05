/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.store.inscripciones.ArchivosDigitalesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'ArchivosDigitalesStore',
    pageSize: '60',
    proxy: {
        api: {
            create  : 'academic/insert_archivos_digitales',
            read    : 'academic/get_select_archivos_digitales',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    },
    requires: [
        'Admin.model.inscripciones.ArchivosDigitalesModel'
    ],
    model   : 'Admin.model.inscripciones.ArchivosDigitalesModel'
});