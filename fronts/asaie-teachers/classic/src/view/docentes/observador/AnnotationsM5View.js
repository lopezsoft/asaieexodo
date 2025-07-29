Ext.define('Admin.view.docentes.observador.AnnotationsM5View',{
    extend		: 'Admin.base.SaveWindow',
    alias 		: 'widget.annotationsM5view',
    xtype 		: 'annotationsM5view',
	controller	: 'observador',
	store		: 'AnnotationsM5Store',
	reloadStore	: true,
    items : [
    	{
			xtype		: 'customform',
			defaultType	: 'customhtmleditor',
			items	: [
				{
					xtype		: 'CbAnnotationTypes'
				},
				{
					name		: 'annotation',
					fieldLabel	: 'Descripción del seguimiento/Comportamiento',
					emptyText	: 'Digite la descripción del seguimiento o comportamiento',
					allowBlank	: false,
				},
				{
					name		: 'description',
					fieldLabel	: 'Tratamiento',
					emptyText	: 'Digite el tratamiento de la anotación',
					itemId		: 'descriptionField',
					allowBlank	: false
				},
				{
					xtype		: 'CbPeriodos',
					labelAlign	: 'top',
					name		: 'period',
				},
				{
					xtype		: 'DateField',
					name		: 'date_annotation',
					fieldLabel	: 'Fecha del seguimiento',
				}
			]
		}		    
	],
	saveData	: function(storeName,reload){
		const me = Admin.getApplication(),
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
				success : function() {
					me.showResult('Se han guardado los datos');
					win.unmask();
					if (reload === true){
						store.reload();
					}
					win.close();
				},
				failure	: function () {
					win.unmask();
					store.rejectChanges();
				}
			});
		}else{ // Insertar
			win.mask('Guardando...');
			values.observer_id 	= win.getRecord().get('id');
			store.insert(0,values);
			store.sync({
				success : function(){
					me.showResult('Se han guardado los datos');
					win.unmask();
					win.close();
					if (reload === true){
						store.reload();
					}
				},
				failure	: function () {
					win.unmask();
					store.rejectChanges();
				}
			});
		}
	}
});
