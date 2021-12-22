'use strict';

const View = use('View');
const Database = use('Database');
const Reader = use('App/Models/Reader');
const { validateAll } = use('Validator');

var msg = '';
View.global('getMessage', function() {
    return msg;
});
View.global('setMessage', function() {
    return (msg = '');
});

class ReaderController {
    index({ view }) {
        return view.render('gest_aces.readers.index');
    }

    async readersapi({ response, request, view, params }) {
        const res = await request.body;
        const search = res.search.value;
        const orderFields = ['reader_name', 'name'];
        const totalReader = await Reader.getCount();
        const readers = await Database.select('readers.id', 'readers.reader_name', 'zones.name')
            .from('readers')
            .join('zones', 'zones.id', 'readers.zone_id ')
            .where('readers.reader_name', 'like', '%' + search + '%')
            .orWhere('zones.name', 'like', '%' + search + '%')
            .groupBy('readers.id')
            .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
            .limit(parseInt(res.length, 10))
            .offset(parseInt(res.start, 10));

        return response.json({
            draw: parseInt(res.draw, 10),
            recordsTotal: totalReader,
            recordsFiltered: search ? readers.length : totalReader,
            data: readers,
        });
    }

    async create({ response, request, view, params }) {
        const zones = await Database.select('zones.*').from('zones');
        return view.render('gest_aces.readers.create', {
            zones,
        });
    }

    async store({ response, request, view, session, params }) {
        const rules = {
            zone_id: 'required',
            reader_name: 'required|min:4|max:20',
        };
        const { reader_name, zone_id } = request.all();
        const res_reader = await Database.select('readers.*')
            .from('readers')
            .where('readers.zone_id', '=', zone_id)
            .andWhere('readers.reader_name', '=', reader_name);
        const message = {
            'zone_id.required': ' *Zone name is invalid!',
            'reader_name.required': '*Reader name invalid!',
        };
        const validation = await validateAll(request.all(), rules, message);
        if (res_reader[0]) {
            msg = '*This reader name already registered, use it!';
            return response.redirect('/readers/create/');
        }
        if (validation.fails()) {
            session.withErrors(validation.messages());
            return response.redirect('/readers/create/');
        }
        try {
            await Reader.create({ zone_id, reader_name });
            return response.redirect('/readers');
        } catch (e) {
            console.log('Error to save reader: ' + e.name);
        }
    }

    async destroy({ response, request, view, params }) {
        const res = await Reader.find(params.id);
        await res
            .delete()
            .then((data) => {
                return response.status(200).send({ data: 'yes' });
            })
            .catch((e) => {
                return response.status(500).json({ error: '  Error:  ' + e.name + '  Message: ' + e.message });
            });
    }

    async edit({ view, params }) {
        const zones = await Database.select('zones.*').from('zones');
        const readers = await Database.select('readers.id', 'readers.reader_name', 'zones.name', 'zones.id As zone_id')
            .from('readers')
            .join('zones', 'zones.id', 'readers.zone_id ')
            .where({ 'readers.id': params.id });

        return view.render('gest_aces.readers.update', {
            readers,
            zones,
        });
    }

    async update({ view, params, request, response }) {
        const { reader_name, zone_id } = request.all();
        const res_reader = await Database.select('readers.*')
            .from('readers')
            .where('readers.zone_id', '=', zone_id)
            .andWhere('readers.reader_name', '=', reader_name);
        if (res_reader[0]) {
            msg = '*This reader name already registered, use it!';
            return response.redirect('/readers/' + params.id + '/edit/');
        }
        try {
            const reader = await Reader.find(params.id);
            reader.zone_id = zone_id;
            reader.reader_name = reader_name;
            await reader.save();
            // msg = '*This reader name registered successifull !';
            return response.redirect('/readers');
        } catch (e) {
            console.log('Error to update reader: ' + e.name + ' Message: ' + e.message);
        }
    }
    /*--------------------------------------------------------*/



    async add_reader_api({  request  }) {
        
        const { reader_name, id_address, port } = request.all();
       var reader = new Reader()
       if(reader_name != '' && reader != null){
        reader.reader_name = reader_name
       }
       if(id_address != '' && id_address != null){
        reader.id_address = id_address
       }
       if(port != '' && port != null){
        reader.port = port
        }
       await reader.save().then(function () {
        return true
      }).catch(function () {
        return false
      });
    }
    async get_readers_api({ response, request }) {
    const readers = await Database.from('readers');
    return readers;
    }
}

module.exports = ReaderController;
