Ext.define('Admin.store.NavigationTree', {
    extend: 'Ext.data.TreeStore',
    storeId: 'NavigationTree',
    fields: [
        {
            name: 'text'
        }
    ],
    root:
    {
        expanded: true,
        children:
            [
                {
                    text        : 'Dashboard',
                    iconCls     : 'x-fa fa-desktop',
                    viewType    : 'admindashboard',
                    routeId     : 'dashboard', // routeId defaults to viewType
                    leaf        : true
                },
                {
                    text    : 'Administrativo',
                    iconCls : 'x-fa fa-home',
                    leaf    : true,
                    viewType: 'admincontainer',
                    routeId : 'administrative'
                },
                {
                    text    : 'Académico',
                    iconCls : 'x-fa fa-briefcase',
                    leaf    : true,
                    viewType: 'academicContainerView',
                    routeId : 'academico'
                },
                {
                    text    : 'Promoción',
                    iconCls : 'x-fa fa-graduation-cap',
                    leaf    : true,
                    routeId : 'promocion'
                },
                {
                    text    : 'Elecciones escolares',
                    iconCls : 'x-fa fa-group',
                    leaf    : true,
					viewType: "representativeContainerView",
                    routeId : 'representative'
                },
                {
                    text    : 'Configuraciones',
                    iconCls : 'x-fa fa-wrench',
                    leaf    : true,
                    viewType: 'configPanel',
                    routeId : 'configuraciones'
                }
            ]
    }
});
