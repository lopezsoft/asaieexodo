Ext.define('Admin.view.representative.RepresentativeContainerView',{
    extend  	: 'Ext.container.Container',
    controller  : 'representative',
    alias   	: 'widget.representativeContainerView',
    layout		: 'responsivecolumn',
    items   : [
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Panel de control',
                    iconCls : 'x-fa fa-cog',
                    handler : 'onControlPanel'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Mesas de votación',
                    iconCls : 'x-fa fa-table',
                    tooltip : 'Mesas de votación',
                    handler : 'onPollingStations'
                }
            ]
        },
		{
			xtype   : 'containerButton',
			items   : [
				{
					xtype   : 'buttonPanel',
					text    : 'Candidaturas',
					iconCls : 'xi-candidates-24',
					handler : 'onCandidacies'
				}
			]
		},
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Candidatos',
                    iconCls : 'x-fa fa-users',
                    handler : 'onCandidates'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Voto en blanco',
                    iconCls : 'xi-blank_vote-24',
                    handler : 'onWhiteVote'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Iniciar jornada',
                    iconCls : 'x-fa fa-external-link',
                    handler : 'onStartVoting'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Reportes',
                    iconCls : 'x-fa fa-print',
                    handler : 'onPrint'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Resultados electorales',
                    iconCls : 'x-fa fa-print',
                    handler : 'onResults'
                }
            ]
        }
    ]
});
