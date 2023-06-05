Ext.define('Admin.view.academico.NotasSaveView',{
     extend : 'Admin.base.WindowCrud',
     alias 	  : 'widget.NotasSaveView',
     closable : false,
	 requires: [
         'Admin.view.academico.controller.NotasController',
		 'Admin.store.general.NotasAcademicasStore'
	 ],
    controller  : 'Notas',
	maximized	: true,
	maximizable : false,
	items: [
    	{
        	xtype 			: 'customform',
        	bodyPadding		: 0,
        	layout			: 'fit',
        	defaults: {
			    anchor : '100%'
			},
    		items : [

			],
		  	dockedItems: [
			  {
		        xtype		: 'customToolbar',
		        defaultType : 'customButton',
		        items: [
					{
						tooltip 	: 'Guardar los cambios',
						itemId		: 'btnSave',
						iconCls		: 'x-fa fa-floppy-o',
						disabled 	: true,
						handler		: 'onClickSave'
					},'-',
					{
						tooltip 	: 'Calcular',
						itemId		: 'btnCalcular',
						iconCls		: 'x-fa fa-calculator',
						disabled 	: true,
						ui			:'soft-purple',
						handler		: 'onClickCalcular'
					},'-',
					{
						xtype: 'deletebutton',
						disabled 	: false
					}
					,'->','-',
                    {
                        tooltip 	: 'Deshacer, cancelar los cambios',
                        itemId		: 'btnUndo',
                        iconCls		: 'x-fa fa-undo',
                        disabled 	: true,
                        ui			:'soft-green',
						handler		: 'onClickUndo'
                    },'-',
					{
						xtype : 'facebookButton'
					},
					{
						xtype	: 'youtubeButton'
					},
					'-',
			        {
			            xtype		: 'closebutton',
						iconAlign	: 'left',
						handler		: 'onClickClose'
			        }
				]
			  }
		  ]
        }
    ]
});
