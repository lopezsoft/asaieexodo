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
					xtype		: 'CbAnnotationTypes',
					listeners	: {
						change : function (combo, newValue) {
							// Mostrar u ocultar el campo de descripción según el tipo de anotación
							const form = combo.up('form');
							const descriptionField = form.down('#descriptionField');
							if (newValue === 1) { // Si es tipo 1, ocultar el campo de descripción
								descriptionField.setHidden(true);
								descriptionField.setValue(''); // Limpiar el campo si no es tipo 1
							} else {
								descriptionField.setHidden(false);
							}
						}
					},
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
					hidden		: true, // Oculto por defecto, se mostrará si el tipo de anotación es 1
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
