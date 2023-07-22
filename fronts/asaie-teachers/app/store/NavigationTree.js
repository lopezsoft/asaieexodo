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
					viewType    : 'teacherdashboard',
					routeId     : 'dashboard', // routeId defaults to viewType
					leaf        : true
				},
				{
					text        : 'Notas académicas',
					iconCls     : 'fas fa-edit',
					viewType    : 'notasacademicasdocentes',
					routeId     : 'registronotas',
					leaf        : true
				},
				/*{
					text    : 'Plan de formación',
					iconCls : 'x-fa fa-book',
					leaf    : true
				},*/
				{
					text    : 'Descriptores',
					iconCls : 'x-fa fa-star-half-o',
					leaf    : true,
					viewType: 'asignaciondescriptores',
					routeId : 'descriptores'
				},
				{
					text    : 'Sugerencias',
					iconCls : 'x-fa fa-commenting',
					leaf    : true,
					viewType: 'sugerenciasform',
					routeId : 'sugerencias'
				},
				{
					text    : 'Nivelaciones',
					iconCls : 'x-fa fa-thumbs-up',
					leaf    : true,
					viewType: 'planmejoramiento',
					routeId : 'nivelaciones'
				},
				{
					text    : 'Seguimiento académico',
					iconCls : 'x-fa fa-eye',
					viewType: 'seguimientoacademico',
					routeId : 'seguimiento',
					leaf    : true
				},
				{
					text    : 'Informes',
					iconCls : 'x-fa fa-newspaper-o nav-tree-change-new',
					cls     : 'parpadea chat-button',
					viewType: 'informesdocentes',
					routeId : 'informes',
					visible : Global.hasAccessTeacherReports(),
					leaf    : true
				},
				{
					text    : 'Actividades académicas',
					iconCls : 'x-fa fa-spinner',
					viewType: 'actividadesacademicas',
					routeId : 'actividades',
					visible : Global.hasAccessAcademicActivities(),
					leaf    : true
				}
            ]
    }
});
