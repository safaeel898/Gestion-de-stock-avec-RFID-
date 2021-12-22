'use strict';

const View = use('View');
const Database = use('Database');
const Booking = use('App/Models/Booking');
const validatorBooking = use('App/Validators/Bookings');

const { validateAll } = use('Validator');

var msg = '';
View.global('getMessage', function() {
    return msg;
});
View.global('setMessage', function() {
    return (msg = '');
});
View.global('getDate', function(date) {
    const newDate = new Date(date);
    return (
        newDate.getFullYear() +
        '-' +
        ('0' + parseInt(1 + newDate.getMonth(), 10)).slice(-2) +
        '-' +
        ('0' + newDate.getDate()).slice(-2)
    );
});

class BookingController {
    index({ view }) {
        return view.render('gest_aces.booking.index');
    }

    async bookingapi({ response, request, view, params }) {
        const res = await request.body;
        const search = res.search.value;
        const orderFields = ['familyname', 'name'];
        const totalBookings = await Booking.getCount();
        const booking = await Database.select(
                'bookings.id AS idBooking',
                'users.firstname',
                'users.familyname',
                'users.id as userId',
                'bookings.start_date',
                'bookings.end_date',
                'group_zones.id as idGZones',
                'group_zones.name '
            )
            .from('bookings')
            .join('users', 'users.id', 'bookings.user_id')
            .join('group_zone_zones', 'group_zone_zones.group_zone_id', 'bookings.group_zone_id')
            .join('group_zones', 'group_zones.id', 'group_zone_zones.group_zone_id')
            .where(function() {
                this.where('users.firstname', 'like', '%' + search + '%');
            })
            .orWhere('users.familyname', 'like', '%' + search + '%')
            .orWhere('bookings.start_date', 'like', '%' + search + '%')
            .orWhere('bookings.end_date', 'like', '%' + search + '%')
            .orWhere('group_zones.name', 'like', '%' + search + '%')
            .groupBy('bookings.user_id', 'bookings.group_zone_id')
            .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
            .limit(parseInt(res.length, 10))
            .offset(parseInt(res.start, 10));

        return response.json({
            draw: parseInt(res.draw, 10),
            recordsTotal: totalBookings,
            recordsFiltered: search ? booking.length : totalBookings,
            data: booking,
        });
    }

    async create({ response, request, view, params }) {
        const group_zones = await Database.select('group_zones.*').from('group_zones');
        const zones = await Database.select('zones.*').from('zones');
        const users = await Database.select('users.id', 'users.firstname', 'users.familyname').from('users');
        return view.render('gest_aces.booking.create', {
            group_zones,
            users,
            zones,
        });
    }

    async store({ response, request, view, session, params }) {
        const res = request.all();
        const { user_id, group_zone_id, start_date, end_date } = request.all();
        const valider = new validatorBooking();
        const validation = await validateAll({ user_id, group_zone_id, start_date, end_date },
            valider.rules(),
            valider.message()
        );
        console.log(user_id, start_date, end_date, group_zone_id);
        const booking = await Database.select('bookings.*')
            .from('bookings')
            .where('bookings.user_id', '=', user_id)
            .andWhere('bookings.start_date', '<=', start_date)
            .andWhere('bookings.end_date', '>=', end_date)
            .andWhere('bookings.group_zone_id', '=', group_zone_id);

        if (booking[0]) {
            msg = '*This user is already booked , use it!';
            return response.redirect('/booking/create');
        }
        const booking1 = await Database.select('bookings.*')
            .from('bookings')
            .where('bookings.start_date', '<=', start_date)
            .andWhere('bookings.end_date', '>=', end_date)
            .andWhere('bookings.group_zone_id', '=', group_zone_id);

        if (booking1[0]) {
            msg = '*This zone is already booked ,change it please or change date of Booking!';
            return response.redirect('/booking/create');
        }

        if (start_date > end_date) {
            msg = '*Start date must be less than the end date';
            return response.redirect('/booking/create');
        }

        if (validation.fails()) {
            msg = '';
            session.withErrors(validation.messages());
            return response.redirect('/booking/create');
        }
        try {
            msg = '';
            await Booking.create({
                user_id,
                start_date: res.start_date,
                end_date: res.end_date,
                group_zone_id,
            });

            return response.redirect('/booking');
        } catch (e) {
            console.log('Error to give booking: ' + e.name + 'Message: ' + e.message);
        }
    }

    async time({ response, request, view, params }) {
        const time = await Database.select(
                'bookings.id AS idBooking',
                'bookings.start_date',
                'bookings.end_date',
                'bookings.user_id as userId',
                'bookings.group_zone_id as idGZones'
            )
            .from('bookings')
            .where('bookings.user_id', '=', params.userId)
            .andWhere('bookings.group_zone_id', '=', params.idGZones);
        return response.json({
            time,
        });
    }

    async destroy({ response, request, view, params }) {
        const res = await Booking.find(params.id);
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
        const group_zones = await Database.select('group_zones.*').from('group_zones');
        const users = await Database.select('users.id', 'users.firstname', 'users.familyname').from('users');
        const booking = await Database.select(
                'bookings.id AS idBooking',
                'users.firstname',
                'users.familyname',
                'users.id as userId',
                'bookings.start_date',
                'bookings.end_date',
                'group_zones.id AS idZone',
                'group_zones.name as nameGZone'
            )
            .from('bookings')
            .join('users', 'users.id', 'bookings.user_id')
            .join('group_zones', 'group_zones.id', 'bookings.group_zone_id')
            .where({ 'bookings.id': params.id });

        return view.render('gest_aces.booking.update', {
            group_zones,
            zones,
            users,
            booking,
            idBookingsearch: params.id,
        });
    }

    async editUser({ view, params }) {
        const zones = await Database.select('zones.*').from('zones');
        const group_zones = await Database.select('group_zones.*').from('group_zones');
        const users = await Database.select('users.id', 'users.firstname', 'users.familyname').from('users');
        const booking = await Database.select(
                'bookings.id AS idBooking',
                'bookings.*',
                'users.firstname',
                'users.id as userId',
                'users.familyname',
                'group_zones.id AS idZone',
                'group_zones.name as nameGZone'
            )
            .from('bookings')
            .join('users', 'users.id', 'bookings.user_id')
            .join('group_zones', 'group_zones.id', 'bookings.group_zone_id')
            .where({ 'bookings.user_id': params.userId })
            .andWhere({ 'bookings.group_zone_id': params.idGZones });

        return view.render('gest_aces.booking.updateUser', {
            group_zones,
            users,
            booking,
            idGZones: params.idGZones,
            zones,
        });
    }

    async updateUser({ view, params, request, response }) {
        const res = request.all();
        try {
            await Booking.query()
                .where('user_id', '=', params.userId)
                .andWhere('group_zone_id', '=', params.idGZones)
                .update({ user_id: res.user_id, group_zone_id: res.group_zone_id });
            return response.redirect('/booking');
        } catch (e) {
            return response.status(500).json({ error: '  Error:  ' + e.name + '  Message: ' + e.message });
        }
    }

    async update({ view, params, request, response }) {
        const res = request.all();
        if (res.start_date > res.end_date) {
            msg = '*Start date must be less than the end date';
            return response.redirect('/booking/' + params.id + '/edit/');
        }

        try {
            msg = '';
            const booking = await Booking.find(params.id);
            booking.user_id = res.user_id;
            booking.start_date = res.start_date;
            booking.end_date = res.end_date;
            booking.group_zone_id = res.group_zone_id;
            await booking.save();
            return response.redirect('/booking');
        } catch (e) {
            return response.status(500).json({ error: '  Error:  ' + e.name + '  Message: ' + e.message });
        }
    }

    async deleteall({ response, request, view, params }) {
        await Booking.query()
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

module.exports = BookingController;
