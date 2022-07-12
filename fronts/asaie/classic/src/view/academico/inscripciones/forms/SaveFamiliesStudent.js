Ext.define('Admin.view.academico.inscripciones.forms.SaveFamiliesStudent',{
    extend		: 'Admin.base.SaveWindow',
    alias 		: 'widget.savefamiliesstudent',
	controller	: 'academico',
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle(AppLang.getSTitleNewEdit()+' '+AppLang.getSTitleViewFamilies());
	},
	store			: 'FamiliesStudentStore',
	maxHeight		: 260,
	saveData	: function(storeName,reload){
		var me 		= this.getApp(),
			win		= this,
			form    = win.down('form'),
			record  = form.getRecord(),
			values  = form.getValues(),
			datastud= win.getRecord(),
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
			values.id_student = datastud.get('id');
			store.insert(0,values);
			store.sync({
				success : function(batch, o){
					me.showResult('Se han guardado los datos');
					win.unmask();
					store.reload();
					win.close();
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
			xtype	: 'customform',
			store	: 'FamiliesStudentStore',
			items	: [
				{
					xtype       : 'cbfamilies'
				},
				{
					xtype		: 'CbTipoFamiliar'
				},
				{
					xtype		: 'CbParentescoFamiliar'
				},
				{
					xtype		: 'customcheckboxfield',
					boxLabel  	: 'Agregar como acudiente',
					name      	: 'add_acud',
					id        	: 'CkAcud',
					hidden		: true
				}
			]
		}
	]
});
