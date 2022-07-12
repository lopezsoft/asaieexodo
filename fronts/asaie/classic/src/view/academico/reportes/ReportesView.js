/**
 * Created by LOPEZSOFT2 on 21/09/2016.
 */
Ext.define('Admin.view.academico.reportes.ReportesView',{
    extend      : 'Admin.forms.CustomForm',
    alias       : 'widget.reportes',
    xtype       : 'reportes',
    // title       : 'Reportes',
    controller  : 'ReportesAcademico',
    showSaveButton  : false,
    items: [
        {
            xtype       : 'container',
            layout      : 'responsivecolumn',
            defaultType : 'containerButton',
            items: [
                {
                    items: [
                        {
                            xtype   : 'buttonPanel',
                            text    : 'Consolidado académico',
                            handler : function(btn){
                                var 
                                    ts  = btn.up('window') || btn.up('form');
                                    ts.onCreateStors();
                                    win = Ext.create('Admin.view.general.ConsolidadosReportView');
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
                            text    : 'Boletines',
                            handler : function (btn) {
                                var 
                                    me  = Admin.getApplication(),
                                    ts  = btn.up('window') || btn.up('form');
                                    ts.onCreateStors();
                                    me.onStore('general.MatriculadosStore');
                                    win     = Ext.create('Admin.view.docentes.BoletinesReportView');
                                    win.show();
                            },
                            iconCls : 'x-fa fa-newspaper-o'
                        }
                    ]
                },
                {
                    items: [
                        {
                            xtype   : 'buttonPanel',
                            text    : 'Estadísticas',
                            handler : function (btn) {
                                var 
                                    me = Admin.getApplication();
                                me.onStore('general.PeriodosStore');
                                me.onStore('general.NivelesAcademicosStore');
                                win = Ext.create('Admin.view.convivencia.reportes.EstadisticaReportView');
                                win.show();
                            },
                            iconCls : 'x-fa fa-level-up'
                        }
                    ]
                },
                {
                    items: [
                        {
                            xtype   : 'buttonPanel',
                            text    : 'Consolidado matricula',
                            handler : 'onConsolidadoMatricula',
                            iconCls : 'x-fa fa-cloud-download'
                        }
                    ]
                },
                {
                    items: [
                        {
                            xtype   : 'buttonPanel',
                            text    : 'Estudiantes sin nota',
                            handler : 'onEstSinNotas',
                            iconCls : 'x-fa fa-cloud-download'
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
                            text    : 'Desplazados',
                            handler : function(btn){
                                win  = Ext.create('Admin.view.academico.DesplazadosView') ;
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
                            text    : 'Ficha de matricula',
                            handler : function (btn) {
                                var
                                    ts = btn.up('window') || btn.up('form');
                                ts.onCreateStors();
                                win  = Ext.create('Admin.view.academico.FichaMatriculaView') ;
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
                            text    : 'Listas sin carga',
                            handler : function (btn) {
                                var
                                    ts = btn.up('window') || btn.up('form');
                                    ts.onCreateStors();
                                    win  = Ext.create('Admin.view.academico.CtrlNotasView') ;
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
                },
                {
                    items: [
                        {
                            xtype   : 'buttonPanel',
                            text    : 'Carnés',
                            handler : 'onCarne',
                            iconCls : 'x-fa fa-newspaper-o'
                        }
                    ]
                },
                {
                    items: [
                        {
                            xtype   : 'buttonPanel',
                            text    : 'Fechas de nacimiento',
                            handler : function (btn) {
                                var
                                    ts = btn.up('window') || btn.up('form');
                                    ts.onCreateStors();
                                    win  =  Ext.create('Admin.view.academico.FechaNacView') ;
                                    win.show();
                            },
                            iconCls : 'x-fa fa-calendar'
                        }
                    ]
                },
                {
                    items: [
                        {
                            xtype   : 'buttonPanel',
                            text    : 'Familiares',
                            handler :  function (btn) {
                                var
                                    me  = Admin.getApplication(),
                                    ts  = btn.up('window') || btn.up('form');
                                    ts.onCreateStors();
                                    me.onStore('inscripciones.TipoFamiliarStore');
                                    win  = Ext.create('Admin.view.academico.FamiliaresRepView');
                                    win.show();
                            },
                            iconCls : 'x-fa fa-users'
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