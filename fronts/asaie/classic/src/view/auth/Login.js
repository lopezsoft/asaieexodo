Ext.define('Admin.view.auth.Login', {
    extend: 'Ext.container.Viewport',
	requires: [
        'Ext.layout.container.HBox',
		'Ext.plugin.Responsive'
    ],
    xtype	: 'login',
    alias	: 'widget.login',
	layout	: 'center',
	plugins	: 'responsive',
	items: {
		xtype   : 'panel',
		width	: '100%',
		height	: '100%',
		cls		: 'login-wrapper',
		layout: {
			type: 'hbox',
			pack: 'start',
			align: 'stretch'
		},
		items: [
			{
				flex	: 2,
				xtype   : 'image',
				src		: '/assets/img/login-v2.svg',
				cls		: 'x-panel-left'
			},
			{
				flex	: 1,
				baseCls	: 'panel-right',
				xtype 	: 'container',
				items	: [
					{ 
						xtype	: 'form',
						width	: '100%',
						flex	: 1,
						cls		: 'login-form',
						items:[
							{
								xtype	: 'box',
								html	: '<i class="fas fa-user-lock"></i>',
								cls		: 'x-icon-login'
							},
							{
								title		: 'Inicio de sesión',
								cls			: 'login-form',
								bodyPadding	: 5,
								layout		: 'anchor',
								height		: 250,
								with		: '100%',
								layout: {
									type: 'vbox',
									align: 'stretch'
								},
								// The fields
								defaultType: 'textfield',
								items: [
									{
										allowBlank	: false,
										name		: 'user_name',
										emptyText	: 'Nombre de usuario'
									}, 
									{
										allowBlank	: false,
										name		: 'password',
										emptyText	: 'Contraseña',
										inputType	: 'password'
									},
									{
										xtype		:'checkbox',
										boxLabel	: 'Recuérdame',
										label		: 'Recuérdame',
										inputValue	: 1,
										uncheckedValue	: 0,
										name		: 'remember_me'
									}
								],
					
								// Reset and Submit buttons
								buttons: [ 
									{
										text	: 'Recuperar contraseña',
										iconCls	: 'fas fa-key',
										handler: function() {
											
										}
									},
									{
										text	: 'Inicia sesión',
										formBind: true, //only enabled once the form is valid
										disabled: true,
										iconCls	: 'fas fa-sign-in-alt',
										cls		: 'x-toolbar-login',
										handler: function() {
											const form = this.up('form').getForm();
											if (form.isValid()) {
												const values	= this.up('form').getValues();
												AuthToken.onLogin(values);
											}
										}
									}
								],
							}
						]
					}
				]
			}
		]
	}
});
