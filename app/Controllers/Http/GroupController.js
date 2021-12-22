'use strict';
const View = use('View');
const Database = use('Database');
const GroupZone = use('App/Models/GroupZone');
const { validateAll } = use('Validator');

const rules = {
    group_zone: 'required',
};
const message = {
    'group_zone.required': '*Group name required!',
};
var msg = '';
View.global('getMessage', function() {
    return msg;
});
View.global('setMessage', function() {
    return (msg = '');
});
class GroupController {
    async index({ view }) {
        return view.render('gest_aces.group.index');
    }
    async groupapi({ response, request }) {
        const res = await request.body;
        const search = res.search.value;
        const orderFields = ['name'];
        const totalGroupZone = await GroupZone.getCount();
        const group = await Database.select('group_zones.id', 'group_zones.name ')
            .from('group_zones')
            .where('group_zones.name', 'like', '%' + search + '%')
            .groupBy('group_zones.id')
            .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
            .limit(parseInt(res.length, 10))
            .offset(parseInt(res.start, 10));
        return response.json({
            draw: parseInt(res.draw, 10),
            recordsTotal: totalGroupZone,
            recordsFiltered: search ? group.length : totalGroupZone,
            data: group,
        });
    }

    async create({ view }) {
        return view.render('gest_aces.group.create');
    }

    async store({ response, request, view, params, session }) {
        const { group_zone } = request.all();
        const res_group = await Database.select('group_zones.*')
            .from('group_zones')
            .where('group_zones.name', '=', group_zone);
        const validation = await validateAll(request.all(), rules, message);
        if (res_group[0]) {
            msg = '*This group name already registered, use it!';
            return response.redirect('/group/create/');
        }
        if (validation.fails()) {
            session.withErrors(validation.messages());
            return response.redirect('/group/create/');
        }
        try {
            await GroupZone.create({ name: group_zone });
            return response.redirect('/group');
        } catch (e) {
            console.log('Error to save group zone: ' + e.name + 'Message: ' + e.message);
        }
    }

    async destroy({ response, request, view, params }) {
        const { id } = params;
        const res = await GroupZone.find(id);
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
            const group = await Database.select('*').from('group_zones').where('id', id);
            return view.render('gest_aces.group.update', {
                group,
                id,
            });
        } catch (e) {
            console.log('Error to edit group zone: ' + e.name + 'Message: ' + e.message);
        }
    }

    async update({ view, params, request, response, session }) {
        const res = request.all();
        const res_group = await Database.select('group_zones.*')
            .from('group_zones')
            .where('group_zones.name', '=', res.group_zone);
        const validation = await validateAll(request.all(), rules, message);
        if (res_group[0]) {
            msg = '*This group name already registered, use it!';
            return response.redirect('/group/' + params.id + '/edit/');
        }
        if (validation.fails()) {
            session.withErrors(validation.messages());
            return response.redirect('/group/create/');
        }
        try {
            const { id } = params;
            const group = await GroupZone.find(id);
            group.name = res.group_zone;
            await group.save();
            return response.redirect('/group');
        } catch (e) {
            console.log('Error to update group zone: ' + e.name + 'Message: ' + e.message);
        }
    }
}

module.exports = GroupController;
