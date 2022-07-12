/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.model.general.EstadoFinalModel', {
    extend: 'Admin.model.base.BaseModel',
    idProperty  : 'id_pk',
    fields: [
        { name : 'id'  , type : 'int' },
        { name : 'prom_manual'  , type : 'bool' },
        { name : 'descripcion_estado' },
        { name : 'nombre_grado_agrupado'}
    ]
});