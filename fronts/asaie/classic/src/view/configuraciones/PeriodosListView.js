/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */

var
    defaultEditor   = {
		xtype			: 'textfield',
        allowBlank		: false,
        selectOnFocus 	: true,
        emptyText		: '00.00',
        maskRe			: /[\d\.]/
    },
    editor  = {
		xtype			: 'textfield',
        allowBlank		: false,
        selectOnFocus 	: true
    };

Ext.define('Admin.view.configuraciones.PeriodosListView',{
    extend  : 'Admin.base.WindowCrud',
    title   : 'Periódos académicos',
    controller  : 'configuraciones',
    alias       : 'widget.PeriodosListView',
    height	    : 450,
    width       : '100%',
    items       : [
        {
            xtype   : 'customform',
            layout	: 'fit',
            items: [
                {
                    xtype       : 'customgrid',
                    columnLines : true,
                    store       : 'PeriodosStore',
                    iconCls     : '',
                    plugins: [
                        {
                            ptype           : 'gridfilters'
                        }
                    ],
                    columns : [
                        {
                            xtype   : 'customrownumberer'
                        },
                        {
                            dataIndex   : 'periodo',
                            text        : 'Periodo',
                            editor      : editor,
							width       : 75
                        },
                        {
                            dataIndex   : 'descripcion_periodo',
                            text        : 'Descripción del periodo',
                            editor      : editor,
                            width       : 180
                        },
						{
							text	: 'Fechas del periodo',
							columns	: [
								{
									dataIndex   : 'fecha_inical',
									text        : 'Inicio',
									emptyCellText	: '0000-00-00',
									renderer		: Ext.util.Format.dateRenderer('Y-m-d'),
									field: {
										xtype: 'datefield',
										format: 'Y-m-d'
									},
									width       : 100
								},
								{
									dataIndex   : 'fecha_cierre',
									text        : 'Corte',
									emptyCellText	: '0000-00-00',
									renderer		: Ext.util.Format.dateRenderer('Y-m-d'),
									field: {
										xtype: 'datefield',
										format: 'Y-m-d'
									},
									width       : 100
								}
							]
						},
						{
							text	: 'Fechas de nivelación',
							columns : [
								{
									dataIndex: 'fecha_inical_nivelacion',
									text: 'Inicio',
									emptyCellText: '0000-00-00',
									renderer: Ext.util.Format.dateRenderer('Y-m-d'),
									field: {
										xtype: 'datefield',
										format: 'Y-m-d'
									},
									width: 100
								},
								{
									dataIndex: 'fecha_cierre_nivelacion',
									text: 'Corte',
									width: 100,
									emptyCellText: '0000-00-00',
									renderer: Ext.util.Format.dateRenderer('Y-m-d'),
									field: {
										xtype: 'datefield',
										format: 'Y-m-d'
									}
								}
							]
						},
                        {
                            text        : 'Porcentaje',
                            dataIndex   : 'porciento',
							editor      : defaultEditor,
                            width       : 100
                        },
						{
							xtype       : 'checkcolumn',
							text        : 'Bloquear',
							dataIndex   : 'bloquear',
							width       : 90,
							listeners   : {
								beforecheckchange : function (col, rowIndex, checked, record ,e ,eOpts ) {
									var
										me          = Admin.getApplication(),
										oldValue    = record.get('bloquear'),
										store       = Ext.getStore('PeriodosStore'),
										win     	= Ext.ComponentQuery.query('PeriodosView')[0];
									if (oldValue){
										store.rejectChanges();
										return false;
									}else{
										Ext.Msg.show({
											title	: 'Bloquear periodo.',
											message	: 'Si bloquea el periodo, luego no podrá modificar ninguna información en el. ¿Desea continuar con la opetación?',
											buttons	: Ext.Msg.YESNO,
											icon	: Ext.Msg.QUESTION,
											fn: function(btn) {
												if (btn === 'yes') {
													record.set('bloquear',1);
													store.sync();
												}else{
													store.rejectChanges();
												}
											}
										});
									}
								}
							}
						},
						{
							dataIndex   : 'año',
							text        : 'Año',
							width		: 60
						},
						{
							xtype       : 'checkcolumn',
							text        : 'Activo',
							dataIndex   : 'estado',
							width       : 70
						}
                    ]
                }
            ],
            dockedItems: [
                {
                    xtype		: 'toolbarSave',
                    items 	: [
                        {
                            xtype	: 'facebookButton'
                        },
                        {
                            xtype	: 'youtubeButton'
                        },
                        '->',
                        {
                            xtype	: 'closebutton',
                            itemId	: 'btnUndo',
                            iconAlign	: 'left'
                        }
                    ]
                }
            ]
        }
    ]
});
