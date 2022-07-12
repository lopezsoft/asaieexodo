/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.view.convivencia.configuraciones.SituacionesRerEstudiantesViewCrud',{
    extend : 'Admin.base.WindowCrud',
    alias   : 'widget.SituacionesRerEstudiantesViewCrud',
    title   : 'Nuevo/Editar Registro de situaciones',
    requires: [
        'Admin.store.general.DocentesStore',
        'Admin.store.general.AdministrativosStore'
    ],
    items   : [
        {
            xtype   : 'customform',
            items   : [
                {
                    xtype       : 'Combo',
                    fieldLabel  : 'Situación',
                    name        : 'id_situacion',
                    store       : 'SituacionesStore',
                    displayField: 'descripcion',
                    queryDelay	: '10',
                    valueField	: 'id',
                    itemId		: 'CbSituacionesReg'
                },
                {
                    xtype       : 'customtextarea',
                    fieldLabel  : 'Observación',
                    name        : 'observacion'
                },
                {
                    xtype       : 'Combo',
                    fieldLabel  : 'Docente',
                    name        : 'id_docente',
                    store       : 'DocentesStore',
                    displayField: 'nombres',
                    queryDelay	: '10',
                    valueField	: 'id_docente',
                    itemId		: 'CbDocente'
                },
                {
                    xtype       : 'Combo',
                    fieldLabel  : 'Coordinador(a)',
                    name        : 'id_admin',
                    store       : 'AdministrativosStore',
                    displayField: 'nombres',
                    queryDelay	: '10',
                    valueField	: 'id',
                    itemId		: 'CbDirectivo'
                },
                {
                    xtype       : 'DateField',
                    fieldLabel  : 'Fecha de la situación',
                    name        : 'fecha_registro'
                }
            ]
        }
    ]
});