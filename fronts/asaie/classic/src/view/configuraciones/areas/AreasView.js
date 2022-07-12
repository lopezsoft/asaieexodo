Ext.define('Admin.view.configuraciones.areas.AreasView' ,{
    extend	: 'Admin.base.WindowCrud',
    alias 	: 'widget.promotionAreasView',
    xtype   : 'promotionAreasView',
	maximized	: false,
    controller: 'configuraciones',
    maxWidth: 550,
    maxHeight: 150,
    closeAction: 'hide',
    store: 'PromotionAreasStore',
    config  : {
        record : null
    },
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewAreas());
    },
    saveData	: function(storeName,reload){
		var me 		= this.getApp(),
			win		= this,
			form    = win.down('form'),
			record  = form.getRecord(),
			values  = form.getValues(),
			store   = Ext.getStore(storeName);
		if (record) { //Edición
			if (store.getModifiedRecords().length > 0) {
				win.mask('Guardando...');
			}
			record.set(values);
			store.sync({
				success : function(batch, o) {
					me.showResult('Se han guardado los datos');
					win.unmask();
					win.close();
				},
				failure	: function (re) {
					win.unmask();
					store.rejectChanges();
				}
			});
		}else{ // Insertar
            win.mask('Guardando...');
            values.config_id = win.getRecord().get('id');
			store.insert(0,values);
			store.sync({
				success : function(batch, o){
					me.showResult('Se han guardado los datos');
					win.unmask();
					win.close();
					store.reload();
				},
				failure	: function (re) {
					store.rejectChanges();
					win.unmask();
				}
			});
		};
	},
    items : [
    	{
			xtype		: 'customform',
			items	: [
				{
                    xtype: 'CbAreas',
                    name: 'area_id'
                }
			]
		}		    
	]
});