Ext.define('Admin.view.admin.container.AdminContainer',{
    extend  : 'Ext.container.Container',
    requires    : [
        'Ext.ux.layout.ResponsiveColumn'
    ],
    controller  : 'admin',
    alias       : 'widget.admincontainer',
    xtype       : 'admincontainer',
    layout      : 'responsivecolumn' ,
	initComponent: function () {
		const { isRector, isCoordinador } = AuthToken.profileSettings();
		this.items = [
			{
				xtype   : 'containerButton',
				disabled: !isRector,
				hidden	: !isRector,
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Datos del plantel',
						iconCls : 'fas fa-school',
						handler : 'onCreateSchool'
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
						text    : 'Sedes educativas',
						iconCls : 'fas fa-school',
						handler : 'onCreateSchoolHeadquarters'
					}
				]
			},
			{
				xtype   : 'containerButton',
				disabled: isCoordinador,
				hidden	: isCoordinador,
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Personal docente',
						iconCls : 'fas fa-chalkboard-teacher',
						handler : 'onCreateTeachers'
					}
				]
			},
			{
				xtype   : 'containerButton',
				disabled: isCoordinador,
				hidden	: isCoordinador,
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Personal administrativo',
						handler : 'onCreateAdmin',
						iconCls : 'fas fa-user-friends'
					}
				]
			},
			{
				xtype   : 'containerButton',
				disabled: !(isRector || isCoordinador),
				hidden	: !(isRector || isCoordinador),
				items   : [
					{
						xtype   : 'buttonPanel',
						text    : 'Directores de grupo',
						handler : 'onCreateDirGrupo',
						iconCls : 'fas fa-users'
					}
				]
			},
			// {
			// 	xtype   : 'containerButton',
			// 	disabled: !isRector,
			// 	hidden	: !isRector,
			// 	items   : [
			// 		{
			// 			xtype   : 'buttonPanel',
			// 			text    : 'Usuarios del sistema',
			// 			handler : 'onCreateUsers',
			// 			iconCls : 'fas fa-users-cog'
			// 		}
			// 	]
			// }
		];
		this.callParent(arguments);
	},
});
