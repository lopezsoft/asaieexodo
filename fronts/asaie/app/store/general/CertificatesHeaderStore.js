/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.store.general.CertificatesHeader', {
    extend: 'Admin.store.base.StoreApi',
    storeId: 'CertificatesHeader',
    requires : [
        'Admin.model.general.ConstanciasModel'
    ],
    model: 'Admin.model.general.ConstanciasModel',
    proxy: {
        extraParams : {
            pdbTable    : 'config_const_cert_end'
        }
    }
});

