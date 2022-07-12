Ext.define('Admin.view.docentes.TecherLiveClassesSave',{
    extend      : 'Admin.base.SaveWindow',
    alias  	    : 'widget.teacherliveclassessave',
    xtype  	    : 'teacherliveclassessave',
    controller  : 'teacherliveclasses',
    store		: 'LiveClassesStore',
	reloadStore : true,
	maxHeight	: 500,
    items 	: [
        {
            xtype 	    : 'customform',
            items : [
                {
                    name 	    : 'class_description',
					fieldLabel	: 'Descripción o tema de la clase',
					maxLength 	: 120,
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
                            name        : 'url_file',
                            itemId      : 'url_file',
                            flex        : 1,
                            fieldLabel  : 'URL archivo adjunto'
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
                                        pathReadFile    : 'liveClasses/read_files_live_classes',
                                        pathUploadFile  : 'liveClasses/upload_files_live_classes',
                                        listeners : {
                                            afterselect : function (me, r) {
                                                btn.up('form').down('#url_file').setValue(r.get('path_set'));
                                            },
                                            afterupload : function (me, r) {
                                                btn.up('form').down('#url_file').setValue(r.foto);
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
					xtype       : 'customdate',
					fieldLabel  : 'Fecha de inicio',
					name        : 'closing_date'
				},
				{
					xtype       : 'customtime',
					fieldLabel  : 'Hora de inicio',
					name        : 'closing_time'    
				},
                {
                    xtype		: 'customnumberfield',
					value		: 15,
					minValue	: 5,
					maxValue	: 45,
					fieldLabel	: 'Tiempo (en minutos)',
					name        : 'class_time'
                }
            ]
        }
    ]
});
