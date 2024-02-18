/**
 * Created by LOPEZSOFT on 5/02/2016.
 */
Ext.define('Admin.store.representative.ControlPanelStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'ControlPanelStore',
    requires: [
        'Admin.model.representative.ControlPanelModel'
    ],
    model   : 'Admin.model.representative.ControlPanelModel',
    proxy   : {
        extraParams : {
            pdbTable    : 'tp_control_panel',
			order		: "{year: 'DESC'}",
			perYear		: true
        }
    }
});
