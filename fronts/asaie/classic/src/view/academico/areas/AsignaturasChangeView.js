/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.academico.AsignaturasChangeView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'academico',
    alias       : 'widget.AsignaturasChangeView',
	requires	: [
		'Admin.store.general.AreasAsignaturaYearStore'
	],
	height: 550,
	store		: 'AreasAsignaturaYearStore',
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle(AppLang.getSTitleViewSubjects() + ' - ' + Global.getYear());
	},
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
			iconCls     : '',
			selModel	: 'rowmodel',
			store: 'AreasAsignaturaYearStore',
			columns: [
				{
					xtype: 'customrownumberer'
				},
				{
					text: 'Área',
					dataIndex: 'area',
					width: 300,
					filter: 'list'
				},
				{
					text: 'Asignatura',
					dataIndex: 'asignatura',
					width: 300,
					filter: 'string'
				},
				{
					text: 'Año',
					dataIndex: 'year',
					width: 65
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
		let subject = {
			id_asig		: rec.subject_id,
			asignatura	: rec.get('asignatura')
		}
		record.set(subject);
		me.close();
	}
});
