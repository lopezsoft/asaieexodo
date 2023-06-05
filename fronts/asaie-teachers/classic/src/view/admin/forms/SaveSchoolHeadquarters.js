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
							name        : 'headquarters_name'
						},
						{
							xtype       : 'CbCiudades',
							fieldLabel  : 'Ciudad o Municipio',
							name		: 'city_id'
						},
						{
							fieldLabel  : 'Dirección',
							name        : 'address'
						},
						{
							fieldLabel  : 'Barrio Inspección',
							name        : 'suburd'
						},
						{
							xtype		: 'CbZona',
							name		: 'zone_id'
						},
						{
							fieldLabel	: 'Teléfonos',
							name		: 'phones',
							allowBlank 	: true
						},
						{
							fieldLabel	: 'Correo electrónico',
							name		: 'email',
							allowBlank 	: true
						},
						{
							xtype		: 'CbADesicion',
							name		: 'is_main',
							fieldLabel	: 'Sede principal'
						},
						{
							xtype		: 'CbPoblacionAtendida',
							name		: 'sex_id',
							fieldLabel	: 'Género de población atendida'
						}
					]
				}
			]
		}		    
	]
});
