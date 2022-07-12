/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.model.general.CompetenciasModel', {
    extend: 'Admin.model.base.BaseModel',
    idProperty  : 'id_pk',
    fields: [
        { name : 'id'  					, type : 'int' },
        { name : 'id_grado_agrupado' 	, type : 'int'},
        { name : 'competencia' },
        { name : 'nombre_grado_agrupado' },
        { name : 'porcentaje'			, type : 'float'},
        { name : 'foto'},
        { name : 'mime'},
        { name : 'calificable'			, type : 'bool'},
        { name : 'año'}
    ]
});
