/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.ColumnasNotasCompetenciasModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields: [
        { name: 'id_competencia',type : 'int'},
        { name: 'numero_column',type : 'int'},
        { name: 'porciento',type : 'float'},
        { name: 'descripcion'},
		{ name: 'abrev'},
        { name: 'tipo'},
		{ name: 'modificable', type	: 'bool'}
    ]
});
