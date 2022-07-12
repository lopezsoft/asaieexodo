/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.promocion.PromovidosView',{
    extend      : 'Admin.base.WindowCrud',
    controller  : 'Promocion',
    alias       : 'widget.promovidos',
    xtype       : 'promovidos',
    itemId      : 'promovidos',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Promovidos - '+ Global.getYear());
    },
    store   : 'PromotedObservationStore',
    items       : [
        {
            xtype   : 'customcontainer',
            layout: {
                type    : 'hbox',
                align   : 'stretch'
            },
            items   : [
                {
                    xtype       : 'customgrid',
                    store       : 'PromovidosStore',
                    margin      : 4,
                    minWidth    : 500,
                    title       : 'CONSULTA',
                    plugins: [
                        {
                            ptype: 'rowexpander',
                            rowBodyTpl: new Ext.XTemplate(
                                '<p><b>Apellidos y Nombres:</b> {nombres}</p>'
                            )
                        },
                        {
                            ptype			: 'gridSearch',
                            readonlyIndexes	: ['note'],
                            disableIndexes	: ['pctChange'],
                            minChars		: 1,
                            mode            : 'local',
                            flex			: 1,
                            autoFocus		: false,
                            independent		: true
                        }
                    ],
                    listeners : {
                        'selectionchange': function(gr, selected, eOpts) {
                            var me      = this.up('window'),
                                form    = me.down('#frmDatos'),
                                app     = Admin.getApplication(),
                                store   = Ext.getStore('PromotedObservationStore'),
                                record  = selected[0];
                            me.mask();
                            if (selected.length > 0){
                                param   = {
                                    where       : '{"promoted_id":' + record.get('id') + '}',
                                    pdbTable    : 'promoted_observation'
                                };
                                app.setParamStore('PromotedObservationStore',param,false);
                                store.reload({
                                    callback : function (res) {
                                        if (res.length > 0){
                                            form.loadRecord(res[0]);
                                        }else{
                                            form.reset();
                                        }
                                        form.setDisabled(!res.length);
                                        me.unmask();
                                    }
                                });
                            }else {
                                form.reset();
                                form.setDisabled(!selected.length);
                                me.unmask();
                            }
                        }
                    },
                    columns: [
                        {
                            xtype: 'rownumberer'
                        },
                        {
                            text: 'Apellidos y Nombres',
                            dataIndex: 'nombres',
                            width: 290
                        },
                        {
                            text: 'Grado',
                            dataIndex: 'grado',
                            width: 100
                        },
                        {
                            text: 'Grupo',
                            dataIndex: 'group_id',
                            width: 60
                        },
                        {
                            text: 'Jornada',
                            dataIndex: 'jornada',
                            width: 120
                        },
                        {
                            text: 'Sede',
                            dataIndex: 'sede',
                            width: 190
                        }
                    ],
                    dockedItems: [
                        {
                            xtype: 'toolbarCrud',
                            items: [
                                '->',
                                {
                                    xtype		: 'printButton'
                                },
                                '-',
                                {
                                    xtype       : 'closebutton'
                                }
                            ]
                        },
                        {
                            xtype: 'pagination'
                        }
                    ]
                },
                {
                    xtype   : 'customform',
                    flex    : 3,
                    itemId  : 'frmDatos',
                    items   : [
                        {
                            xtype   : 'fieldset',
                            title   : 'ENCABEZADO',
                            defaultType : 'customhtmleditor',
                            items   : [
                                {
                                   name     : 'titulo'
                                },
                                {
                                    name    : 'res'
                                },
                                {
                                    name    : 'encabezado'
                                },
                                {
                                    name    : 'consta',
                                    height  : 120
                                }
                            ]
                        },
                        {
                            xtype       : 'fieldset',
                            title       : 'CUERPO',
                            defaultType : 'customhtmleditor',
                            items   : [
                                {
                                    name : 'cuerpo'
                                },
                                {
                                    name : 'firma'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    saveData	: function(storeName,reload){
		var me 		= this.getApp(),
			win		= this,
			form    = win.down('form'),
			record  = form.getRecord(),
			values  = form.getValues(),
			store   = Ext.getStore(storeName);
		if (record) { //Edición
			if (store.getModifiedRecords().length > 0) {
				win.mask('Guardando...');
			}
			record.set(values);
			store.sync({
				success : function(batch, o) {
					me.showResult('Se han guardado los datos');
					win.unmask();
					if (reload == true){
						store.reload();
					}
				},
				failure	: function (re) {
					win.unmask();
					store.rejectChanges();
				}
			});
		}else{ // Insertar
			win.mask('Guardando...');
			store.insert(0,values);
			store.sync({
				success : function(batch, o){
					me.showResult('Se han guardado los datos');
					win.unmask();
					if (reload == true){
						store.reload();
					}
				},
				failure	: function (re) {
					store.rejectChanges();
					win.unmask();
				}
			});
		};
	}
});
