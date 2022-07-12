Ext.define('Admin.view.admin.forms.SaveGroupManagers' ,{
    extend	: 'Admin.base.SaveWindow',
    alias 	: 'widget.savegroupmanagers',
	controller	: 'admin',
	requires	: [
		'Admin.store.admin.DocentesDirGrupoStore',
		'Admin.combo.CbGrados',
		'Admin.combo.CbGrupo',
		'Admin.container.SedesJorn'
	],
	maxWidth	: 550,
	initComponent: function (cnf) {  
		this.callParent(arguments);	
		this.setTitle(AppLang.getSTitleViewAddGroupDirectors());
	},
	onSave		: function(){
		this.onSaveData();
	},
	onSaveData	: function(){
		var win 	= this,
			values 	= win.down('grid').getSelection()[0],
			data 	= [],
			store 	= Ext.getStore('DirGrupoStore'),
			me 		= Admin.getApplication();

		if (Ext.isEmpty(values)) {
			me.onAler('No ha selecionado un docente.');
		}else{
			data = {
				id_sede		: win.down('#comboSedes').getSelection().id,
				id_docente	: values.get('id_docente'),
				id_grado	: win.down('#comboGrados').getSelection().id,
				grupo		: win.down('#comboGrupo').getSelection().data.grupo,
				id_jorn		: win.down('#comboJornadas').getSelection().data.cod_jorn,
				estado		: 1
			};
			store.insert(0, data);
			store.sync({
				callback: function (r) {
					me.showResult('Proceso terminado');
					store.reload();
				}
			});
		};
	},
	defaultFocus	: 'CbSedes',
    items : [
    	{
			xtype		: 'customform',
			items: [
				{
					xtype: 'sedesJorn',
					defaults	: {
						labelWidth      : 60
					}
				},
				{
					xtype			: 'CbGrupo',
					labelWidth      : 60
				},
				{
					xtype	: 'customgrid',
					selModel: 'rowmodel',
					plugins		: [
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
					store   : 'DocentesDirGrupoStore',
					columns: [
						{
							xtype		: 'customrownumberer'
						},
						{
							text        : 'DOCENTES',
							dataIndex   : 'nombres',
							flex        : 1,
							filter  	: 'string'
						}
					],
					dockedItems : [
						{
							xtype 		: 'pagination'
						}
					]
				}
			]
		}		    
	]
});
