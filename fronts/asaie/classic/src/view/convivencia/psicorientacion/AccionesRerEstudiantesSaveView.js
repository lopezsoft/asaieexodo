/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.view.convivencia.psicorientacion.AccionesRerEstudiantesSaveView',{
    extend : 'Admin.base.WindowCrud',
    alias   : 'widget.AccionesRerEstudiantesSaveView',
    title   : 'Nuevo/Editar Registro de acciones',
    maximized   : true,
    requires     : [
        'Admin.field.HtmlEditor'
    ],
    items   : [
        {
            xtype       : 'customform',
            defaultType : 'customtextarea',
            items   : [
                {
                    xtype       : 'Combo',
                    fieldLabel  : 'Acción',
                    name        : 'id_accion',
                    store       : 'AccionesStore',
                    displayField: 'nombre',
                    queryDelay	: '10',
                    valueField	: 'id',
                    itemId		: 'CbAcciones'
                },
                {
                    xtype       : 'Combo',
                    fieldLabel  : 'Profesional',
                    name        : 'id_admin',
                    store       : 'AdministrativosStore',
                    displayField: 'nombres',
                    queryDelay	: '10',
                    valueField	: 'id',
                    itemId		: 'CbDirectivo'
                },
                {
                    fieldLabel  : 'Observación de la acción',
                    name        : 'obs_accion',
                    allowBlank  : true
                },
                {
                    fieldLabel  : 'Personas involucradas',
                    name        : 'personas_involucradas'
                },
                {
                    fieldLabel  : 'Testigos',
                    name        : 'testigos'
                },
                {
                    fieldLabel  : 'Personas afectadas',
                    name        : 'personas_afectadas'
                },
                {
                    fieldLabel  : 'Compromiso o acuerdo entre las partes (Conciliación)',
                    name        : 'compromiso'
                },
                {
                    fieldLabel  : 'Tratamiento pedagógico',
                    name        : 'tratamiento_peg'
                },
                {
                    fieldLabel  : 'Firma Personas Involucradas',
                    name        : 'firma_ivolucrados'
                },
                {
                    xtype       : 'DateField',
                    fieldLabel  : 'Fecha de la acción',
                    name        : 'fecha_registro'
                }
            ]
        }
    ]
});