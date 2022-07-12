Ext.define('Admin.view.representative.RepresentativeStudentsContainerView',{
    extend  	: 'Ext.container.Container',
    controller  : 'representative',
    alias   	: 'widget.representativestudentscontainerview',
    layout		: 'responsivecolumn',
    items   : [
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Iniciar votación',
                    iconCls : 'x-fa fa-external-link',
                    handler : 'onStartVotingStudent'
                }
            ]
        },
    ]
});
