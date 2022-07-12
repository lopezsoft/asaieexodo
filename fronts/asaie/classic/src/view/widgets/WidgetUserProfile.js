Ext.define('Admin.view.widgets.WidgetUserProfile', {
    extend  : 'Ext.panel.Panel',
    xtype   : 'WidgetUserProfile',
    cls     : 'admin-widget shadow',
    ui      : 'panel-white',
    initComponent   : function(){
        let me  = this,
            user= Global.getData().user_data[0],
            app = Admin.getApplication();
            app.onStore('docs.ImageBrowserStore');
            app.onStore('general.perfil.UserStore');
        me.items = [
            {
                xtype   : 'image',
                cls     : 'widget-top-container-first-img',
                height  : 72,
                width   : 72,
                alt     : 'profile-image',
                src     : (Ext.isEmpty(user.image)) ? Global.getAvatarUnknoun() : user.image,
                itemId  : 'ImgPerfil'
            },
            {
                xtype   : 'component',
                cls     : 'widget-top-first-container postion-class',
                height  : 135
            },
            {
                xtype   : 'container',
                cls     : 'widget-bottom-first-container postion-class',
                height  : 165,
                padding : '30 0 0 0',
                layout: {
                    type    : 'vbox',
                    align   : 'center'
                },
                items: [
                    {
                        xtype   : 'label',
                        cls     : 'widget-name-text',
                        html    : user.names + ' ' + user.last_name,
                        itemId  : 'labelName'
                    },
                    {
                        xtype   : 'toolbar',
                        cls     : 'widget-tool-button',
                        items   : [
                            {
                                ui: 'soft-purple',
                                iconCls: 'x-fa fa-book',
                                text: 'Imagen de perfil',
                                handler: function (btn) {
                                    var me = Admin.getApplication();
                                        storeX = Ext.getStore('UserStore');
                                        storeX.load();
                                        Ext.create({
                                            xtype           : 'FilesView',
                                            title           : 'Seleccionar foto de Perfil',
                                            pathReadFile    : 'general/read_images',
                                            pathUploadFile  : 'general/upload_foto',
                                            titlePanelLoad  : 'Subir foto',
                                            titlePanelView  : 'Mis fotos',
                                            textButtonLoad  : 'Seleccionar una foto en el equipo',
                                            textButtonApply : 'Establecer como foto de perfil',
                                            listeners: {
                                                afterselect: function (me, r) {
                                                    store   = Ext.getStore('UserStore');
                                                    record  = store.getAt(0);
                                                    record.set('image', r.get('path_set'));
                                                    record.set('mime', r.get('mime'));
                                                },
                                                afterupload: function (me, r) {
                                                    store   = Ext.getStore('UserStore');
                                                    record  = store.getAt(0);
                                                    record.set('image', r.image);
                                                    record.set('mime', r.mime);
                                                },
                                                cancel: function (me) {
                                                    var
                                                        me      = Admin.getApplication(),
                                                        store   = Ext.getStore('UserStore'),
                                                        mv      = me.getMainView().down('#ImgPerfil'),
                                                        mv2     = me.getMainView().down('#imgUser'),
                                                        gb      = Global.getData().user_data[0];
                                                    store.rejectChanges();
                                                    mv.setSrc(gb.image);
                                                    mv2.setSrc(gb.image);
                                                }
                                            }
                                        }).show().on('apply', (view) => {
                                            var
                                                me      = Admin.getApplication(),
                                                store   = Ext.getStore('UserStore'),
                                                mv      = me.getMainView().down('#ImgPerfil'),
                                                mv2     = me.getMainView().down('#imgUser'),
                                                record  = store.getAt(0),
                                                foto    = record.get('image'),
                                                mime    = record.get('mime'),
                                                gb      = Global.getData().user_data[0];
                                            store.sync();
                                            mv.setSrc(foto);
                                            mv2.setSrc(foto);
                                            gb.image = foto;
                                            gb.mime = mime;
                                            view.close();
                                        });
                                }
                            }
                        ]
                    }
                ]
            }
        ];

        me.callParent();
    }
});
