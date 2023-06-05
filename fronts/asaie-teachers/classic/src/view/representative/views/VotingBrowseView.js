var imageTpl = new Ext.XTemplate(
    '<p class="pm">Para votar <b>haga click sobre la foto</b> del candidato de su preferencia</p>',
    '<tpl for=".">',
        '<div class="thumb-rep-wrap">',
            '<span>{candidacy_name}</span>',
            '<div class="thumb-rep-{candidacy_id}">',
                '<img alt="{names}" src="{image}"/>',
                '<div class="frigth"><p class="ptop">{number}</p></div>',
            '</div>',
            '<span>{names}<br>{grado}-{group_name}</span>',
        '</div>',
    '</tpl>'
);

Ext.define('Admin.view.representative.VotingBrowseView', {
	id  			: 'img-chooser-view-v',
    extend  		: 'Ext.view.View',
    alias   		: 'widget.votingbrowseview',
    uses    		: 'Admin.store.representative.CandidatesStore',
    singleSelect    : false,
    overItemCls     : 'x-view-over',
    itemSelector    : 'div.thumb-rep-wrap',
    tpl             : imageTpl,
    store           : 'CandidatesStore',
    liveDrag        : true,
    items           : {
        xtype   : 'customButton',
        text    : 'Ejemplo'
    },
    initComponent: function() {
        this.callParent(arguments);
    }
});
