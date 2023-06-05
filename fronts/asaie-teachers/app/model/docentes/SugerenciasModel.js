Ext.define('Admin.model.docentes.SugerenciasModel', {
    extend: 'Admin.model.base.BaseModel',
    fields: [
        { name: 'id' },
        { name: 'consecutivo' },
        { name: 'sugerencia' },
        { name: 'tipo' },
        { name: 'periodo' }	,
        { name: 'año' },
        { name: 'id_nota'}
    ]
});