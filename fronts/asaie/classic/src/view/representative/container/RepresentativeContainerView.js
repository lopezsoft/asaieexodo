Ext.define('Admin.view.representative.RepresentativeContainerView',{
    extend  	: 'Ext.container.Container',
    controller  : 'representative',
    alias   	: 'widget.representativeContainerView',
    layout		: 'responsivecolumn',
	initComponent: function () {
		const { isSecretary } = AuthToken.profileSettings();
		this.items   = [
			{
				xtype   : 'containerButton',
				disabled: isSecretary,
				hidden	: isSecretary,
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
				disabled: isSecretary,
				hidden	: isSecretary,
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
				disabled: isSecretary,
				hidden	: isSecretary,
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
				disabled: isSecretary,
				hidden	: isSecretary,
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
				disabled: isSecretary,
				hidden	: isSecretary,
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
				disabled: isSecretary,
				hidden	: isSecretary,
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
		];
		this.callParent(arguments);
	}
});
