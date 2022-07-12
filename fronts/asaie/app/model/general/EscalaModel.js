/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.EscalaModel',{
    extend  	: 'Admin.model.base.BaseModel',
    idProperty 	: 'id_pk',
    fields: [
		{name : 'id_escala'	, 			type: 'int'},
		{name : 'id_grado_agrupado'	, 	type: 'int'},
        {name : 'nombre_escala'},
		{name : 'nombre_grado_agrupado'},
        {name : 'desde',				type: 'float'},
        {name : 'hasta',				type: 'float'},
        {name : 'abrev'},
        {name : 'reprueba', 			type : 'bool'}
    ]
});
