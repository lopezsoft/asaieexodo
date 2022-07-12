Ext.define('Admin.view.representative.WhiteVoteView',{
    extend  	: 'Admin.base.SaveWindow',
    alias   	: 'widget.whitevoteview',
    controller  : 'representative',
    title       : 'Candidatos',
    maxHeight   : 180,
	store   	: 'CandidatesStore',
	defaultFocus	: 'cbcandidacies',
    items       : [
        {
            xtype   		: 'customform',
			defaultFocus	: 'cbcandidacies',
            items   : [
                {
                    xtype       : 'cbcandidacies',
                }
            ]
        }
    ],
	afterSave	: function() {
		const store	= Ext.getStore('CandidatesStore');
		store.reload();
	}
});
