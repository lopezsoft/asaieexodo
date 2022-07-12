Ext.define('Admin.view.estudiantes.EditStudentInformation' ,{
    extend	: 'Admin.base.WindowCrud',
    alias 	: 'widget.editstudentinformation',
	controller	: 'estudiantes',
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle(AppLang.getSTitleNewEdit() + ' ' + AppLang.getSTitleViewStudents());
	},
	store		: 'InscripcionesStore',
	maxWidth	: 750,
	defaultFocus: 'CbCountries',
    items : [
    	{
			xtype	: 'customform',
			defaultType	: 'fieldSet',
			items	: [
				{
					title	: 'DATOS DE IDENTIFICACIÓN',
					items 	: [
                        {
                            xtype       : 'CbCountries'
                        },
						{
                            fieldLabel  : 'Número del documento',
                            name        : 'nro_documento',
							listeners	: {
								focusleave : function (me, event, eOpts) {
									var
										form	= me.up('window').down('form'),
										values	= form.getValues(),
										app		= Admin.getApplication(),
										record	= form.getRecord();
									if (!record){
										if (me.getValue().length > 0){
											let 
												socket	= Global.getSocket();
											
											socket.emit('querySelect',{
												dataName: Global.getDbName(),
												table	: 'inscripciones',
												where	:  ['nro_documento = ?'],
												values	: [me.getValue()]
											}, function (err, result){
												if(err){
													app.onError(err.message);
												}else{
													values	= result;
													if (values.length > 0) {
														form.reset();
														form.getForm().setValues(values[0]);
														app.showResult('Ya existe una inscripción para el documento: '+me.getValue().toString());
														form.down('#FsMatricula').setHidden(true);
													}else{
														form.down('#FsMatricula').setHidden(false);
													}
												}
											});

										}
									}
								}
							}
						},
                        {
							xtype	: 'CbDocumentos',
							name	: 'id_documento'
                        },
                        {
                            xtype       : 'CbCiudades',
                            fieldLabel  : 'Lugar de expedición',
							name		: 'lug_expedicion'
                        },
                        {
                            fieldLabel  : 'Primer apellido',
                            name        : 'apellido1'
                        },
                        {
                            fieldLabel  : 'Segundo apellido',
                            name        : 'apellido2',
                            allowBlank 	: true
                        },
                        {
                            fieldLabel  : 'Primer nombre',
                            name        : 'nombre1'
                        },
                        {
                            fieldLabel  : 'Segundo nombre',
                            name        : 'nombre2',
                            allowBlank 	: true
                        },
                        {
                            xtype       : 'CbRH'
                        },
						{
							xtype		: 'CbPoblacionAtendida',
							fieldLabel	: 'Sexo',
							name		: 'id_sexo'
						},
						{
							xtype		: 'DateField',
							fieldLabel  : 'Fecha de nacimiento',
							name        : 'fecha_nacimiento'
						},
						{
							fieldLabel  : 'Edad',
							name        : 'edad',
							disabled	: false,
							readonly	: true,
							allowBlank 	: false
						},
						{
							xtype       : 'CbCiudades',
							fieldLabel  : 'Lugar de nacimiento',
							store		: 'CitiesStore2',
							name		: 'lug_nacimiento'
						},
                        {
                            fieldLabel  : 'Correo electrónico',
                            name        : 'email',
                            vtype       : 'email',
                            emptyText   : 'example@email',
                            allowBlank  : true
                        }
					]
				},
				{
					title	: 'INFORMACIÓN SOCIO-ECONÓMICA',
					items 	: [
						{
							xtype	: 'CbEstrato'
						},
						{
							fieldLabel	: 'IPS asignada',
							name		: 'ips',
							allowBlank 	: true
						}
					]
				},
				{
					title	: 'INFORMACIÓN DE RESIDENCIA',
					items 	: [
						{
							fieldLabel	: 'Dirección residencial',
							name		: 'direccion'
						},
						{
							fieldLabel	: 'Localidad',
							name		: 'localidad',
							allowBlank 	: true
						},
						{
							xtype       : 'CbCiudades',
							fieldLabel  : 'Lugar de residencia',
							store		: 'CitiesStore3',
							name		: 'lug_residencia'
						},
						{
							xtype		: 'CbZona'
						},
						{
							fieldLabel	: 'Teléfono fijo',
							name		: 'telefono',
							allowBlank 	: true
						},
						{
							fieldLabel	: 'Movíl',
							name		: 'movil',
							allowBlank 	: true
						}						
					]
				}
			]
		}		    
	]
});
