Ext.define('Admin.view.widgets.WidgetA', {
    extend  : 'Ext.panel.Panel',
    xtype   : 'widget-a',
    ui      : 'panel-white',
    cls     : 'admin-widget shadow',
    initComponent   : function(){
        let 
            me      = this,
            app     = Admin.getApplication(),
            enroll  = Global.getData().enrollment[0];

        app.onStore('inscripciones.InscripcionesStore');
        app.onStore('general.DocumentosStore');
        app.onStore('general.DptosStore');
        app.onStore('general.CitiesStore');
        app.onStore('general.CitiesStore4');
        app.onStore('general.CitiesStore2');
        app.onStore('general.CitiesStore3');
        app.onStore('general.SexoStore');
        app.onStore('general.RHStore');
        app.onStore('general.EstratoStore');
        app.onStore('general.EPSStore');
        app.onStore('general.SisbenStore');
        app.onStore('general.ZonaStore');
        app.onStore('general.EtniasStore');
        app.onStore('general.ResguardosStore');
        app.onStore('general.PoblacionVictimaConStore');
        app.onStore('general.TipoDiscapacidadStore');
        app.onStore('general.PoblacionatendidaStore');
        app.onStore('general.CapacidadesExcepcionalesStore');
        app.onStore('docentes.observador.DesicionStore');
        app.onStore('general.SedesStore');
        app.onStore('general.GradosStore');
        app.onStore('general.GrupoStore');
        app.onStore('general.JornadasStore');
        app.onStore('general.CountryStore');
        me.items    =  [
            {
                xtype   : 'image',
                cls     : 'widget-top-container-first-img',
                height  : 72,
                width   : 72,
                alt     : 'profile-image',
                src     : (Ext.isEmpty(Global.getData().user_data[0].image)) ? Global.getAvatarUnknoun() : Global.getData().user_data[0].image,
            },
            {
                xtype: 'component',
                cls: 'widget-top-first-container postion-class',
                height: 135
            },
            {
                xtype: 'container',
                cls: 'widget-bottom-first-container postion-class',
                height: 165,
                padding: '30 0 0 0',
                layout: {
                    type: 'vbox',
                    align: 'center'
                },
                items: [
                    {
                        xtype   : 'label',
                        cls     : 'widget-name-text',
                        html    : (enroll) ? enroll.estudiante + " (" + enroll.id + ")" : ''
                    },
                    {
                        xtype   : 'label',
                        html    : 'SEDE: ' + ((enroll) ? enroll.sede : '')
                    },
                    {
                        xtype   : 'label',
                        html    : 'CURSO: ' + ((enroll) ? enroll.grado + ' - ' + enroll.id_group : '')
                    },
                    {
                        xtype   : 'label',
                        html    : 'JORNADA: ' + ((enroll) ? enroll.jornada : '')
                    },
                    {
                        xtype   : 'toolbar',
                        cls     : 'widget-tool-button',
                        flex    : 1,
                        items   : [
                            {
                                ui      : 'soft-blue',
                                iconCls : 'x-fa fa-pencil',
                                text    : 'Editar datos personales',
                                handler : function (btn) {
                                    var
                                        me = Admin.getApplication();
                                    
                                    extra = {
                                        pdbTable    : 'inscripciones',
                                        pdbId       : Global.getData().user_parent
                                    };
                                    me.setParamStore('InscripcionesStore',extra,false);
                                    store   = Ext.getStore('InscripcionesStore');
                                    store.load({
                                        scope: this,
                                        callback: function(records) {
                                            if (records.length == 1){
                                                win = Ext.create('Admin.view.estudiantes.EditStudentInformation');
                                                var
                                                    form    = win.down('form');
                                                form.loadRecord(records[0]);
                                                win.show();
                                            }
                                        }
                                    });
                                }
                            },
                            {
                                ui      : 'soft-purple',
                                iconCls : 'x-fa fa-book',
                                text    : 'Documentos digitales',
                                handler : function (btn) {
                                    var me  = Admin.getApplication();
                                    me.onStore('docs.ImageBrowserStore');
                                    Ext.create({
                                        xtype           : 'FilesView',
                                        title           : 'Seleccionar archivo',
                                        pathReadFile    : 'academic/read_files_dig_est',
                                        pathUploadFile  : 'academic/upload_files_dig_est',
                                        titlePanelLoad  : 'Subir archivos',
                                        titlePanelView  : 'Mis archivos',
                                        textButtonLoad  : 'Seleccionar una archivo en el equipo',
                                        textButtonApply : 'Aceptar',
                                        extraParams     : {
                                            pdbCodEst   : Global.getData().user_parent
                                        }
                                    }).show();
                                }
                            }
                        ]
                    }
                ]
            }
        ]
        me.callParent(arguments);
    }
});
