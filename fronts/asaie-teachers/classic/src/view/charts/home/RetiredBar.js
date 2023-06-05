Ext.define('Admin.view.charts.home.RetiredBar', {
    extend: 'Admin.view.charts.ChartBase',
    xtype: 'RetiredBar',
    requires: [
        'Ext.chart.CartesianChart',
        'Ext.chart.axis.Category',
        'Ext.chart.axis.Numeric',
        'Ext.chart.interactions.PanZoom',
        'Ext.chart.series.Bar',
        'Ext.chart.theme.Muted'
    ],
    title: AppLang.getSTitleStudentRetired(),
    iconCls: 'fas fa-chart-bar',
    items: [
        {
            xtype       : 'cartesian',
            reference   : 'chart',
            itemId      : 'chart',
            theme   : {
                type: 'muted'
            },
            insetPadding: '40 40 40 20',
            animation: Ext.isIE8 ? false : {
                easing: 'backOut',
                duration: 500
            },
            store: {
                type : 'RetiredStore'
            },
            //define the x and y-axis configuration.
            axes: [
                {
                    type        : 'numeric3d',  
                    position    : 'left',
                    fields      : 'total',
                    majorTickSteps: 10,
                    renderer: function (axis, label, layoutContext) {
                        return Ext.util.Format.number(layoutContext.renderer(label), '0,000');
                    },
                    title       : AppLang.getSTitleStudentRetired(),
                    grid: {
                        odd: {
                            fillStyle: 'rgba(255, 255, 255, 0.06)'
                        },
                        even: {
                            fillStyle: 'rgba(0, 0, 0, 0.03)'
                        }
                    }
                },
                {
                    type        : 'category3d',
                    position    : 'bottom',
                    fields      : 'year',
                    grid        : true
                }
            ],

            //define the actual bar series.
            series: [
                {
                    type    : 'bar3d',
                    xField  : 'year',
                    yField  : 'total',
                    style: {
                        minGapWidth: 20
                    },
                    highlightCfg: {
                        saturationFactor: 1.5
                    },
                    label: {
                        field       : 'total',
                        display     : 'insideEnd',
                        renderer: function (v) {
                            return Ext.util.Format.number(v, '0,000');
                        }
                    },
                    tooltip: {
                        trackMouse: true,
                        renderer: function(tooltip, record, item) {
                            tooltip.setHtml(record.get('year') + ': ' +
                                Ext.util.Format.number(record.get('total'), '0,000 (' + AppLang.getSTitleStudentRetired()+')'));
                        }
                    },
                    renderer: function (sprite, config, data, index) {
                        return {
                            fillStyle   : Global.getRandomColor(),
                            strokeStyle : index % 2 ? 'none' : 'black',
                            opacity     : index % 2 ? 1 : 0.5
                        };
                    }
                }
            ],
            sprites: [
                {
                    type: 'text',
                    text: AppLang.getSTitleStudentRetired(),
                    fontSize: 22,
                    width: 100,
                    height: 40,
                    x: 40, // the sprite x position
                    y: 20  // the sprite y position
                }
            ]
        }
    ]
});
