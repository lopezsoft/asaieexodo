/**
 * Created by LOPEZSOFT on 03/12/2015.
 */
Ext.define('Admin.view.docentes.Sugerencias',{
    extend      : 'Admin.base.WindowCrud',
    alias 	    : 'widget.sugerencias',
    xtype 	    : 'sugerencias',
    controller  : 'sugerencias',
    initComponent: function () {
        var
            me = Admin.getApplication();
        extra = {
            pdbPeriodo  : '0',
            pdbTable    : 'sugerencias'
        };
        me.setParamStore('SugerenciasStore', extra);
        extra = {
            pdbTable    : 'periodos_academicos',
            pdbGrado    : 5,
            pdbType     : 2
        };
        me.setParamStore('PeriodosStore', extra);
        this.callParent(arguments);
        this.setTitle('Sugerencias u observaciones académicas - '+ Global.getYear());
    },
    buildWindow	: function(){
        this.setWinObject(Ext.create('Admin.view.docentes.SugerenciaSave'));
	},
    showWindow : function (btn) {
        var 
            me      = this
            data    = me.down('grid').getSelection()[0];

        if(!me.getWinObject()){
            me.buildWindow();
        }
        form    = me.getWinObject().down('form');
        form.reset();
        if(btn.xtype  == 'editButton'){
            form.loadRecord(data);
        }
        me.getWinObject().show();
    },
    items       : [
        {
            xtype   : 'customgrid',
            store	: 'SugerenciasStore',
            plugins	: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl : new Ext.XTemplate(
                        '<p><b>Descripción:</b> {sugerencia}</p>'
                    )
                },
                {
                    ptype : 'gridfilters'
                },
                {
                    ptype			: 'gridSearch',
                    readonlyIndexes	: ['note'],
                    disableIndexes	: ['pctChange'],
                    minChars		: 1,
                    mode            : 'local',
                    flex			: 1,
                    autoFocus		: false,
                    independent		: true
                }
            ],
            columns: [
                {
                    xtype       : 'rownumberer'
                },
                {
                    text		: "Descripción",
                    flex		: 1,
                    sortable	: true,
                    dataIndex	: 'sugerencia',
                    filter		: 'list'
                },
                {
                    text		: "Tipo",
                    width		: 110,
                    sortable	: true,
                    dataIndex	: 'tipo',
                    filter		: 'list',
                    renderer :  function(val) {
                        switch(val){
                            case '3':
                                return '<span style="color:Darkviolet;">' + 'OBSERVACIÓN' + '</span>';
                                break;
                            default:
                                return '<span style="color:red;">' + 'SUGERENCIA' + '</span>';
                                break;
                        }
                    }
                },
                {
                    text		: "Periodo",
                    width		: 80,
                    sortable	: true,
                    dataIndex	: 'periodo',
                    filter		: 'list'
                },
                {
                    text		: "Año",
                    width		: 65,
                    dataIndex	: 'year'
                }
            ],
            dockedItems: [
                {
                    xtype   : 'toolbarCrud'
                },
                {
                    xtype 	: 'pagination'
                }
            ]
        }
    ]
});
