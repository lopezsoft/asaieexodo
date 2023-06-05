Ext.define('Admin.view.docentes.reportes.InformesDocentes',{
    extend  : 'Admin.forms.CustomForm',
    requires: [
        'Ext.ux.layout.ResponsiveColumn'
    ],
    controller  : 'Reporboletin',
    alias       : 'widget.informesdocentes',
    reference   : 'informesdocentes',
    items: [
        {
            xtype       : 'container',
            layout      : 'responsivecolumn',
            defaultType : 'containerButton',
            items   : [
				{
					items   : [
						{
							xtype   : 'buttonPanel',
							text    : 'Informe final de evaluación',
							iconCls : 'x-fa fa-book',
							handler : 'onLibroFinal'
						}
					]
				},
                {
                    items   : [
                        {
                            xtype   : 'buttonPanel',
                            text    : 'Boletines',
                            handler : 'onReportView',
                            iconCls : 'x-fa fa-newspaper-o'
                        }
                    ]
                },
                {
                    items   : [
                        {
                            xtype   : 'buttonPanel',
                            text    : 'Consolidado académico',
                            handler : 'onViewConsolidado',
                            iconCls : 'x-fa fa-print'
                        }
                    ]
                },
                {
                    xtype   : 'containerButton',
                    items   : [
                        {
                            xtype   : 'buttonPanel',
                            text    : 'Estadísticas',
                            handler : 'onViewEstadistica',
                            iconCls : 'x-fa fa-level-up'
                        }
                    ]
                },
                {
                    items: [
                        {
                            xtype   : 'buttonPanel',
                            text    : 'Estudiantes por jornadas',
                            handler : function(btn){
                                win = Ext.create('Admin.view.academico.EstudiantesJornadasView');
                                win.show();
                            },
                            iconCls : 'x-fa fa-print'
                        }
                    ]
                },
                {
                    items: [
                        {
                            xtype   : 'buttonPanel',
                            text    : 'Matriculados',
                            handler : function(btn){
                                var
                                    ts = btn.up('window') || btn.up('form');
                                    ts.onCreateStors();
                                    win = Ext.create('Admin.view.academico.MatriculadosView');
                                    win.show();
                            },
                            iconCls : 'x-fa fa-print'
                        }
                    ]
                },
                {
                    items: [
                        {
                            xtype   : 'buttonPanel',
                            text    : 'Estadística por edades',
                            handler :  function (btn) {
                                win = Ext.create('Admin.view.academico.EstadisticaEdadesView');
                                win.show();
                            },
                            iconCls : 'x-fa fa-print'
                        }
                    ]
                },
                {
                    items: [
                        {
                            xtype   : 'buttonPanel',
                            text    : 'Listas con carga',
                            handler : function (btn) {
                                var
                                    ts = btn.up('window') || btn.up('form'),
                                    me  = Admin.getApplication();
                                    ts.onCreateStors();
                                    me.onStore('admin.DocentesDirGrupoStore');
                                    win  = Ext.create('Admin.view.academico.CtrlNotasCargaView') ;
                                    win.show();
                            },
                            iconCls : 'x-fa fa-print'
                        }
                    ]
                },
                {
                    items: [
                        {
                            xtype   : 'buttonPanel',
                            text    : 'Asignación académica',
                            handler :  function (btn) {
                                var
                                    me  = Admin.getApplication(),
                                    ts  = btn.up('window') || btn.up('form');
                                    ts.onCreateStors();
                                    me.onStore('admin.DocentesDirGrupoStore');
                                    win  = Ext.create('Admin.view.academico.AsignacionAcadView') ;
                                    win.show();
                            },
                            iconCls : 'x-fa fa-print'
                        }
                    ]
                },
                {
                    items: [
                        {
                            xtype   : 'buttonPanel',
                            text    : 'Listado docentes',
                            handler : function (btn) {
                                var
                                    me = Admin.getApplication();
                                    me.onStore('admin.DocentesDirGrupoStore');
                                    win  = Ext.create('Admin.view.academico.ListaDocentesView') ;
                                    win.show();
                            },
                            iconCls : 'x-fa fa-print'
                        }
                    ]
                }
            ]
        }
    ],
    onCreateStors   : function(){
        let 
            me  = Admin.getApplication();
        me.onStore('general.PeriodosStore');
        me.onStore('general.GradosStore');
        me.onStore('general.GrupoStore');
        me.onStore('general.JornadasStore');
        me.onStore('general.SedesStore');
    }
});
