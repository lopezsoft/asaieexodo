Ext.define('Admin.view.admin.container.AdminContainer',{
    extend  : 'Ext.container.Container',
    requires    : [
        'Ext.ux.layout.ResponsiveColumn'
    ],
    controller  : 'admin',
    alias       : 'widget.admincontainer',
    xtype       : 'admincontainer',
    layout      : 'responsivecolumn' ,
    items   : [
        {
            xtype   : 'containerButton',
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
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Directores de grupo',
                    handler : 'onCreateDirGrupo',
                    iconCls : 'fas fa-users'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            disabled: true,
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Usuarios del sistema',
                    handler : 'onCreateUsers',
                    iconCls : 'fas fa-users-cog'
                }
            ]
        }
    ]
});
