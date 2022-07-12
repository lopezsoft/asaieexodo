/**
 * Created by LOPEZSOFT on 8/02/2016.
 */
Ext.define('Admin.store.representative.TableHeadquartersStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'TableHeadquartersStore',
    requires: [
        'Admin.model.representative.TableHeadquartersModel'
    ],
    model   : 'Admin.model.representative.TableHeadquartersModel',
    proxy   : {
		extraParams : {
            pdbTable    : 'tp_table_headquarters'
        },
        api : {
            create  : 'master/insertData',
            read    : 'representative/getTableHeadquarters',
            update  : 'master/updateData',
            destroy : 'master/deleteData'
        }
    }
});
