Ext.define('Admin.view.admin.forms.SchoolInformation' ,{
    extend		: 'Admin.forms.CustomForm',
    alias 		: 'widget.schoolinformation',
	controller	: 'admin',	
	initComponent : function(){
		let me	= this;
			app	= Admin.getApplication();
		app.onStore('general.CitiesStore');
		app.onStore('admin.SchoolStore');
		me.setTitle(AppLang.getSTitleNewEdit()+AppLang.getSSpace()+AppLang.getSTitleViewSchool());
		me.callParent(arguments);
	},
	onSave : function(btn){
		this.saveData('SchoolStore', false);
	},
	store		: 'SchoolStore',
	defaultType	: 'fieldSet',
	items	: [
		{
			title	: 'DATOS BÁSICOS',
			items 	: [
				{
					fieldLabel  : 'Código escolar',
					name        : 'school_id'
				},
				{
					fieldLabel  : 'Nombre del establecimiento',
					name        : 'school_name'
				},
				{
					fieldLabel  : 'Rector(a)/Director(a)',
					name        : 'director_name'
				},
				{
					fieldLabel  : 'Número de sedes',
					name        : 'number_locations'
				},
				{
					fieldLabel  : 'DNI',
					name        : 'dni'
				}
			]
		},
		{
			title	: 'UBICACIÓN',
			items 	: [
				{
					xtype       : 'CbCiudades',
					fieldLabel  : 'Ciudad',
					name		: 'city_id'
				},
				{
					fieldLabel	: 'Dirección',
					name		: 'address'
				},
				{
					fieldLabel	: 'Barrio',
					name		: 'suburb'
				},
				{
					fieldLabel	: 'Localidad',
					name		: 'location',
					allowBlank 	: true
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
					fieldLabel	: 'Página web',
					name		: 'web',
					allowBlank 	: true
				}
			]
		}
	]
});
