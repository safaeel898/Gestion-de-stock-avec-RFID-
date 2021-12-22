'use strict';

const View = use('View');
const Database = use('Database');
const Subscriptions = use('App/Models/Subscriptions');
const validatorSubscriptions = use('App/Validators/Subscriptions');
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
class SubscriptionController {
    index({ view }) {
        return view.render('gest_aces.subscription.index');
    }

    async subscriptionapi({ response, request, view, params }) {
        const res = await request.body;
        const search = res.search.value;
        const orderFields = ['type', 'start_date', 'end_date', 'name', 'familyname'];
        const totalSubscriptions = await Subscriptions.getCount();
        const subscriptions = await Database.select(
                'subscriptions.id AS idSubscription',
                'users.firstname',
                'users.familyname',
                'subscriptions.start_date',
                'subscriptions.end_date',
                'group_zone_zones.id',
                'group_zones.name',
                'type_subscriptions.type',
                'group_zone_zones.group_zone_id '
            )
            .from('subscriptions')
            .join('users', 'users.id', 'subscriptions.user_id')
            .join('type_subscriptions', 'type_subscriptions.id', 'subscriptions.type_subscription_id')
            .join('group_zone_zones', 'group_zone_zones.group_zone_id', 'subscriptions.group_zone_id')
            .join('group_zones', 'group_zones.id', 'group_zone_zones.group_zone_id')
            .where(function() {
                this.where('users.firstname', 'like', '%' + search + '%');
            })
            .orWhere('users.familyname', 'like', '%' + search + '%')
            .orWhere('subscriptions.start_date', 'like', '%' + search + '%')
            .orWhere('subscriptions.end_date', 'like', '%' + search + '%')
            .orWhere('group_zones.name', 'like', '%' + search + '%')
            .orWhere('type_subscriptions.type', 'like', '%' + search + '%')
            .groupBy('subscriptions.id')
            .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
            .limit(parseInt(res.length, 10))
            .offset(parseInt(res.start, 10));

        return response.json({
            draw: parseInt(res.draw, 10),
            recordsTotal: totalSubscriptions,
            recordsFiltered: search ? subscriptions.length : totalSubscriptions,
            data: subscriptions,
        });
    }

    async create({ response, request, view, params }) {
        const zones = await Database.select('zones.*').from('zones');
        const users = await Database.select('users.id', 'users.firstname', 'users.familyname').from('users');
        const type_subscriptions = await Database.select('type_subscriptions.*').from('type_subscriptions');
        return view.render('gest_aces.subscription.create', {
            users,
            type_subscriptions,
            zones,
        });
    }

    async store({ response, request, view, session, params }) {
        const valider = new validatorSubscriptions();
        const validation = await validateAll(request.all(), valider.rules(), valider.message());
        const { user_id, type_subscription_id, start_date, end_date, group_zone_id } = request.all();
        const subscription = await Database.select('subscriptions.*')
            .from('subscriptions')
            .where('subscriptions.user_id', '=', user_id)
            .andWhere('subscriptions.type_subscription_id', '=', type_subscription_id);

        if (new Date(start_date).getTime() > new Date(end_date).getTime()) {
            msg = '*Start date must be less than the end date';
            return response.redirect('/subscription/create');
        }
        if (subscription[0]) {
            msg = '*This user is already subscribed to this subscription, use it!';
            return response.redirect('/subscription/create');
        }
        if (validation.fails()) {
            msg = '';
            session.withErrors(validation.messages());
            return response.redirect('/subscription/create');
        }
        try {
            msg = '';
            await Subscriptions.create({ user_id, type_subscription_id, start_date, end_date, group_zone_id });
            return response.redirect('/subscription');
        } catch (e) {
            console.log('Error to save subscription: ' + e.name + 'Message: ' + e.message);
        }
    }

    async destroy({ response, request, view, params }) {
        const res = await Subscriptions.find(params.id);
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

        const users = await Database.select('users.id', 'users.firstname', 'users.familyname').from('users');
        const type_subscriptions = await Database.select('type_subscriptions.*').from('type_subscriptions');
        const subscription = await Database.select(
                'subscriptions.id AS idSubscription',
                'subscriptions.user_id',
                'users.firstname',
                'users.familyname',
                'subscriptions.start_date',
                'subscriptions.end_date',
                'group_zones.id',
                'group_zones.name',
                'type_subscriptions.type',
                'type_subscriptions.id AS idd'
            )
            .from('subscriptions')
            .join('users', 'users.id', 'subscriptions.user_id')
            .join('type_subscriptions', 'type_subscriptions.id', 'subscriptions.type_subscription_id')
            .join('group_zones', 'group_zones.id', 'subscriptions.group_zone_id')
            .where({ 'subscriptions.id': params.id });

        return view.render('gest_aces.subscription.update', {
            zones,
            users,
            type_subscriptions,
            subscription,
            idsubscriptionsearch: params.id,
        });
    }

    async update({ view, params, request, response }) {
        const { user_id, type_subscription_id, start_date, end_date, group_zone_id } = request.all();
        if (new Date(start_date).getTime() > new Date(end_date).getTime()) {
            msg = '*Start date must be less than the end date';
            return response.redirect('/subscription/' + params.id + '/edit/');
        }
        try {
            msg = '';
            const subscription = await Subscriptions.find(params.id);
            subscription.user_id = user_id;
            subscription.type_subscription_id = type_subscription_id;
            subscription.start_date = start_date;
            subscription.end_date = end_date;
            subscription.group_zone_id = group_zone_id;
            await subscription.save();
            return response.redirect('/subscription');
        } catch (e) {
            return response.status(500).json({ error: '  Error:  ' + e.name + '  Message: ' + e.message });
        }
    }
}

module.exports = SubscriptionController;
