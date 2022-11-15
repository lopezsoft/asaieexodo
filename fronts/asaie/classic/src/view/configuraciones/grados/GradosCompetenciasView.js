/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.configuraciones.GradosCompetenciasView',{
    extend  : 'Admin.base.WindowCrud',
    title   : 'Niveles agrupados',
    controller  : 'configuraciones',
    alias       : 'widget.gradosCompetenciasView',
	initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Grupo de grados académicos - '+ Global.getYear());
    },
    store       : 'DimensionesStore',
	reloadStore	: true,
    maxHeight	: 200,
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
