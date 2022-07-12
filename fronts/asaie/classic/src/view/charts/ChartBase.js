Ext.define('Admin.view.charts.ChartBase', {
    extend: 'Ext.Panel',
    cls     : 'quick-graph-panel shadow',
    height  : 550,
    ui      : 'panel-white',
    layout  : 'fit',
    bodyPadding : 5,
    tbar: [
        '->',
        {
            text: Ext.os.is.Desktop ? AppLang.getSButtonDownload() : AppLang.getSButtonPreview(),
            handler: function (v) {
                if (Ext.isIE8) {
                    Ext.Msg.alert('Unsupported Operation', 'This operation requires a newer version of Internet Explorer.');
                    return;
                }
                var
                    pan     = v.up('panel'),
                    chart   = pan.down('#chart');

                if (Ext.os.is.Desktop) {
                    chart.download({
                        filename: pan.getTitle()
                    });
                } else {
                    chart.preview();
                }
            }
        }
    ],
    platformConfig: {
        classic: {
            headerPosition: 'top'
        },
        modern: {
            header: {
                docked: 'top'
            }
        }
    },
    defaults: {
        width: '100%'
    }
});
