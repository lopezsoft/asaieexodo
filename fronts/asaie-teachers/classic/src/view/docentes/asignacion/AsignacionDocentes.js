Ext.define('Admin.view.docentes.AsignacionDocentes' ,{
    extend	: 'Admin.grid.CustomGrid',
    alias 	: 'widget.asignaciondocentes',
    xtype 	: 'asignaciondocentes',
    store	: 'CargaStore',
    title   : 'Asignación académica',
    plugins	: [
        {
            ptype: 'rowexpander',
            rowBodyTpl : new Ext.XTemplate(
                '<p><b>Grado:</b> {grado}</p>',
                '<p><b>Grupo:</b> {grupo}</p>',
                '<p><b>Asignatura:</b> {asignatura}</p>',
                '<p><b>Jornada:</b> {jornada}</p>',
                '<p><b>Sede:</b> {sede}</p>'
            )
        },
        {
            ptype   : 'gridfilters'
        },
        {
            ptype   : 'responsive'
        }
    ],
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
            text		: "Grupo",
            width		: 65,
            sortable	: true,
            dataIndex	: 'grupo'
        },
        {
            text		: "Asignatura",
           	width		: 250,
            sortable	: true,
            dataIndex	: 'asignatura'
        },
        {
            text		: "Jornada",
            width		: 120,
            sortable	: true,
            dataIndex	: 'jornada'
        },
        {
            text		: "Sede",
            width		: 250,
            sortable	: true,
            dataIndex	: 'sede'
        },
        {
            text		: "Año",
            width		: 60,
            dataIndex	: 'year'
        }
    ],
    tbar: [
        {
            xtype   : 'facebookButton'
        },
        {
            xtype   : 'youtubeButton'
        }
    ]
});
