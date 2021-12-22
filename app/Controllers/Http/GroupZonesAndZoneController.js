'use strict';

const View = use('View');
const Database = use('Database');
const GroupZoneZone = use('App/Models/GroupZoneZone');
const Group = use('App/Models/GroupZone');

const ValidatorGroupZones = use('App/Validators/GroupZonesAndZones');

const { validateAll } = use('Validator');

var msg = '';
View.global('getMessage', function() {
    return msg;
});
View.global('setMessage', function() {
    return (msg = '');
});
class GroupZonesAndZoneController {
    index({ view }) {
        return view.render('gest_aces.group_zone_zones.index');
    }

    async gr_zonesapi({ response }) {
        const group_zone_zones = await Database.select(
                'group_zone_zones.id AS idgroup_zone_zones',
                'group_zones.name AS group_zones_name',
                'group_zones.id AS group_zones_id'
            )
            .from('group_zone_zones')
            .join('group_zones', 'group_zones.id', 'group_zone_zones.group_zone_id ')
            .join('zones', 'zones.id', 'group_zone_zones.zone_id ')
            .groupBy('group_zone_zones.group_zone_id');
        return response.json({ data: group_zone_zones });
    }

    async groupzonesapi({ response, request, view, params }) {
        const res = await request.body;
        const search = res.search.value;
        const orderFields = ['group_zones_name', 'zone_name'];
        // const totalGroup_zone_zones = await GroupZoneZone.getCount();
        const group_zone_zones = await Database.select(
                'group_zone_zones.id AS idgroup_zone_zones',
                'zones.name AS zone_name',
                'zones.id AS idZone',
                'group_zones.name AS group_zones_name',
                'group_zones.id AS group_zones_id'
            )
            .from('group_zone_zones')
            .join('group_zones', 'group_zones.id', 'group_zone_zones.group_zone_id ')
            .join('zones', 'zones.id', 'group_zone_zones.zone_id ')
            .where('group_zones.name', 'like', '%' + search + '%')
            .orWhere('zones.name', 'like', '%' + search + '%')
            .groupBy('group_zone_zones.group_zone_id')
            .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
            .limit(parseInt(res.length, 10))
            .offset(parseInt(res.start, 10));

        return response.json({
            draw: parseInt(res.draw, 10),
            recordsTotal: group_zone_zones.length,
            recordsFiltered: search ? group_zone_zones.length : group_zone_zones.length,
            data: group_zone_zones,
        });
    }

    async filtrezones({ response, request, view, params }) {
        const zones = await Database.select(
                'group_zone_zones.id AS idgroup_zone_zones',
                'zones.name AS zone_name',
                'zones.id AS idZone',
                'group_zones.name AS group_zones_name',
                'group_zones.id AS group_zones_id'
            )
            .from('group_zone_zones')
            .join('group_zones', 'group_zones.id', 'group_zone_zones.group_zone_id ')
            .join('zones', 'zones.id', 'group_zone_zones.zone_id ')
            // .where('group_zone_zones.zone_id', '=', params.idZone)
            .andWhere('group_zone_zones.group_zone_id', '=', params.idGZone);
        return response.json({
            zones,
        });
    }

    async editGZones({ view, params }) {
        const group_zones = await Database.select('group_zones.*').from('group_zones');
        const zones = await Database.select('zones.id', 'zones.name').from('zones');
        const group_zone_zones = await Database.select(
                'group_zone_zones.id AS idgroup_zone_zones',
                'zones.name AS zone_name',
                'zones.id AS idZone',
                'group_zones.name AS group_zones_name',
                'group_zones.id AS group_zones_id'
            )
            .from('group_zone_zones')
            .join('group_zones', 'group_zones.id', 'group_zone_zones.group_zone_id ')
            .join('zones', 'zones.id', 'group_zone_zones.zone_id ')
            .where('group_zone_zones.group_zone_id', '=', params.idGZone);
        // .andWhere('group_zone_zones.zone_id', '=', params.idZone)
        console.log(group_zone_zones);
        return view.render('gest_aces.group_zone_zones.update2', {
            group_zones,
            group_zone_zones,
            zones,
            idGZones: params.idGZone,
        });
    }

    async updateGZones({ view, params, request, response }) {
        const { group_zone_id } = request.all();
        try {
            await GroupZoneZone.query().where('group_zone_id', '=', params.idGZone).update({ group_zone_id: group_zone_id });
            return response.redirect('/groupzones');
        } catch (e) {
            return response.status(500).json({ error: '  Error:  ' + e.name + '  Message: ' + e.message });
        }
    }

    async create({ response, request, view, params }) {
        const group_zones = await Database.select('group_zones.*').from('group_zones');
        const zones = await Database.select('zones.*').from('zones');
        return view.render('gest_aces.group_zone_zones.create', {
            group_zones,
            zones,
        });
    }

    async store({ response, request, view, session, params }) {
        const validator = new ValidatorGroupZones();
        const { group_zone_id, zone_id } = request.all();
        const validation = await validateAll(request.all(), validator.rules(), validator.message());
        const group_zone_zones = await Database.select('group_zone_zones.*')
            .from('group_zone_zones')
            .where('group_zone_zones.group_zone_id', '=', group_zone_id)
            .havingIn('group_zone_zones.zone_id', zone_id);
        // .andWhere('group_zone_zones.zone_id', '=', zone_id);

        if (group_zone_zones[0]) {
            msg = '*This combination already registered, use it!';
            return response.redirect('/groupzones/create/');
        }
        if (validation.fails()) {
            session.withErrors(validation.messages());
            return response.redirect('/groupzones/create/');
        }
        try {
            msg = '';
            if (Array.isArray(zone_id) == false) {
                await GroupZoneZone.create({ zone_id: zone_id, group_zone_id });
            } else {
                for (var i = 0; i < zone_id.length; i++) {
                    await GroupZoneZone.create({ zone_id: zone_id[i], group_zone_id });
                }
            }

            return response.redirect('/groupzones');
        } catch (e) {
            console.log('Error to combine group zone and zone: ' + e.name + 'Message: ' + e.message);
        }
    }

    async modalStore({ response, request, view, session, params }) {
        const { group_zone, zone_id } = request.all();
        const group_zones = await Database.from('group_zones')
            .where('group_zones.name', group_zone);

        if (group_zones[0]) {
            return false;
        }
        if (group_zone == '' || zone_id == '') {
            return false;
        }
        const group_id = await Group.create({ name: group_zone });
        try {
            msg = '';
            if (Array.isArray(zone_id) == false) {
                await GroupZoneZone.create({ zone_id: zone_id, group_zone_id: group_id['$attributes'].id });
            } else {
                for (var i = 0; i < zone_id.length; i++) {
                    await GroupZoneZone.create({ zone_id: zone_id[i], group_zone_id: group_id['$attributes'].id });
                }
            }
            return true;
        } catch (e) {
            console.log('Error to combine group zone and zone: ' + e.name + 'Message: ' + e.message);
        }
    }

    async destroy({ response, request, view, params }) {
        const res = await GroupZoneZone.find(params.id);
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
        const group_zones = await Database.select('group_zones.*').from('group_zones');
        const zones = await Database.select('zones.*').from('zones');
        const group_zone_zone = await Database.select(
                'group_zones.id AS idGr_zones',
                'group_zones.name AS nameGr_zones',
                'zones.id AS idZones',
                'zones.name AS nameZones',
                'group_zone_zones.id'
            )
            .from('group_zone_zones')
            .join('group_zones', 'group_zones.id', 'group_zone_zones.group_zone_id ')
            .join('zones', 'zones.id', 'group_zone_zones.zone_id ')
            .where({ 'group_zone_zones.id': params.id });
        return view.render('gest_aces.group_zone_zones.update', {
            group_zones,
            zones,
            group_zone_zone,
        });
    }

    async update({ view, params, request, response }) {
        const { zone_id, group_zone_id } = request.all();
        const group_zone_zone = await GroupZoneZone.find(params.id);
        const group_zone_zones = await Database.select('group_zone_zones.*')
            .from('group_zone_zones')
            .where('group_zone_zones.zone_id', '=', zone_id)
            .andWhere('group_zone_zones.group_zone_id', '=', group_zone_id);
        if (group_zone_zones[0]) {
            msg = '*This combination already registered, use it!';
            return response.redirect('/groupzones/' + params.id + '/edit/');
        }
        try {
            msg = '';
            group_zone_zone.zone_id = zone_id;
            group_zone_zone.group_zone_id = group_zone_id;
            await group_zone_zone.save();
            return response.redirect('/groupzones');
        } catch (e) {
            console.log('Error to update combine group zone and zone: ' + e.name + 'Message: ' + e.message);
        }
    }

    async deleteall({ response, request, view, params }) {
        await GroupZoneZone.query()
            .where('group_zone_id', params.idGZone)
            .delete()
            .then((data) => {
                return response.status(200).send({ data: 'yes' });
            })
            .catch((e) => {
                return response.status(500).json({ error: '  Error:  ' + e.name + '  Message: ' + e.message });
            });
    }
}

module.exports = GroupZonesAndZoneController;