Ext.define('Admin.view.academico.inscripciones.forms.MatriculasFormView' ,{
    extend	: 'Admin.base.WindowCrud',
    alias 	: 'widget.matriculas',
    xtype 	: 'matriculas',
	maximized	: false,
	maxWidth	: 750,
	controller: 'academico',
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle(AppLang.getSTitleViewEnrollment());
	},
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
					xStore = Ext.getStore('HistorialStore')
					xStore.reload();
					win.close();
				},
				failure	: function (re) {
					store.rejectChanges();
					win.unmask();
				}
			});
		};
	},
	store			: 'MatriculasStore',
	defaultFocus    : 'CbSedes',
    items : [
    	{
			xtype		: 'customform',
			defaultType	: 'fieldSet',
			items	: [
				{
					title	: 'INFORMACIÓN DE MATRICULA',
					items 	: [
						{
							xtype	: 'CbSedes',
							name	: 'id_headquarters',
							listeners: {
								select: function (cb, r) {
									var
										me = Admin.getApplication(),                
										param = {
											pdbTable    : 'jornadas',
											pdbSede     : r.id
										};
									me.setParamStore('JornadasStore', param, true);
				
									param = {
										pdbTable    : 'grados',
										pdbSede     : r.id
									};
									me.setParamStore('GradosStore', param, true);
								}
							}
						},
						{
							fieldLabel	: 'INTS. Donde estudió el año anterior',
							name		: 'inst_origin',
							itemId		: 'inst_origin',
							allowBlank	: true
						},
						{
							fieldLabel	: 'Dirección de la INST.',
							name		: 'inst_address',
							itemId		: 'inst_address',
							allowBlank	: true
						},
						{
							xtype		: 'CbEstado'
						},
						{
							xtype	: 'CbGrados',
							name	: 'id_grade'
						},
						{
							xtype		: 'CbJornadas',
							name		: 'id_study_day'
						},
						{
							xtype		: 'CbGrupo',
							name		: 'id_group'
						},
						{
							xtype		: 'yearField',
							name		: 'year'
						},
						{
							xtype		: 'DateField',
							name		: 'date'
						},
						{
							xtype		: 'customtextarea',
							fieldLabel	: 'Observaciones',
							name		: 'obs',
							allowBlank	: true
						},
						{
							fieldLabel	: 'Folio de matricula',
							name		: 'folio',
							readOnly  	: true,
							allowBlank	: true,
							value		: '0'
						},
						{
							fieldLabel	: 'Libro de matricula',
							name: 'registration_number',
							readOnly 	: true,
							allowBlank	: true,
							value		: '0'
						}
					]
				}

			]
		}		    
	]
});
