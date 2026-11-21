Ext.define('Admin.view.academico.inscripciones.forms.InscripcionesForm',{
    extend	: 'Admin.base.SaveWindow',
    alias 	: 'widget.InscripcionesForm',
	maxWidth	: 750,
	controller	: 'academico',
	requires	: [
		'Admin.combo.CbCountries',
        'Admin.combo.CbDocumentos',
        'Admin.combo.CbCiudades',
		'Admin.combo.CbRH',
		'Admin.combo.CbPoblacionAtendida',
	],
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle(AppLang.getSTitleNewEdit() + ' ' + AppLang.getSTitleViewStudents());
	},
	store		: 'InscripcionesStore',
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
								focusleave : function (me) {
									let form = me.up('window').down('form'),
										app = Admin.getApplication(),
										record = form.getRecord();
									if (!record){
										const {school, profile}	= AuthToken.recoverParams();
										const dt				= new Date();
										if (me.getValue().length > 0){
											Ext.Ajax.request({
												url: Global.getApiUrl() + '/crud/index',
												method: 'GET',
												headers: {
													'Authorization' : (AuthToken) ? AuthToken.authorization() : ''
												},
												params: {
													pdbTable	: "inscripciones",
													where		: `{"nro_documento" : "${me.getValue()}"}`,
													schoolId  	: school.id || 0,
													profileId   : profile.id || 0,
													year        : school.year || dt.getFullYear(),
												},
												success: function (response, opts) {
													const data	= JSON.parse(response.responseText);
													if (data.records.data.length > 0) {
														form.reset();
														form.getForm().setValues(data.records.data[0]);
														app.showResult('Ya existe una inscripción para el documento: '+me.getValue().toString());
														form.down('#FsMatricula').setHidden(true);
													}
												},
												failure: function (response, opts) {
													app.onError('Error en el servidor, código del estado ' + response.status);
												}
											});
										}
									}
								}
							}
						},
                        {
							xtype	: 'CbDocumentos',
							name	: 'id_documento',
							value	: 5
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
				},
				{
					title	: 'INFORMACIÓN DE MATRICULA',
					itemId	: 'FsMatricula',
					hidden	: true,
					items 	: [
						{
							xtype		: 'CbSedes',
							name		: 'id_headquarters',
							allowBlank 	: true,
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
							xtype	: 'CbJornadas',
							bind: {
								visible: '{comboSedes.value}'
							},
							name		: 'id_study_day',
							allowBlank 	: true
						},
						{
							xtype		: 'CbGrados',
							bind: {
								visible	: '{comboJornadas.value}'
							},
							name		:'id_grade',
							allowBlank 	: true
						},
						{
							xtype	: 'CbGrupo',
							bind: {
								visible: '{comboGrados.value}'
							},
							name		: 'id_group',
							allowBlank 	: true
						}
					]
				}
			]
		}		    
	]
});
