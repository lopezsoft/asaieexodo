Ext.define('Admin.view.docentes.OnlineActitiesSave',{
    extend      : 'Admin.base.SaveWindow',
    alias  	    : 'widget.onlineactitiessave',
    xtype  	    : 'onlineactitiessave',
    controller  : 'actividades',
    store		: 'OnlineActivitiesStore',
    reloadStore : true,
    items 	: [
        {
            xtype 	    : 'customform',
            items : [
                {
                    fieldLabel  : 'Nombre de la actividad',
                    name        : 'nombre'
                },
                {
                    xtype 	    : 'customhtmleditor',
                    name 	    : 'descripcion',
                    fieldLabel	: 'Descripción',
                    allowBlank  : true
                },
                {
                    fieldLabel  : 'URL Video YouTube',
                    name        : 'url_video',
                    allowBlank  : true
                },
                {
                    fieldLabel  : 'URL enlace externo',
                    name        : 'url_enlace',
                    allowBlank  : true
                },
                {
                    xtype       : 'fieldcontainer',
                    layout      : 'hbox',
                    items       : [
                        {
                            xtype       : 'customtext',
                            labelAlign  : 'left',
                            labelWidth  : 180,
                            readOnly    : true,
                            allowBlank  : true,
                            name        : 'url_archivo',
                            itemId      : 'url_archivo',
                            flex        : 1,
                            fieldLabel  : 'URL archivo en la nube'
                        },
                        {
                            xtype       : 'customButton',
                            text        : '...',
                            iconCls     : 'x-fa fa-cloud-upload',
                            tooltip     : 'Subir archivo',
                            handler     : function (btn) {
                                var me  = Admin.getApplication();
                                Ext.require('Admin.view.docs.FilesView');
                                Ext.onReady(function () {
                                    me.onStore('docs.ImageBrowserStore');
                                    var win = Ext.create({
                                        xtype           : 'FilesView',
                                        pathReadFile    : 'c_docentes/read_files_mat_educ',
                                        pathUploadFile  : 'c_docentes/upload_files_mat_educ',
                                        listeners : {
                                            afterselect : function (me, r) {
                                                btn.up('form').down('#url_archivo').setValue(r.get('path_set'));
                                            },
                                            afterupload : function (me, r) {
                                                btn.up('form').down('#url_archivo').setValue(r.foto);
                                            }
                                        }
                                    }).on('apply', function(me){
                                        win.close();
                                    });
                                    win.show();
                                });
                            }
                        }
                    ]
                },
                {
                    xtype		: 'customradiogroup',
                    columns		: 2,
                    vertical	: true,
                    fieldLabel	: 'Calificable',
                    items		: [
                        {
                            boxLabel	: 'Si',
                            name		: 'calificable',
                            inputValue	: 1
                        },
                        {
                            boxLabel	: 'No',
                            name		: 'calificable',
                            inputValue	: 0
                        }
                    ]
                },
                {
                    xtype   : 'customcontainer',
                    items   : [
                        {
                            xtype       : 'customdate',
                            fieldLabel  : 'Disponible desde',
                            name        : 'fecha'
                        },
                        {
                            xtype       : 'customtime',
                            fieldLabel  : 'Hora',
                            name        : 'hora'    
                        }
                    ]
                },
                {
                    xtype   : 'customcontainer',
                    items   : [
                        {
                            xtype       : 'customdate',
                            fieldLabel  : 'Disponible hasta',
                            name        : 'fecha_cierre'
                        },
                        {
                            xtype       : 'customtime',
                            fieldLabel  : 'Hora',
                            name        : 'hora_cierre'    
                        }
                    ]
                },
                {
                    xtype		: 'customradiogroup',
                    allowBlank  : true,
                    columns		: 2,
                    vertical	: true,
                    fieldLabel	: 'Estado',
                    items		: [
                        {
                            boxLabel	: 'Disponible',
                            disabled    : true,
                            name		: 'estado',
                            inputValue	: 1
                        },
                        {
                            boxLabel	: 'No Disponible',
                            disabled    : true,
                            name		: 'estado',
                            inputValue	: 0
                        }
                    ]
                }
            ]
        }
    ]
});