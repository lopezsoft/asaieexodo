Ext.define('Admin.view.home.Dashboard', {
    extend: 'Ext.container.Container',
    requires: [
        'Ext.ux.layout.ResponsiveColumn',
        'Ext.chart.grid.HorizontalGrid3D',
        'Ext.chart.grid.VerticalGrid3D',
        'Ext.chart.series.Bar3D',
        'Ext.chart.axis.Category3D',
        'Ext.chart.axis.Numeric3D',
        'Ext.chart.interactions.ItemHighlight'
    ],
    xtype: 'admindashboard',

    layout: 'responsivecolumn',

    alias       : 'widget.admindashboard',
    reference   : 'admindashboard',

    defaults: {
        xtype: 'container',
        animation: !Ext.isIE9m && Ext.os.is.Desktop
    },
    items   : [
    ],
    listeners : {
        afterRender : function(o, e){
			const url = Global.getApiUrl() + '/school/statistics/students-enrolled';
			Ext.Ajax.request({
                url		: url,
				method	: 'GET',
				headers	: Global.getHeaders(),
				params: {
					...Global.getSchoolParams()
				},
                success: function (response) {
					const data = Ext.decode(response.responseText),
						me = Admin.getApplication();
					me.onStore('charts.RegisteredStore');
                    me.onStore('charts.RetiredStore');
                    me.onStore('charts.TeachersStore');
                    o.removeAll(true);
					let items = [
						{
							xtype: 'widget-e',
							containerColor: 'cornflower-blue',
							userCls: 'big-33 small-50',
							itemId: 'registered',
							data: {
								amount: data.registered,
								type: AppLang.getSTitleStudentRegistered(),
								icon: 'user-graduate'
							}
						},
						{
							xtype: 'widget-e',
							itemId: 'retired',
							containerColor: 'green',
							userCls: 'big-33 small-50',
							data: {
								amount: data.retired,
								type: AppLang.getSTitleStudentRetired(),
								icon: 'graduation-cap'
							}
						},
						{
							xtype: 'widget-e',
							containerColor: 'magenta',
							userCls: 'big-33 small-100',
							data: {
								amount: data.teachers,
								type: AppLang.getSTitleTeachersRegistered(),
								icon: 'chalkboard-teacher'
							}
						},
						{
							xtype: 'RegisteredBar',
							userCls: 'big-100 small-100'
						},
						{
							xtype: 'RetiredBar',
							userCls: 'big-100 small-100'
						},
						{
							xtype: 'TeachersBar',
							userCls: 'big-100 small-100'
						}
					];
                    o.add(items);
                },
                failure: function (response, opts) {
                    console.log('server-side failure with status code ' + response.status);
                }
            });
        }
    }
});
