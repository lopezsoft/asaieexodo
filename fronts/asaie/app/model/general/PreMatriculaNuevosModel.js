/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.PreMatriculaNuevosModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields: [
        { name: 'cod_est',	tpye : 'int'},
        { name: 'nro_doc_id' },
        { name: 'nombres'},
        { name: 'id_grado'},
        { name: 'estado', tpye : 'int'},
        { name: 'grado'},
        { name: 'sede'},
		{ name: 'ins_proced'},
		{ name: 'repite'},
        { name: 'fecha'},
        { name: 'año'},
        { name: 'tdocumento'}
    ]
});
