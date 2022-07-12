Ext.define('Admin.view.academico.inscripciones.forms.NoveltyFormView', {
	extend: 'Admin.base.SaveWindow',
	alias: 'widget.NoveltyFormView',
	maximized: false,
	maxWidth: 450,
	maxHeight: 350,
	controller: 'academico',
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle(AppLang.getSTitleViewNovelty());
	},
	config : {
		record : null
	},
	saveData	: function(storeName,reload){
		var me 		= this.getApp(),
			win		= this,
			form    = win.down('form'),
			record  = form.getRecord(),
			values  = form.getValues(),
			dataGrid= win.getRecord(),
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
					if (reload == true){
						store.reload();
					}
					win.close();
				},
				failure	: function (re) {
					win.unmask();
					store.rejectChanges();
				}
			});
		}else{ // Insertar
			win.mask('Guardando...');
			values.id_register	= dataGrid.get('id');
			store.insert(0,values);
			store.sync({
				success : function(batch, o){
					me.showResult('Se han guardado los datos');
					win.unmask();
					win.close();
					if (reload == true){
						store.reload();
					}
				},
				failure	: function (re) {
					store.rejectChanges();
					win.unmask();
				}
			});
		};
	},
	store: 'NoveltyStore',
	items: [
		{
			xtype: 'customform',
			items: [
				{

					xtype	: 'CbEstado',
					name	: 'id_state'
				},
				{
					xtype	: 'DateField',
					name	: 'date'
				},
				{
					xtype		: 'customtextarea',
					fieldLabel	: 'Movtivo',
					name		: 'motive'
				}
			]
		}
	]
});
