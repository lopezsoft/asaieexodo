/**
 * Created by LOPEZSOFT on 18/05/2016.
 */
Ext.define('Admin.view.docentes.perfil.PefilMenuDocentesView',{
    extend  : 'Admin.base.WinMenu',
    alias   : 'widget.PefilMenuDocentesView',
    controller  : 'docentes',
    maxHeight   : 220,
    maxWidth    : 250,
    items       : [
        {
            xtype   : 'FormBase',
            items   : [
                {
                    xtype   : 'image',
                    cls     : 'width-button-large circular',
                    height  : 128,
                    width   : 128,
                    alt     :'Imagen del docente',
                    itemId  : 'imgUser',
                    imgCls  : 'avatar-background avatar-perfil',
                    title   : 'Imagen  del perfil',
                    listeners: {
                        el: {
                            click : function (e) {
                                var me  = Admin.getApplication();
                                me.onMsgWait();
                                Ext.require([
                                    'Admin.view.docs.FilesView',
                                    'Admin.store.docentes.perfil.PerfilDocentesStore'
                                ]);
                                Ext.onReady(function () {
                                    me.onStore('docs.ImageBrowserStore');
                                    me.onStore('docentes.perfil.PerfilDocentesStore');
                                    storeX = Ext.getStore('PerfilDocentesStore');
                                    storeX.load();
                                    var win = Ext.create({
                                        xtype       : 'FilesView',
                                        title       : 'Seleccionar foto de Perfil del docente',
                                        pathReadFile    : 'c_docentes/read_images',
                                        pathUploadFile  : 'c_docentes/upload_foto',
                                        titlePanelLoad  : 'Subir foto',
                                        titlePanelView  : 'Mis fotos',
                                        textButtonLoad  : 'Seleccionar una foto en el equipo',
                                        textButtonApply : 'Establecer como foto de perfil',
                                        listeners : {
                                            afterselect : function (me, r) {
                                                store = Ext.getStore('PerfilDocentesStore');
                                                record = store.getAt(0);
                                                record.set('foto', r.get('path_set'));
                                                record.set('mime', r.get('mime'));
                                            },
                                            afterupload : function (me, r) {
                                                store = Ext.getStore('PerfilDocentesStore');
                                                record = store.getAt(0);
                                                record.set('foto', r.foto);
                                                record.set('mime', r.mime);
                                            },
                                            apply   : function (me) {
                                                var
                                                    me      = Admin.getApplication(),
                                                    store   = Ext.getStore('PerfilDocentesStore'),
                                                    mv      = me.getMainView().down('#imgUser'),
                                                    record  = store.getAt(0),
                                                    foto    = record.get('foto'),
                                                    mime    = record.get('mime'),
                                                    gb      = SME.ConfigApp.dataDocente;
                                                store.sync();
                                                mv.setSrc(foto);
                                                gb.foto = foto;
                                                gb.mime = mime;
                                            },
                                            cancel  : function (me) {
                                                var
                                                    me      = Admin.getApplication(),
                                                    store   = Ext.getStore('PerfilDocentesStore'),
                                                    mv      = me.getMainView().down('#imgUser'),
                                                    gb      = SME.ConfigApp.dataDocente;
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
                        }, '->',
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
            me = SME.ConfigApp;
            data = me.dataDocente;
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
