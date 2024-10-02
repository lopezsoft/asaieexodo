/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
let sisbenData = [];
let letters = ['A', 'B', 'C', 'D'];

letters.forEach(letter => {
	for (let i = 1; i <= 21; i++) {
		sisbenData.push({ sisben: `${letter}${i}` });
	}
});

Ext.define('Admin.store.general.SisbenStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'SisbenStore',
    fields  : [
        {name : 'sisben'}
    ],
    data : sisbenData
});
