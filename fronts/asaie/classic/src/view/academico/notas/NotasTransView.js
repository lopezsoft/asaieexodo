Ext.define('Admin.view.academico.NotasTransView',{
     extend : 'Admin.base.WindowCrud',
     alias 	  : 'widget.NotasTransView',
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
				{
					xtype   : 'customgrid',
					iconCls : '',
					flex		: 1,
					loadmask 	: true,
					store		: 'NotasAcademicasStore',
					plugins: [
						{
							ptype           : 'gridfilters'
						}
					],
					columns	:
						[
							{
								xtype       : 'rownumberer'
							},
							{
								text		: 'Asignaturas',
								dataIndex	: 'asignatura',
								width		: 300,
								locked   	: true,
								menuDisabled: true,
								sortable    : false
							},
							{
								text		: 'GRUPO',
								dataIndex	: 'grupo',
								width		: 70,
								locked   	: true,
								menuDisabled: true,
								sortable    : false
							},
							{
								text		: 'PER',
								dataIndex	: 'periodo',
								width		: 45,
								locked   	: true,
								menuDisabled: true,
								sortable    : false
							},
							{
									text 		: 'FINAL',
									dataIndex	: 'final',
									align		: 'right',
									width		: 80,
									menuDisabled: true,
									renderer :  function(val) {
										return '<span style="color:red;"> <b>' + val + '</b></span>'
									}
							},
							{
									text 		: 'Desempeño',
									width		: 100,
									menuDisabled: true,
									dataIndex	: 'nombre_escala',
									tooltip     : 'Escala de desempeño'
							},
							{
								text        : 'FALTAS',
								defaults    : {
									width       : 45,
									align		: 'center',
									menuDisabled: true,
									sortable 	: true
								},
								columns : [
									{
										text 	    : 'J',
										dataIndex	: 'faltas',
										tooltip     : 'Ingrese las faltas Justifcadas'
									},
									{
										text 	    : 'I',
										dataIndex	: 'injustificadas',
										tooltip     : 'Ingrese las faltas Injustifcadas'
									},
									{
										text 	    : 'R',
										dataIndex	: 'retraso',
										tooltip     : 'Ingrese las faltas por llegada tarde a clase'
									}
								]
							}
					]
				}
			],
		  	dockedItems: [
			  {
		        xtype		: 'customToolbar',
		        defaultType : 'customButton',
		        items: [
					'->',
					{
						tooltip 	: 'Guardar los cambios',
						itemId		: 'btnSave',
						iconCls		: 'x-fa fa-floppy-o',
						handler		: 'onClickTans'
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
