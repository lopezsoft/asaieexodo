/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.configuraciones.AspectosObservadorSaveView',{
    extend  : 'Admin.base.WindowCrud',
    title   : 'Aspectos del observador',
    controller  : 'configuraciones',
    alias       : 'widget.aspectososervadorsaveview',
    maxHeight	: 350,
    maxWidth    : 500,
    defaultFocus: 'customtextarea',
    store       : 'AspectosObservadorStore',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Nuevo/Editar Aspectos del observador - '+ Global.getYear());
    },
    items       : [
        {
            xtype       : 'customform',
            items       : [
                {
                    xtype   : 'hidden',
                    itemId  : 'id_modelo',
                    name    : 'id_modelo'
                },
                {
                    xtype   : 'customtextarea',
                    name    : 'descripcion',
                    fieldLabel  : 'Descripción',
                    labelAlign  : 'top'
                },
                {
                    xtype       : 'customcheckboxfield',
                    boxLabel    : 'Vincular con convivencia',
                    name        : 'convivencia'
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