/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.configuraciones.NivelesAcademicosListView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
    alias       : 'widget.nivelesAcademicosListView',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Niveles académicos - '+ Global.getYear());
    },
    maxHeight	    : 200,
    maxWidth        : 450,
    reloadStore     : true, 
    store           : 'GradosStore',
    items       : [
        {
            xtype   : 'customform',
            items: [
				{
					xtype		: 'CbNivelAcademico',
					labelAlign  : 'top'
				}
            ]
        }
    ]
});
