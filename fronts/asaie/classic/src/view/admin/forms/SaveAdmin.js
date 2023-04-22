Ext.define('Admin.view.admin.forms.SaveAdmin' ,{
    extend		: 'Admin.base.SaveWindow',
    alias 		: 'widget.saveadmin',
	controller	: 'admin',
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle(AppLang.getSTitleNewEdit() + ' ' + AppLang.getSTitleViewAdmin());
	},
	defaultFocus: 'CbCountries',
	store       : 'AdminStore',
    items : [
    	{
			xtype		: 'customform',
			defaultType	: 'fieldSet',
			items	: [
				{
					title	: 'DATOS BÁSICOS',
					items: [
						{
							xtype: 'CbCountries'
						},
						{
                            fieldLabel  : 'Número del documento',
                            name        : 'numero_documento'
						},
                        {
                            xtype       : 'CbDocumentos',
							name		: 'id_documento'
                        },
                        {
                            xtype       : 'CbCiudades',
                            fieldLabel  : 'Lugar de expedición',
							name		: 'mun_lug_exp'
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
                            xtype       : 'CbRH',
							name		: 'tipo_sangre'//cambio tipo_sangre
                        },
						{
							xtype       : 'CbSexo',
							name		: 'sexo'
						},
						{
							xtype		: 'DateField',
							fieldLabel  : 'Fecha nacimiento',
							name        : 'fecha_nacimiento'
						},
						{
							xtype       : 'CbCiudades',
							fieldLabel  : 'Lugar de nacimiento',
							store		: 'CitiesStore2',
							name		: 'mun_lug_nac',
							itemId		: 'mun_lug_nac'
						}
					]
				},
				{
					title	: 'DATOS GENERALES',
					items 	: [
						{
							fieldLabel	: 'Dirección residencial',
							name		: 'direccion'
						},
						{
							fieldLabel	: 'Celular',
							name		: 'celular',
							allowBlank 	: true
						},
						{
							fieldLabel	: 'Teléfono fijo',
							name		: 'telefono',
							allowBlank 	: true
						},
						{
							name		: 'email',
							fieldLabel	: 'Correo electrónico',
							vtype		: 'email',
							allowBlank 	: true
						},
						{
							name		: 'cod_denominacio',
							fieldLabel	: 'codigo de denominación',
							allowBlank 	: false
						},
						{
							xtype		: 'customradiogroup',
							columns		: 2,
							fieldLabel	: 'Estado',
							items		: [
								{
									boxLabel	: 'Activo',
									name		: 'estado',
									inputValue	: 'true',
									checked		: true
								},
								{
									boxLabel	: 'Inactivo',
									name		: 'estado',
									inputValue	: 'false'
								}
							]
						}
					]
				}
			]
		}		    
	]
});
