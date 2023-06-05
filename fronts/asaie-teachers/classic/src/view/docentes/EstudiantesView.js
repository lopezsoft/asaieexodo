/**
 * Created by LOPEZSOFT on 28/01/2016.
 */
Ext.define('Admin.view.docentes.EstudiantesView',{
    extend      : 'Admin.base.CustomWindow',
    controller  : 'ausencias',
    title       : 'Estudiantes',
    requires    : [
        'Admin.store.docentes.EstudiantesStore'
    ],
    maximized   : true,
    items       : [
        {
            xtype   : 'customgrid',
            store   : 'EstudiantesStore',
            iconCls : '',
            plugins		: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl : new Ext.XTemplate(
                        '<p><b>Apellidos y Nombres:</b> {nombres}</p>'
                    )
                },
                {
                    ptype : 'gridfilters'
                }
            ],
            columns : [
                {
                    xtype       : 'rownumberer'
                },
                {
                    text        : 'Apellidos y Nombres',
                    dataIndex   : 'nombres',
                    flex        : 2,
                    filter      : 'string'
                },
                {
                    text        : 'Grado',
                    dataIndex   : 'grado',
                    flex        : 1
                },
                {
                    text        : 'Grupo',
                    dataIndex   : 'grupo',
                    width       : 60
                },
                {
                    text        : 'Sede',
                    dataIndex   : 'sede',
                    flex        : 1
                }
            ],
            tbar : [
                {
                    xtype   : 'customButton',
                    text    : 'Improtar...',
                    iconCls : 'x-fa fa-upload',
                    handler : 'onImportEstudent'
                },'->','-',
                {
                    xtype   : 'closebutton'
                }
            ]
        }
    ]
});