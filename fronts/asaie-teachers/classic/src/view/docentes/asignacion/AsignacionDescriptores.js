Ext.define('Admin.view.docentes.AsignacionDescriptores' ,{
    extend	: 'Admin.grid.CustomGrid',
    alias 	    : 'widget.asignaciondescriptores',
    xtype 	    : 'asignaciondescriptores',
    store	    : 'CargaAgrupadaStore',
    title       : 'Asignación académica',
    controller  : 'logros',
    plugins		: [
        {
            ptype: 'rowexpander',
            rowBodyTpl : new Ext.XTemplate(
                '<p><b>Grado:</b> {grado}</p>',
                '<p><b>Asignatura:</b> {asignatura}</p>',
                '<p><b>Sede:</b> {sede}</p>'
            )
        },
        {
            ptype : 'gridfilters'
        },
        {
            ptype : 'responsive'
        }
    ],
    selModel	: 'rowmodel',
    columns: [
        {
            xtype	: 'customrownumberer'
        },
        {
            text    	: "Grado",
            width       : 150,
            sortable	: true,
            dataIndex	: 'grado'
        },
        {
            text		: "Asignatura",
            flex		: 2,
            sortable	: true,
            dataIndex	: 'asignatura'
        },
        {
            text		: "Sede",
            flex		: 2,
            sortable	: true,
            dataIndex	: 'sede'
        },
        {
            text		: "Año",
            width		: 60,
            dataIndex	: 'year'
        }
    ],
    listeners: {
        'selectionchange': function(grid, selected, eOpts) {
            this.down('#btnIndicadores').setDisabled(!selected.length);
        }
    },
    tbar: [
        {
            xtype	: 'customButton',
            text    : 'Descriptores',
            tooltip : 'Permite digitar los logro e indicadores o estándares de desempeño',
            disabled : true,
            iconCls : 'x-fa fa-spinner',
            itemId	: 'btnIndicadores',
            handler : function (btn) {
				const record = btn.up('grid').getSelection()[0],
					me = Admin.getApplication();
				let extP = {
					pdbGrado: record.get('id_grado'),
					pdbAsig: record.get('id_asig'),
					pdbGrupo: '',
					pdbSede: record.get('id_sede'),
					pdbJorn: record.get('id_jorn'),
					pdbType: 0,
					pdbCurso: 0,
					pdbTable: 'logros_estandares'
				};
                me.setParamStore('LogrosStore', extP);
                Ext.create('Admin.view.docentes.Descriptores', {
                    record: record,
                    title: 'Descriptores: ' + record.get('asignatura') + ' - ' + record.get('grado')
                }).show();
            }
        }
    ]
});
