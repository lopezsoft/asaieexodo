/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.model.inscripciones.ArchivosDigitalesModel',{
    extend  : 'Admin.model.base.BaseModel',
    idProperty  : 'id',
    fields  : [
        {name : 'id'},
        {name : 'id_estudiante'},
        {name : 'nombre_doc'},
        {name : 'documento'},
        {name : 'mime'}
    ]
});