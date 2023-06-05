/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.configuraciones.CriteriosAspectosObservadorSaveView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
    alias       : 'widget.criteriosaspectosobservadorsaveview',
    maxHeight	: 280,
    maxWidth    : 450,
    store       : 'CriteriosAspectosObservadorStore',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Nuevo/Editar Criterios - '+ Global.getYear());
    },
    defaultFocus: 'customtextarea',
    items       : [
        {
            xtype       : 'customform',
            items       : [
                {
                    xtype       : 'hidden',
                    name        : 'id_item_modelo',
                    itemId      : 'id_item_modelo'
                },
                {
                    xtype       : 'customtextarea',
                    name        : 'descripcion',
                    fieldLabel  : 'Descripción',
                    labelAlign  : 'top'
                },
                {
                    xtype       : 'customradiogroup',
                    fieldLabel  : 'Activo',
                    items       : [
                        {
                            name        : 'estado',
                            inputValue  : 1,
                            boxLabel    : 'Si'
                        },
                        {
                            name        : 'estado',
                            inputValue  : 0,
                            boxLabel    : 'No'
                        }
                    ]
                }
            ]

        }
    ]
});