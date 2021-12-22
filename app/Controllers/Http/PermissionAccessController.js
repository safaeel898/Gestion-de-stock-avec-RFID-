'use strict';

const View = use('View');
const Database = use('Database');
const PermissionAccess = use('App/Models/PermissionAccess');
const HistoryController = use('App/Controllers/Http/HistoryController');
const ValidatorPermissionAccess = use('App/Validators/PermissionAccess');
const { validateAll } = use('Validator');

var msg = '';
View.global('getMessage', function() {
    return msg;
});
View.global('setMessage', function() {
    return (msg = '');
});
View.global('getDay', function(d) {
    const daysInWeek = ['Lundi', 'Mardi', 'Mecredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    return daysInWeek[d];
});
View.global('timeFomated', function(time) {
    var array = time.split(':');
    const seconds = parseInt(array[0], 10) * 60 * 60 + parseInt(array[1], 10) * 60 + parseInt(array[2], 10);
    const newDate = new Date(seconds * 1000);
    return ('0' + newDate.getUTCHours()).slice(-2) + ':' + ('0' + newDate.getMinutes()).slice(-2);
});

class PermissionAccessController {
    async menu({ response, request, view, params }) {
        return view.render('gest_aces.index');
    }
    async index({ response, request, view, params }) {
        return view.render('gest_aces.access.index');
    }
    hoursFormate(time) {
        var array = time.split(':');
        const seconds = parseInt(array[0], 10) * 60 * 60 + parseInt(array[1], 10) * 60 + parseInt(array[2], 10);
        return new Date(seconds * 1000);
    }

    async verifyAccess({ response, request, view, params }) {
        const { user_id, reader_name, date } = request.body;
        const dates = new Date(date);
        dates.setTime(dates.getTime() - dates.getTimezoneOffset() * 60 * 1000);
        const history = new HistoryController();
        const permission_accesses = await Database.select('permission_accesses.*', 'readers.reader_name')
            .from('permission_accesses')
            .join('group_zones', 'group_zones.id', 'permission_accesses.group_zone_id')
            .join('group_zone_zones', 'group_zone_zones.group_zone_id', 'group_zones.id ')
            .join('zones', 'zones.id', 'group_zone_zones.zone_id')
            .join('readers', 'readers.zone_id', 'zones.id')
            .where('permission_accesses.user_id', '=', user_id)
            .andWhere('readers.reader_name', '=', reader_name);

        const Bookingaccesses = await Database.select('readers.reader_name', 'bookings.*')
            .from('bookings')
            .join('group_zones', 'group_zones.id', 'bookings.group_zone_id')
            .join('group_zone_zones', 'group_zone_zones.group_zone_id', 'group_zones.id ')
            .join('zones', 'zones.id', 'group_zone_zones.zone_id')
            .join('readers', 'readers.zone_id', 'zones.id')
            .where('bookings.user_id', '=', user_id)
            .andWhere('readers.reader_name', '=', reader_name);

        const subscriptionaccesses = await Database.select('readers.reader_name', 'subscriptions.*')
            .from('subscriptions')
            .join('group_zones', 'group_zones.id', 'subscriptions.group_zone_id')
            .join('group_zone_zones', 'group_zone_zones.group_zone_id', 'group_zones.id ')
            .join('zones', 'zones.id', 'group_zone_zones.zone_id')
            .join('readers', 'readers.zone_id', 'zones.id')
            .where('subscriptions.user_id', '=', user_id)
            .andWhere('readers.reader_name', '=', reader_name);

        if (permission_accesses[0]) {
            for (var i = 0; i < permission_accesses.length; i++) {
                const start_hour = new Date(this.hoursFormate(permission_accesses[i].start_hour)).getTime();
                const end_hour = new Date(this.hoursFormate(permission_accesses[i].end_hour)).getTime();
                const newTime = new Date(
                    this.hoursFormate(dates.getUTCHours() + ':' + dates.getMinutes() + ':' + dates.getSeconds())
                ).getTime();
                if (newTime >= start_hour && newTime <= end_hour) {
                    history.store(user_id, date, reader_name);
                    return response.json({ typeAccess: 'Simple', access: true });
                }
            }
        }

        if (Bookingaccesses[0]) {
            for (var i = 0; i < Bookingaccesses.length; i++) {
                const booking_start = new Date(Bookingaccesses[i].start_date);
                const booking_end = new Date(Bookingaccesses[i].end_date);
                booking_start.setTime(booking_start.getTime() - dates.getTimezoneOffset() * 60 * 1000);
                booking_end.setTime(booking_end.getTime() - dates.getTimezoneOffset() * 60 * 1000);
                if (dates >= booking_start && dates <= booking_end) {
                    history.store(user_id, date, reader_name);
                    return response.json({ typeAccess: 'Booking', access: true });
                }
            }
        }
        if (subscriptionaccesses[0]) {
            for (var i = 0; i < subscriptionaccesses.length; i++) {
                const sub_start = new Date(subscriptionaccesses[i].start_date);
                const sub_end = new Date(subscriptionaccesses[i].end_date);
                sub_start.setTime(sub_start.getTime() - dates.getTimezoneOffset() * 60 * 1000);
                sub_end.setTime(sub_end.getTime() - dates.getTimezoneOffset() * 60 * 1000);
                if (dates >= sub_start && dates <= sub_end) {
                    history.store(user_id, date, reader_name);
                    return response.json({ typeAccess: 'Subscription', access: true });
                }
            }
        }
        return response.json({ access: false });
    }

    async accessapi({ response, request, view, params }) {
        const res = await request.body;
        const search = res.search.value;
        const orderFields = ['familyname', 'name'];
        // const totalAccess = await PermissionAccess.getCount();
        const access = await Database.select(
                'permission_accesses.id AS idAccess',
                'users.firstname',
                'users.id as userId',
                'users.familyname',
                'group_zones.id AS idZone',
                'group_zones.name ',
                'group_zones.id as idGZones '
            )
            .from('permission_accesses')
            .join('users', 'users.id', 'permission_accesses.user_id')
            .join('group_zone_zones', 'group_zone_zones.group_zone_id', 'permission_accesses.group_zone_id')
            .join('group_zones', 'group_zones.id', 'group_zone_zones.group_zone_id')
            .where('users.firstname', 'like', '%' + search + '%')
            .orWhere('users.familyname', 'like', '%' + search + '%')
            .orWhere('permission_accesses.repeat_by', 'like', '%' + search + '%')
            .orWhere('permission_accesses.start_hour', 'like', '%' + search + '%')
            .orWhere('permission_accesses.end_hour', 'like', '%' + search + '%')
            .orWhere('group_zones.name', 'like', '%' + search + '%')
            .orWhere('permission_accesses.day_week', 'like', '%' + search + '%')
            .groupBy('permission_accesses.user_id', 'permission_accesses.group_zone_id')
            .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
            .limit(parseInt(res.length, 10))
            .offset(parseInt(res.start, 10));
        return response.json({
            draw: parseInt(res.draw, 10),
            recordsTotal: access.length,
            recordsFiltered: search ? access.length : access.length,
            data: access,
        });
    }
    async time({ response, request, view, params }) {
        const time = await Database.select(
                'permission_accesses.id AS idAccess',
                'permission_accesses.repeat_by',
                'permission_accesses.start_hour',
                'permission_accesses.end_hour',
                'permission_accesses.day_week',
                'permission_accesses.user_id as userId',
                'permission_accesses.group_zone_id as idGZones'
            )
            .from('permission_accesses')
            .where('permission_accesses.user_id', '=', params.userId)
            .andWhere('permission_accesses.group_zone_id', '=', params.idGZones);
        // .groupBy('permission_accesses.user_id', 'permission_accesses.group_zone_id');

        // .groupBy('permission_accesses.user_id');
        return response.json({
            time,
        });
    }

    async create({ response, request, view, params }) {
        const group_zones = await Database.select('group_zones.*').from('group_zones');
        const users = await Database.select('users.id', 'users.firstname', 'users.familyname').from('users');
        const zones = await Database.select('zones.*').from('zones');

        return view.render('gest_aces.access.create', {
            group_zones,
            users,
            zones,
        });
    }

    async store({ response, request, view, session, params }) {
        const res = request.all();
        const { user_id, group_zone_id, start_hour, end_hour, day_week, repeat_by } = request.all();
        const valider = new ValidatorPermissionAccess();
        const validation = await validateAll({ user_id, group_zone_id, start_hour, end_hour, day_week, repeat_by },
            valider.rules(),
            valider.message()
        );

        for (var i = 1; i < res['group-a'].length; i++) {
            const user = await Database.select('permission_accesses.*')
                .from('permission_accesses')
                .where('permission_accesses.user_id', '=', user_id)
                .andWhere('permission_accesses.start_hour', '=', res['group-a'][i].start__hour)
                .andWhere('permission_accesses.end_hour', '=', res['group-a'][i].end__hour)
                .andWhere('permission_accesses.day_week', '=', res['group-a'][i].day__week)
                .andWhere('permission_accesses.repeat_by', '=', res['group-a'][i].repeat__by)
                .andWhere('permission_accesses.group_zone_id', '=', group_zone_id);
            if (user[0]) {
                msg = '*This user is already subscribed to this access, use it!';
                return response.redirect('/access/create');
            }
        }

        for (var i = 1; i < res['group-a'].length; i++) {
            if (res['group-a'][i].start__hour >= res['group-a'][i].end__hour) {
                msg = '*Start hour must be less than the end hour';
                return response.redirect('/access/create');
            }
        }

        if (validation.fails()) {
            msg = '';
            session.withErrors(validation.messages());
            return response.redirect('/access/create');
        }
        try {
            msg = '';
            await PermissionAccess.create({
                user_id,
                start_hour: res.start_hour,
                end_hour: res.end_hour,
                day_week: res.day_week,
                repeat_by: res.repeat_by,
                group_zone_id,
            });
            for (var i = 1; i < res['group-a'].length; i++) {
                await PermissionAccess.create({
                    user_id,
                    start_hour: res['group-a'][i].start__hour,
                    end_hour: res['group-a'][i].end__hour,
                    day_week: res['group-a'][i].day__week,
                    repeat_by: res['group-a'][i].repeat__by,
                    group_zone_id,
                });
            }
            return response.redirect('/access');
        } catch (e) {
            console.log('Error to give access: ' + e.name + 'Message: ' + e.message);
        }
    }

    async edit({ view, params }) {
        const zones = await Database.select('zones.*').from('zones');
        const users = await Database.select('users.id', 'users.firstname', 'users.familyname').from('users');
        const access = await Database.select(
                'permission_accesses.id AS idAccess',
                'permission_accesses.*',
                'users.firstname',
                'users.id as userId',
                'users.familyname',
                'group_zones.id AS idZone',
                'group_zones.name as nameGZone'
            )
            .from('permission_accesses')
            .join('users', 'users.id', 'permission_accesses.user_id')
            .join('group_zones', 'group_zones.id', 'permission_accesses.group_zone_id')
            .where({ 'permission_accesses.id': params.id });

        return view.render('gest_aces.access.update', {
            zones,
            users,
            access,
        });
    }
    async editUser({ view, params }) {
        const zones = await Database.select('zones.*').from('zones');
        const users = await Database.select('users.id', 'users.firstname', 'users.familyname').from('users');
        const access = await Database.select(
                'permission_accesses.id AS idAccess',
                'permission_accesses.*',
                'users.firstname',
                'users.id as userId',
                'users.familyname',
                'group_zones.id AS idZone',
                'group_zones.name as nameGZone'
            )
            .from('permission_accesses')
            .join('users', 'users.id', 'permission_accesses.user_id')
            .join('group_zones', 'group_zones.id', 'permission_accesses.group_zone_id')
            .where({ 'permission_accesses.user_id': params.userId })
            .andWhere({ 'permission_accesses.group_zone_id': params.idGZones });

        return view.render('gest_aces.access.update2', {
            zones,
            users,
            access,
            idGZones: params.idGZones,
        });
    }

    async updateUser({ view, params, request, response }) {
        const res = request.all();
        try {
            await PermissionAccess.query()
                .where('user_id', '=', params.userId)
                .andWhere('group_zone_id', '=', params.idGZones)
                .update({ user_id: res.user_id, group_zone_id: res.group_zone_id });
            return response.redirect('/access');
        } catch (e) {
            return response.status(500).json({ error: '  Error:  ' + e.name + '  Message: ' + e.message });
        }
    }

    async update({ view, params, request, response }) {
        const res = request.all();
        for (var i = 0; i < res['group-a'].length; i++) {
            if (res['group-a'][i].start_hour >= res['group-a'][i].end_hour) {
                msg = '*Start hour must be less than the end hour';
                return response.redirect('/access/' + params.id + '/edit/');
            }
        }
        try {
            msg = '';
            for (var i = 0; i < res['group-a'].length; i++) {
                const access = await PermissionAccess.find(params.id);
                access.user_id = res.user_id;
                access.start_hour = res['group-a'][i].start_hour;
                access.end_hour = res['group-a'][i].end_hour;
                access.day_week = res['group-a'][i].day_week;
                access.repeat_by = res['group-a'][i].repeat_by;
                access.group_zone_id = res.group_zone_id;
                await access.save();
            }
            return response.redirect('/access');
        } catch (e) {
            return response.status(500).json({ error: '  Error:  ' + e.name + '  Message: ' + e.message });
        }
    }

    async destroy({ response, request, view, params }) {
        const res = await PermissionAccess.find(params.id);
        await res
            .delete()
            .then((data) => {
                return response.status(200).send({ data: 'yes' });
            })
            .catch((e) => {
                return response.status(500).json({ error: '  Error:  ' + e.name + '  Message: ' + e.message });
            });
    }

    async deleteall({ response, request, view, params }) {
        await PermissionAccess.query()
            .where('user_id', params.userId)
            .andWhere('group_zone_id', params.idGZones)
            .delete()
            .then((data) => {
                return response.status(200).send({ data: 'yes' });
            })
            .catch((e) => {
                return response.status(500).json({ error: '  Error:  ' + e.name + '  Message: ' + e.message });
            });
    }
}

module.exports = PermissionAccessController;
