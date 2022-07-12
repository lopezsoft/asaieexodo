/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.configuraciones.EscalaNacionalInView',{
    extend      : 'Admin.base.WindowCrud',
    title       : 'Escala nacional',
    alias       : 'widget.EscalaNacionalInView',
    maxHeight	: 200,
    store       : 'EscalaStore',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Escala nacional - '+ Global.getYear());
    },
    reloadStore : true,
    items       : [
        {
            xtype   : 'customform',
            items: [
				{
					xtype		: 'CbEscalaNacional',
					labelAlign  : 'top'
				}
            ]
        }
    ]
});
