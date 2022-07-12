/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.view.convivencia.configuraciones.SituacionesViewCrud',{
    extend : 'Admin.base.WindowCrud',
    alias   : 'widget.SituacionesViewCrud',
    title   : 'Nuevo/Editar Situaciones',
    controller : 'convivencia',
    items   : [
        {
            xtype   : 'customform',
            items   : [
                {
                    xtype       : 'customnumberfield',
                    fieldLabel  : 'Número',
                    name        : 'numero'
                },
                {
                    xtype       : 'customtextarea',
                    fieldLabel  : 'Descripción',
                    name        : 'descripcion'
                },
                {
                    xtype       : 'Combo',
                    fieldLabel  : 'Tipo',
                    name        : 'id_tipo',
                    store       : 'SituacionesTipoStore',
                    displayField: 'descripcion',
                    valueField	: 'id',
                    itemId		: 'CbSituaciones'
                },
                {
                    xtype       : 'customcheckboxfield',
                    fieldLabel  : 'Estado',
                    name        : 'estado',
                    inputValue  : '1',
                    checked     : true
                },
                {
                    xtype       : 'customcheckboxfield',
                    fieldLabel  : 'Auto agregar por reincidencia de situaciones',
                    name        : 'add_auto',
                    inputValue  : '1'
                }
            ]
        }
    ]
});