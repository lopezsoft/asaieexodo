/**
 * Created by LEWIS on 26/11/2015.
 */
Ext.define('Admin.model.docentes.ParceladorModel', {
    extend: 'Admin.model.base.BaseModel',
    fields: [
        { name: 'id' },
        { name: 'id_inst' },
        { name: 'id_sede' },
        { name: 'id_docente' },
        { name: 'id_grado' },
        { name: 'id_asig' },
        { name: 'periodo' },
        { name: 'año' },
        { name: 'id_metod' },
        { name: 'fecha_inicio' },
        { name: 'fecha_cierre' },
        { name: 'tiempo_probalble' },
        { name: 'tiempo_real' },
        { name: 'clases' },
        { name: 'estado'},
        { name: 'grado' },
        { name: 'asignatura' }
    ]
});
