Ext.define('Admin.view.estudiantes.perfil.PefilMenuEstudiantesView',{
    extend  : 'Admin.base.WinMenu',
    alias   : 'widget.PefilMenuEstudiantesView',
    controller  : 'estudiantes',
    height      : 220,
    items       : [
        {
            xtype   : 'customform',
            items   : [
                {
                    xtype   : 'image',
                    cls     : 'width-button-large circular',
                    height  : 128,
                    width   : 128,
                    alt     :'Imagen del estudiante',
                    itemId  : 'imgUser',
                    imgCls  : 'avatar-background avatar-perfil',
                    title   : 'Imagen  del perfil',
                    listeners: {
                        el: {
                            click : function (e) {
                                var  me   = Admin.getApplication();
                                me.onMsgWait();
                                Ext.require([
                                    'Admin.view.docs.FilesView',
                                    'Admin.store.estudiantes.perfil.PerfilEstudiantesStore'
                                ]);
                                Ext.onReady(function (btn) {
                                    me.onStore('docs.ImageBrowserStore');
                                    me.onStore('estudiantes.perfil.PerfilEstudiantesStore');
                                    storeX = Ext.getStore('PerfilEstudiantesStore');
                                    storeX.load();
                                    var win = Ext.create({
                                        xtype       : 'FilesView',
                                        title       : 'Seleccionar foto de Perfil del estudiante',
                                        pathReadFile    : 'students/read_images',
                                        pathUploadFile  : 'students/upload_foto',
                                        titlePanelLoad  : 'Subir foto',
                                        titlePanelView  : 'Mis fotos',
                                        textButtonLoad  : 'Seleccionar una foto en el equipo',
                                        textButtonApply : 'Establecer como foto de perfil',
                                        listeners : {
                                            afterselect : function (me, r) {
                                                store = Ext.getStore('PerfilEstudiantesStore');
                                                record = store.getAt(0);
                                                record.set('foto', r.get('path_set'));
                                                record.set('mime', r.get('mime'));
                                            },
                                            afterupload : function (me, r) {
                                                store = Ext.getStore('PerfilEstudiantesStore');
                                                record = store.getAt(0);
                                                record.set('foto', r.foto);
                                                record.set('mime', r.mime);
                                            },
                                            apply   : function (me) {
                                                var
                                                    me      = Admin.getApplication(),
                                                    store   = Ext.getStore('PerfilEstudiantesStore'),
                                                    mv      = me.getMainView().down('#imgUser'),
                                                    record  = store.getAt(0),
                                                    foto    = record.get('foto'),
                                                    mime    = record.get('mime'),
                                                    gb      = globales.General.dataDocente;
                                                store.sync();
                                                mv.setSrc(foto);
                                                gb.foto = foto;
                                                gb.mime = mime;
                                            },
                                            cancel  : function (me) {
                                                var
                                                    me      = Admin.getApplication(),
                                                    store   = Ext.getStore('PerfilEstudiantesStore'),
                                                    mv      = me.getMainView().down('#imgUser'),
                                                    gb      = globales.General.dataDocente;
                                                store.rejectChanges();
                                                mv.setSrc(gb.foto);
                                            }
                                        }
                                    });
                                    win.show();
                                    me.onMsgClose();
                                });

                            }
                        }
                    }
                },
                {
                    xtype   : 'tbtext',
                    cls     : 'top-user-name',
                    itemId  :'btnUser',
                    text    : '¿--?'
                }
            ],
            dockedItems: [
                {
                    xtype	: 'toolbar',
                    cls     : 'color-tool',
                    dock	: 'bottom',
                    items   : [
                        {
                            iconCls :'x-fa fa-sign-out',
                            ui      : 'header',
                            itemId  : 'btnEditProfile',
                            text    : 'Perfil',
                            handler : 'onViewPerfil'
                        },'->',
                        {
                            iconCls :'x-fa fa-sign-out',
                            ui      : 'header-red',
                            itemId  : 'btnUserClose',
                            handler : 'onCloseSesion',
                            text    : 'Salir'
                        }
                    ]
                }
            ]
        }
    ],
    listeners : {
        afterrender: function (win) {
            me = globales.General;
            data = me.DbConfig;
            foto = data.foto;
            mime = data.mime;
            sexo = data.sexo;
            nUser= data.nombre1+' '+data.nombre2+' '+data.apellido1+' '+data.apellido2;
            avatarImg = win.down('#imgUser');

            avatarEmpty = sexo === "M" ? me.avatarMan : me.avatarWomen;

            win.down('#btnUser').setText(nUser);

            if (Ext.isEmpty(foto)) {
                avatarImg.setSrc(avatarEmpty);
            } else {
                imgUrl = foto;
                avatarImg.setSrc(imgUrl);
            }
        }
    }
});