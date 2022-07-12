/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.model.docentes.ParceladorCliModel', {
    extend: 'Admin.model.base.BaseModel',
    fields: [
        { name: 'id',                   type: 'int' },
        { name: 'descripcion',          type: 'string' },
        { name: 'estra_apren',          type: 'string' },
        { name: 'id_escala',         	type: 'int' },
        { name: 'id_competencia',       type: 'int' },
        { name: 'tipo',                 type: 'int' }
    ]
});
