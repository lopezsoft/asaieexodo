Ext.define('Admin.view.docentes.observador.AnotacionesM3View',{
    extend		: 'Admin.base.SaveWindow',
    alias 		: 'widget.anotacionesm3view',
    xtype 		: 'anotacionesm3view',
	controller	: 'observador',
	store		: 'AnotacionesM3Store',
	reloadStore	: true,
    items : [
    	{
			xtype		: 'customform',
			defaultType	: 'customhtmleditor',
			items	: [
				{
					name		: 'anotacion',
					fieldLabel	: 'Anotación',
					emptyText	: 'Digite la descripción de la anotación'
				},
				{
					name		: 'compromiso_est',
					fieldLabel	: 'Compromiso del estudiante',
					emptyText	: 'Digite el compromiso del estudiante'
				},
				{
					name		: 'compromiso_acu',
					fieldLabel	: 'Compromiso del acudiente',
					emptyText	: 'Digite el compromiso del acudiente'
				},
				{
					name		: 'compromiso_inst',
					fieldLabel	: 'Compromiso de la Institución',
					emptyText	: 'Digite el compromiso de la Institución'
				},
				{
					xtype		: 'CbPeriodos',
					labelWidth	: 180
				},
				{
					xtype		: 'DateField',
					name		: 'fecha'
				}
			]
		}		    
	],
	saveData	: function(storeName,reload){
		const me = this.getApp(),
			win = this,
			form = win.down('form'),
			record = form.getRecord(),
			values = form.getValues(),
			store = Ext.getStore(storeName);
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
			values.id_observador 	= win.getRecord().get('id');
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
					win.unmask();
					store.rejectChanges();
				}
			});
		}
	}
});
