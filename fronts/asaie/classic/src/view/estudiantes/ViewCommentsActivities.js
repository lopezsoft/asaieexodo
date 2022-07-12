Ext.define('Admin.view.estudiantes.ViewCommentsActivities', {
    extend      : 'Ext.grid.Panel',
    alias       : 'widget.viewcommentsactivities',
    itemId      : 'news',
    cls         : 'company-news-grid',
    ui          : 'panel-white',
    requires: [
        'Ext.grid.plugin.RowExpander'
    ],


    controller  : 'news',
    autoLoad    : true,

    hideHeaders : true,
    store       : 'CommentsActivitiesStore',

    columns: [{
        dataIndex   : 'comment_title',
        flex        : 1,
        renderer    : 'renderTitleColumn'
    }],
    dockedItems: [
		{
            xtype 		: 'pagination',
            dock        : 'top'
		}
    ],
    viewModel: {
        data: {
            expanded: true
        }
    },
    viewConfig: {
        trackOver: false,
        stripeRows: false,
        listeners: {
            itemclick       : 'onCompanyClick',
            expandbody      : 'onCompanyExpandBody',
            collapsebody    : 'onCompanyCollapseBody'
        }
    },

    plugins: [{
        ptype   : 'ux-rowexpander',
        id      : 'rowexpander'
    }],

    // This XTemplate is used by the controller to format the title column.
    titleTpl:
        '<div class="text-wrapper">' +
            '<div class="news-icon forum">&nbsp;</div>' +
            '<div class="news-data">' +
                '<div class="news-picture"><img src="'+ Global.getAvatarUnknoun() +'"></div>' +
                '<div class="news-content">' +
                    '<div class="news-title">{comment_title}</div>' +
                    '<div class="news-small"><span class="news-author">{[values.type_comment == 2 ? "ESTUDIANTE: " + values.estudiante : "DOCENTE: " + values.docente]}</span>' +
                    '<img src="resources/icons/cal-icon.png"/>{date}' +
                    '<img src="resources/icons/clock-icon.png"/>{time}' +
                    "<a href='{url_attached}' class = '{[values.url_attached == '' ?  'a-blank' : '' ]}' target='_blank'>"+
                    '<img src="resources/icons/download-small.png"/>··..··</a></div>'+
                    '<div class="news-paragraph news-paragraph-simple">{comment_activity}</div>' +
                    // '<div class="news-paragraph news-paragraph-simple" {expanded}>{comment_activity:ellipsis(100, true)}</div>' +
                    // '<div class="news-toggle expand" {expanded}><span>EXPAND</span>' +
                    // '<img src="resources/icons/expand-news.png"></div>' +
                '</div>' +
            '</div>' +
        '<div>',
});
