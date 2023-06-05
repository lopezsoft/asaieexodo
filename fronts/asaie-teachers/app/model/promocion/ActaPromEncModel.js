/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.promocion.ActaPromEncModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields: [
        { name: 'id_inst'},
        { name: 'año'},
        { name: 'encabezado'},
        { name: 'nombre_inst'},
        { name: 'resolucion'},
        { name: 'otorga'},
        { name: 'diploma'},
        { name: 'al_alumno'},
        { name: 'firma_rec', type : 'int'},
        { name: 'firma_sec', type : 'int'},
        { name: 'copia_folio'},
        { name: 'constancia'},
        { name: 'firma'}
    ]
});