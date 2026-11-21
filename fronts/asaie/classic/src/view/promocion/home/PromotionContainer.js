Ext.define('Admin.view.promocion.PromotionContainer',{
    extend  : 'Ext.container.Container',
    controller  : 'Promocion',
    alias   : 'widget.promocion',
    xtype   : 'promocion',
    layout: 'responsivecolumn' ,
	initComponent: function () {
		const { isRector, isCoordinador, isSecretary } = AuthToken.profileSettings();
		this.items   = [
			{
				xtype   : 'containerButton',
				disabled: isSecretary,
				hidden	: isSecretary,
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Actividades de apoyo',
						iconCls : 'x-fa fa-cog',
						handler : 'onNivelaciones'
					}
				]
			},
			{
				xtype   : 'containerButton',
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Informe final de promoción',
						iconCls : 'x-fa fa-book',
						handler : 'onLibroFinal'
					}
				]
			},
			{
				xtype   : 'containerButton',
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Actas de promoción',
						iconCls : 'x-fa fa-users',
						handler : 'onActas'
					}
				]
			},
			{
				xtype   : 'containerButton',
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Actas de promoción estadística',
						iconCls : 'x-fa fa-users',
						handler : 'onActasEstadistica'
					}
				]
			},
			{
				xtype   : 'containerButton',
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Sabanas finales',
						handler : 'onSabanas',
						iconCls : 'x-fa fa-book'
					}
				]
			},
			{
				xtype   : 'containerButton',
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Promoción anticipada',
						handler : 'onPromAnti',
						iconCls : 'x-fa fa-graduation-cap'
					}
				]
			},
			{
				xtype   : 'containerButton',
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Certificado de promoción',
						handler : 'onCertificado',
						iconCls : 'x-fa fa-certificate'
					}
				]
			},
			{
				xtype   : 'containerButton',
				disabled: !isRector,
				hidden	: !isRector,
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Cerrar año lectivo',
						handler : function (btn) {
							const me = Admin.getApplication();
							me.onMsgWait();
							Ext.Ajax.request({
								url     : Global.getApiUrl() + '/promotion/close-year' ,
								headers	: Global.getHeaders(),
								method  : 'POST',
								params  : {
									...Global.getSchoolParams()
								},
								success: function() {
									me.showResult('Cierre completo');
								},
								failure: function(response) {
									const error = JSON.parse(response.responseText);
									me.onError(error.message);
								},
								callback    : function () {
									me.onMsgClose();
								}
							});
						},
						iconCls : 'x-fa fa-calendar'
					}
				]
			},
			{
				xtype   : 'containerButton',
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Matricular antiguos',
						handler : 'onViewAntiguos',
						iconCls : 'x-fa fa-graduation-cap'
					}
				]
			},
			{
				xtype   : 'containerButton',
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Actas de grado',
						disabled: true,
						handler : 'onActaGrado',
						iconCls : 'x-fa fa-graduation-cap'
					}
				]
			},
			{
				xtype   : 'containerButton',
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Historial académico',
						handler : 'onHistorilaAca',
						iconCls : 'x-fa fa-graduation-cap'
					}
				]
			}
		];
		this.callParent(arguments);
	}
});
