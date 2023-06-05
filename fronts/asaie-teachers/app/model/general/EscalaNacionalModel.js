/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.EscalaNacionalModel',{
    extend  	: 'Admin.model.base.BaseModel',
    fields: [
        {name : 'nombre_escala'},
		{name : 'mensaje_boletines'},
        {name : 'abrev'},
        {name : 'estado', type : 'bool'}
    ]
});
