Ext.define('Admin.view.academico.DocentesChangeView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'academico',
    alias       : 'widget.DocentesChangeView',
	requires	: [
		'Admin.store.admin.DocentesDirGrupoStore'
	],
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle(AppLang.getSTitleViewTeachers() + ' - ' + Global.getYear());
	},
	height	    : 550,
	store		: 'DocentesDirGrupoStore',
    items       : [
        {
			xtype       : 'customgrid',
			plugins		: [
				{
					ptype : 'responsive'
				},
				{
					ptype			: 'gridSearch',
					readonlyIndexes	: ['note'],
					disableIndexes	: ['pctChange'],
					minChars		: 1,
					mode            : 'local',
					flex			: 1,
					autoFocus		: true,
					independent		: true
				}
			],
			selModel	: 'rowmodel',
			store   	: 'DocentesDirGrupoStore',
			columns: [
				{
					xtype		: 'customrownumberer'
				},
				{
					text        : 'Docentes',
					dataIndex   : 'nombres',
					flex        : 1,
					filter  	: 'string'
				}
			],
			dockedItems: [
				{
					xtype		: 'toolbarSave'
				},
				{
					xtype 		: 'pagination',
					itemId		: 'pToolbar'
				}
			]
        }
	],
	saveData	: function(storeName,reload){
		let me		= this,
			record	= me.getRecord(),
			rec		= me.down('grid').getSelection()[0];

		docente	= {
			id_docente	: rec.id,
			docente		: rec.get('nombres')
		}
		record.set(docente);
		me.close();
	}
});
