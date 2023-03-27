Ext.define('Admin.view.academico.AsignaturasAddCursoView' ,{
    extend		: 'Admin.base.WindowCrud',
    alias 		: 'widget.AsignaturasAddCursoView',
    width		: 750,
	maximized	: false,
	controller	: 'academico',
    modal       : false,
    alwaysOnTop: true,
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewSubjects() + ' - ' + Global.getYear());
    },
	height		: '100%',
    items   : [{
        xtype       : 'customgrid',
        plugins		: [
            {
                ptype : 'gridfilters'
            },
            {
                ptype : 'responsive'
            },
            {
                ptype			: 'gridSearch',
                readonlyIndexes	: ['note'],
                disableIndexes	: ['pctChange'],
                minChars		: 3,
                flex			: 1,
                autoFocus		: true,
                independent		: true
            }
        ],
        iconCls     : '',
        store: 'AreasAsignaturaYearStore',
        columns     : [
            {
                xtype   : 'customrownumberer'
            },
            {
                text        : 'Área',
                dataIndex   : 'area',
                flex       	: 1,
                filter      : 'list'
            },
            {
                text        : 'Asignatura',
                dataIndex   : 'asignatura',
                flex 		: 1,
                filter      : 'string'
            },
            {
                text        : 'Año',
                dataIndex   : 'year',
                width       : 65
            }
        ],
        dockedItems : [
            {
                xtype   : 'customToolbar',
                items   :[
                    {
                        xtype   : 'addButton',
                        text	: 'Agregar asignaturas',
                        tooltip	: 'Haga Click para agregar las asignaturas seleccionadas',
                        iconAlign	: 'left',
                        handler : function (btn) {
							var 
								ts			= btn.up('window'),
								win 		= btn.up('grid'),
                                selectAsig  = win.getSelection(),
                                selectGrado = ts.getRecord(),
                                me		    = Admin.getApplication(),
                                cCount	    = 0,
                                store       = Ext.getStore('MatCursoStore');

							let cCountLog;
							let data;
							if (!Ext.isEmpty(selectGrado)) {
								if (selectAsig.length > 0) {
									win.el.mask('Guardando…', 'x-mask-loading');
									const {school} 	= AuthToken.recoverParams();
									const dt		= new Date()
									const year		= school.year || dt.getFullYear();
									for (cCount = 0; cCount < selectGrado.length; cCount++) {
										cCountLog = 0;
										for (cCountLog = 0; cCountLog < selectAsig.length; cCountLog++) {
											data = {
												id_grado: selectGrado[cCount].get('id'),
												id_asig: selectAsig[cCountLog].get('id_asign'),
												ih: 1,
												estado: true,
												year: year
											};
											store.insert(0, data);
										}
									}
									store.sync({
										success: function () {
											win.el.unmask();
											me.showResult('Se guardaron los datos correctamente');
											store.reload();
										},
										failure: function () {
											me.showResult('No se guardaron los datos correctamente');
											store.reload();
											win.el.unmask();
										}
									});
								} else {
									me.showResult('Debe seleccionar al menos una asignatura para guardar.');
								}
							} else {
								me.showResult('Para realizar esta operación debe seleccionar al menos un grado.');
							}
                        }
                    },'->',
                    {
                        xtype   : 'closebutton'
                    }
                ]
            },
            {
                xtype 		: 'pagination',
                itemId		: 'pToolbar'
            }
        ]
    }]
});
