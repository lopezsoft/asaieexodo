Ext.define('Admin.view.academico.AreasAsignaturasView' ,{
    extend	: 'Admin.base.WindowCrud',
    alias 	: 'widget.areasAsignaturasView',
	maximized	: false,
    controller: 'academico',
    maxWidth: 550,
    maxHeight: 250,
    closeAction: 'hide',
    config  : {
        record : null
    },
    reloadStore : true,
    store: 'AreasAsignaturaStore',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewAreas());
    },
    items : [
    	{
			xtype		: 'customform',
			items	: [
				{
                    xtype: 'CbAreas',
                    name: 'id_area'
                },
                {
                    xtype: 'yearField',
                    name: 'year'
                }
			]
		}		    
	]
});