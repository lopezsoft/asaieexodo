/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.configuraciones.GradosPeriodosView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
    alias       : 'widget.gradosPeriodosView',
    maxHeight	: 200,
    reloadStore: true,
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Niveles agrupados - '+ Global.getYear());
    },
    store       : 'PeriodosStore',
    items       : [
        {
            xtype   : 'customform',
            items: [
				{
					xtype		: 'CbGradosAgrupados',
					labelAlign  : 'top'
				}
            ]
        }
    ]
});
