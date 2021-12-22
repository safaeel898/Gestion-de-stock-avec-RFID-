'use strict';

const View = use('View');
const Database = use('Database');
const TypeSubscriptions = use('App/Models/TypeSubscription');
const { validateAll } = use('Validator');

const rules = {
    type: 'required|min:4|max:20',
};
const message = {
    'type.required': '*Type subscription name invalid!',
};
var msg = '';
View.global('getMessage', function() {
    return msg;
});
View.global('setMessage', function() {
    return (msg = '');
});

class TypeSubscriptionController {
    async index({ view }) {
        return view.render('gest_aces.type_subscription.index');
    }
    async typesubscriptionapi({ response, request }) {
        const res = await request.body;
        const search = res.search.value;
        const orderFields = ['type'];
        const totalSubscription = await TypeSubscriptions.getCount();
        const type = await Database.select('type_subscriptions.id', 'type_subscriptions.type ')
            .from('type_subscriptions')
            .where('type_subscriptions.type', 'like', '%' + search + '%')
            .groupBy('type_subscriptions.id')
            .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
            .limit(parseInt(res.length, 10))
            .offset(parseInt(res.start, 10));
        return response.json({
            draw: parseInt(res.draw, 10),
            recordsTotal: totalSubscription,
            recordsFiltered: search ? type.length : totalSubscription,
            data: type,
        });
    }

    async create({ view }) {
        return view.render('gest_aces.type_subscription.create');
    }

    async store({ response, request, view, params, session }) {
        const { type } = request.only(['type']);
        const res_type = await Database.select('type_subscriptions.*')
            .from('type_subscriptions')
            .where('type_subscriptions.type', '=', type);
        const validation = await validateAll(request.all(), rules, message);
        if (res_type[0]) {
            msg = '*This type subscription name already registered, use it!';
            return response.redirect('/typesubscription/create/');
        }
        if (validation.fails()) {
            session.withErrors(validation.messages());
            return response.redirect('/typesubscription/create/');
        }
        try {
            const res = request.only(['type']);
            await TypeSubscriptions.create({ type: res.type });
            return response.redirect('/typesubscription');
        } catch (e) {
            console.log('Error to save  type subscription: ' + e.name + ' Message: ' + e.message);
        }
    }

    async destroy({ response, request, view, params }) {
        const { id } = params;
        const res = await TypeSubscriptions.find(id);
        await res
            .delete()
            .then((data) => {
                return response.status(200).send({ data: 'yes' });
            })
            .catch((e) => {
                console.log('Error to delete  type subscription: ' + e.name + ' Message: ' + e.message);
            });
    }

    async edit({ view, params }) {
        try {
            const { id } = params;
            const type = await Database.select('*').from('type_subscriptions').where('id', id);
            return view.render('gest_aces.type_subscription.update', {
                type,
                id,
            });
        } catch (e) {
            console.log('Error to edit  zone: ' + e.name + 'Message: ' + e.message);
        }
    }

    async update({ view, params, request, response, session }) {
        const res = request.only(['type']);
        const res_type = await Database.select('type_subscriptions.*')
            .from('type_subscriptions')
            .where('type_subscriptions.type', '=', res.type);
        const validation = await validateAll(request.all(), rules, message);
        if (res_type[0]) {
            msg = '*This type subscription name already registered, use it!';
            return response.redirect('/typesubscription/' + params.id + '/edit/');
        }
        if (validation.fails()) {
            session.withErrors(validation.messages());
            return response.redirect('/typesubscription/create/');
        }
        try {
            const { id } = params;
            const type = await TypeSubscriptions.find(id);
            type.type = res.type;
            await type.save();
            return response.redirect('/typesubscription');
        } catch (e) {
            console.log('Error to update type subscription: ' + e.name + 'Message: ' + e.message);
        }
    }
}

module.exports = TypeSubscriptionController;
