'use strict';
const View = use('View');
const Database = use('Database');
const Zones = use('App/Models/Zone');
const { validateAll } = use('Validator');

const rules = {
    name_zone: 'required|min:4|max:20',
};
const message = {
    'name_zone.required': '*Group name invalid!',
};
var msg = '';
View.global('getMessage', function() {
    return msg;
});
View.global('setMessage', function() {
    return (msg = '');
});
class ZoneController {
    async index({ view }) {
        return view.render('gest_aces.zones.index');
    }
    async zoneapi({ response, request }) {
        const res = await request.body;
        const search = res.search.value;
        const orderFields = ['name'];
        const totalZone = await Zones.getCount();
        const zone = await Database.select('zones.id', 'zones.name ')
            .from('zones')
            .where('zones.name', 'like', '%' + search + '%')
            .groupBy('zones.id')
            .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
            .limit(parseInt(res.length, 10))
            .offset(parseInt(res.start, 10));
        return response.json({
            draw: parseInt(res.draw, 10),
            recordsTotal: totalZone,
            recordsFiltered: search ? zone.length : totalZone,
            data: zone,
        });
    }

    async create({ view }) {
        return view.render('gest_aces.zones.create');
    }

    async store({ response, request, view, params, session }) {
        const { name_zone } = request.only(['name_zone']);
        const res_zone = await Database.select('zones.*').from('zones').where('zones.name', '=', name_zone);
        const validation = await validateAll(request.all(), rules, message);
        if (res_zone[0]) {
            msg = '*This zone name already registered, use it!';
            return response.redirect('/zone/create/');
        }
        if (validation.fails()) {
            session.withErrors(validation.messages());
            return response.redirect('/zone/create/');
        }
        try {
            const res = request.only(['name_zone']);
            await Zones.create({ name: res.name_zone });
            return response.redirect('/zone');
        } catch (e) {
            console.log('Error to save  zone: ' + e.name + 'Message: ' + e.message);
        }
    }

    async destroy({ response, request, view, params }) {
        const { id } = params;
        const res = await Zones.find(id);
        await res
            .delete()
            .then((data) => {
                return response.status(200).send({ data: 'yes' });
            })
            .catch((e) => {
                return response.status(500).json({ error: e });
            });
    }

    async edit({ view, params }) {
        try {
            const { id } = params;
            const zone = await Database.select('*').from('zones').where('id', id);
            return view.render('gest_aces.zones.update', {
                zone,
                id,
            });
        } catch (e) {
            console.log('Error to edit  zone: ' + e.name + 'Message: ' + e.message);
        }
    }

    async update({ view, params, request, response, session }) {
        const res = request.only(['zone']);
        const res_zone = await Database.select('zones.*').from('zones').where('zones.name', '=', res.zone);
        const validation = await validateAll(request.all(), rules, message);
        if (res_zone[0]) {
            msg = '*This zone name already registered, use it!';
            return response.redirect('/zone/' + params.id + '/edit/');
        }
        if (validation.fails()) {
            session.withErrors(validation.messages());
            return response.redirect('/zone/create/');
        }
        try {
            const { id } = params;
            const zone = await Zones.find(id);
            zone.name = res.zone;
            await zone.save();
            return response.redirect('/zone');
        } catch (e) {
            console.log('Error to update zone: ' + e.name + 'Message: ' + e.message);
        }
    }
}

module.exports = ZoneController;
