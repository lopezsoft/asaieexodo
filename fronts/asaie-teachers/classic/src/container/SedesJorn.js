
Ext.define('Admin.container.SedesJorn',{
    extend	: 'Ext.container.Container',
    alias	: 'widget.sedesJorn',
    xtype	: 'sedesJorn',
    requires: [
        'Admin.combo.CbJornadas',
        'Admin.combo.CbSedes',
        'Admin.combo.CbGrados'
    ],
    items: [
        {
            xtype: 'CbSedes',
            listeners: {
                select: function (cb, r) {
					const {school, profile} =  AuthToken.recoverParams();
					let me = Admin.getApplication(),
						param = {
							pdbTable: 'jornadas',
							pdbSede: r.id,
							schoolId: school.id || 0,
							profileId: profile.id || 0,
							year: school.year || 0,
						};

					me.setParamStore('JornadasStore', param, true);

                    param = {
                        pdbTable    : 'grados',
                        pdbSede     : r.id,
						schoolId: school.id || 0,
						profileId: profile.id || 0,
						year: school.year || 0,
                    };
                    me.setParamStore('GradosStore', param, true);
                }
            }
        },
        {
            xtype: 'CbJornadas',
            bind: {
                visible: '{comboSedes.value}'
            }
        },
        {
            xtype   : 'CbGrados',
            bind: {
                visible: '{comboJornadas.value}'
            }
        }
    ]
});
