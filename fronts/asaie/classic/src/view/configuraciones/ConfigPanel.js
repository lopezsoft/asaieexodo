/**
 * Created by LOPEZSOFT on 2/02/2016.
 */
Ext.define('Admin.view.configuraciones.ConfigPanel',{
    extend  : 'Ext.container.Container',
    controller  : 'configuraciones',
    alias   : 'widget.configPanel',
    xtype   : 'configPanel',
    layout  : 'responsivecolumn' ,
    items   : [
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    iconCls : 'x-fa fa-wrench',
                    text    : 'Configurar Firmas',
                    handler : 'onFirmas'
                }
            ]
        },
		{
			xtype   : 'containerButton',
			items   : [
				{
					xtype   : 'buttonPanel',
					iconCls : 'x-fa fa-wrench',
					text    : 'Configuración general',
					handler : 'onGeneral'
				}
			]
		},
		{
			xtype   : 'containerButton',
			items   : [
				{
					xtype   : 'buttonPanel',
					iconCls : 'x-fa fa-wrench',
					text    : 'Grados académicos',
					handler : 'onGrados'
				}
			]
		},
		{
			xtype   : 'containerButton',
			items   : [
				{
					xtype   : 'buttonPanel',
					iconCls : 'x-fa fa-wrench',
					text    : 'Agrupación de grados académicos',
					handler : 'onGradosAgrupados'
				}
			]
		},
		{
			xtype   : 'containerButton',
			items   : [
				{
					xtype   : 'buttonPanel',
					iconCls : 'x-fa fa-wrench',
					text    : 'Niveles académicos',
					handler : 'onNivelesAcademicos'
				}
			]
		},
		{
			xtype   : 'containerButton',
			items   : [
				{
					xtype   : 'buttonPanel',
					iconCls : 'x-fa fa-wrench',
					text    : 'Escala nacional',
					handler : 'onEscalaNacional'
				}
			]
		},
		{
			xtype   : 'containerButton',
			items   : [
				{
					xtype   : 'buttonPanel',
					iconCls : 'x-fa fa-wrench',
					text    : 'Escala de desempeños',
					handler : 'onEscala'
				}
			]
		},
		{
			xtype   : 'containerButton',
			items   : [
				{
					xtype   : 'buttonPanel',
					iconCls : 'x-fa fa-wrench',
					text    : 'Periódos académicos',
					handler : 'onPeriodos'
				}
			]
		},
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    iconCls : 'x-fa fa-wrench',
                    text    : 'Escala de competencias',
                    handler : 'onCompetencias'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    iconCls : 'x-fa fa-wrench',
                    text    : 'Observador del estudiante',
                    iconCls :'x-fa fa-eye',
                    handler : 'onModelosObservador'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    iconCls : 'x-fa fa-wrench',
                    text    : 'Configurar boletines',
                    handler : 'onBoletines'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    iconCls : 'x-fa fa-wrench',
                    text    : 'Configurar diplomas',
                    handler : 'onDiplomas',
                    disabled: true
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    iconCls : 'x-fa fa-stethoscope',
                    text    : 'Estado final',
                    handler : 'onEstado'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    iconCls : 'x-fa fa-print',
                    text    : 'Encabezado reportes',
                    handler : 'onEncabezado'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    iconCls : 'x-fa fa-trash',
                    text    : 'Eliminar Notas en Cero',
                    handler : function (btn) {
                        var
                            gb  = Global,
                            ts  = btn.up('container').up('container');
                            me  = Admin.getApplication();
                        ts.mask('Procesando petición...');
                        Ext.Ajax.request({
                            url: gb.getUrlBase() +'general/get_borrar_cerros',
                            success: function(response) {
                                me.showResult('Proceso terminado correctamente.');
                            },
                            failure: function(response) {
                                me.onError(response.status);
                            },
                            callback : function(){
                                ts.unmask();
                            }
                        });
                    }
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    iconCls : 'x-fa fa-wrench',
                    text    : 'Proyección  de cupos',
                    handler : 'onProyCupos',
                    disabled: true
                }
            ]
        },
		{
			xtype   : 'containerButton',
			items   : [
				{
					xtype   : 'buttonPanel',
					iconCls : 'x-fa fa-wrench',
					text    : 'Jornadas  de estudio',
					handler : 'onJornadas'
				}
			]
		},
		{
			xtype   : 'containerButton',
			items   : [
				{
					xtype   : 'buttonPanel',
					iconCls : 'far fa-id-card',
					text    : 'Cernés Escolares',
					handler : 'onCarnets'
				}
			]
		},
		{
			xtype   : 'containerButton',
			items   : [
				{
					xtype   : 'buttonPanel',
					iconCls : 'x-fa fa-wrench',
					text    : 'Habilitar Matricula En línea',
                    handler : 'onMatOnline',
                    disabled: true
				}
			]
		}
    ]
});
