Ext.define('Admin.view.estudiantes.StudentNotes',{
    extend 	: 'Admin.panel.Panel',
    alias 	: 'widget.studentnotes',
	requires: [
		'Ext.ux.layout.ResponsiveColumn',
		'Admin.store.estudiantes.NotasEstudiantesStore'
	],
	controller 	: 'estudiantes',
	layout		: 'fit',
	initComponent: function(){
		Admin.getApplication().onStore('estudiantes.NotasEstudiantesStore');
		this.callParent(arguments);
		this.setTitle('Lista de notas');
	},
	items		: [
		{
			xtype 			: 'customform',
			showSaveButton	: false
		}
	],
	tbar : [
		'->',
		{
			xtype	: 'customButton',
			iconCls	: 'x-fa fa-eye',
			text	: 'Ver notas',
			handler	: 'viewNotes'
		}
	]
});