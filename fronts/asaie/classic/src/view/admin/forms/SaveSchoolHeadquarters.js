Ext.define('Admin.view.admin.forms.SaveSchoolHeadquarters',{
    extend			: 'Admin.base.SaveWindow',
    alias 			: 'widget.saveschoolheadquarters',
	controller		: 'admin',
	initComponent : function(){
		this.callParent(arguments);
		this.setTitle(AppLang.getSTitleNewEdit()+AppLang.getSSpace()+AppLang.getSTitleViewVanues());
	},
	store	: 'SedesStore',
    items 	: [
    	{
			xtype		: 'customform',
			store		: 'SedesStore',
			defaultType	: 'fieldSet',
			items	: [
				{
					title	: 'DATOS DE LA SEDE',
					items 	: [
						{
							fieldLabel  : 'Nombre',
							name        : 'NOMBRE_SEDE'
						},
						{
							xtype       : 'CbCiudades',
							fieldLabel  : 'Ciudad o Municipio',
							name		: 'ID_CITY'
						},
						{
							fieldLabel  : 'Dirección',
							name        : 'DIRECCION_SEDE'
						},
						{
							fieldLabel  : 'Barrio Inspección',
							name        : 'BARRIO'
						},
						{
							xtype		: 'CbZona',
							name		: 'ID_ZONA'
						},
						{
							fieldLabel	: 'FAX',
							name		: 'FAX',
							allowBlank 	: true
						},
						{
							fieldLabel	: 'Teléfonos',
							name		: 'TELEFONOS_SEDE',
							allowBlank 	: true
						},
						{
							fieldLabel	: 'Correo electrónico',
							name		: 'EMAIL',
							allowBlank 	: true
						},
						{
							xtype		: 'CbADesicion',
							name		: 'PRINCIPAL',
							fieldLabel	: 'Sede principal'
						},
						{
							xtype		: 'CbPoblacionAtendida',
							name		: 'ID_SEXO',
							fieldLabel	: 'Género de población atendida'
						}
					]
				}
			]
		}		    
	]
});
