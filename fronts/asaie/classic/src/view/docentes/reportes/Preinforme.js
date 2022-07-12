Ext.define('Admin.view.docentes.reportes.Preinforme',{
    extend  	: 'Admin.base.CustomWindow',
    alias   	: 'widget.preinforme',
    xtype   	: 'preinforme',
    items   : [
        {
            xtype   		: 'customgrid',
            store   		: 'PreinformeStore',
            forceFit		: true,
            deferRowRender  : true,
            plugins		: [
                {
                  ptype     : 'gridfilters'
                },
                {
                    ptype       	: 'cellediting',
                    clicksToEdit	: 1,
                    default     	: 'textfield'
                },
                {
                    ptype           : 'selectionreplicator'
                },
                {
                    ptype           : 'clipboard'
                },
				{
					ptype			: 'gridSearch',
					readonlyIndexes	: ['note'],
					disableIndexes	: ['pctChange'],
					mode            : 'local',
					flex			: 1,
					autoFocus		: false,
					independent		: true
				}
            ],
            selModel: {
                type            : 'spreadsheet',
                checkboxSelect  : true,
                extensible      : true
            },
            columns : [
                {
                    xtype   : 'rownumberer'
                },
				{
					text		: 'P',
					dataIndex	: 'periodo',
					width		: 35,
					readOnly	: true
				},
				{
					text         : 'ESTUDIANTES',
					dataIndex    : 'estudiante',
					width		: 300,
					readOnly	: true
				},
				{
					text		: 'Nota',
					width		: 65,
					dataIndex	: 'final'
				},
				{
					text		: 'OBSERVACIÓN',
					dataIndex	: 'obs',
					flex		: 2,
					editor		: {
						xtype			: 'textfield',
						selectOnFocus 	: true
					}
				}

            ],
             dockedItems : [
				 {
					 xtype 		: 'pagination',
					 itemId		: 'pToolbar',
					 items 		: [
						 {
							 xtype		: 'exportButton'
						 }
					 ]
				 },
                 {
                     xtype  : 'toolbar',
                     items  : [
                     	,'->',
                         {
                             xtype  	: 'saveButton',
							 disabled 	: false,
							 itemId		: 'btnSavePre',
                             handler    : function (btn) {
								 var
									 me		= Admin.getApplication(),
									 store	= Ext.getStore('PreinformeStore'),
									 mod	= store.getModifiedRecords();
								 if(mod.length > 0){
									 store.sync({
										 callback	: function (res, req) {
											 me.showResult('Se han guardado los cambios.');
										 }
									 });
								 }
							 }
                         },'-',
						 {
						 	 xtype		: 'undoButton',
							 disabled 	: false,
							 handler	: function (btn) {
								 var
									 me		= Admin.getApplication(),
									 store	= Ext.getStore('PreinformeStore'),
								 	 mod	= store.getModifiedRecords();
								 if(mod.length > 0){
									 store.rejectChanges();
									 me.showResult('Se deshacieron los cambios.');
								 }
							 }
						 },'-',
						 {
						 	xtype	: 'closebutton'
						 }
                     ]
                 }
             ]
        }
    ]
});
