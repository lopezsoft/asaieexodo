/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.configuraciones.GradosEscalaView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
    alias       : 'widget.GradosEscalaView',
    maxHeight	: 200,
    store       : 'EscalaStore',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Grupo de grados - '+ Global.getYear());
    },
    reloadStore : true,
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
