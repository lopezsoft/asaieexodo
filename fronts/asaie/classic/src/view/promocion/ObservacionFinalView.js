/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.promocion.ObservacionFinalView',{
    extend      : 'Admin.base.CustomWindow',
    controller  : 'Promocion',
    alias       : 'widget.observacioninformefinal',
    maxWidth       : 550,
    maxHeight      : 450,
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Observación informe final - '+ Global.getYear());
    },
    store       : 'ActaPromoObsStore',
    items       : [
        {
            xtype   : 'customform',
            items   : [
                {
                    xtype               : 'TextField',
                    disabled            : true,
                    name                : 'msg'
                },
                {
                    xtype               : 'customhtmleditor',
                    name                : 'msg3',
                    enableFont          : false,
                    enableLinks         : false,
                    enableLists         : false,
                    enableSourceEdit    : false,
                    fieldLabel          : 'Observación',
                    labelAlign          : 'top'
                },
                {
                    xtype               : 'customcheckboxfield',
                    name                : 'prom_comision',
                    boxLabel            : 'Promovido por comisión de evaluación.'
                }
            ]
        }
    ]
});