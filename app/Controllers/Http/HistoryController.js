'use strict';

const View = use('View');
const Database = use('Database');
const History = use('App/Models/HistorysAc');

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

class HistoryController {
    index({ view }) {
        return view.render('gest_aces.history.index');
    }

    async historyapi({ response, request, view, params }) {
        const res = await request.body;
        const search = res.search.value;
        const orderFields = ['reader_name', 'date_time', 'familyname'];
        const totalHistory = await History.getCount();
        const history = await Database.select(
                'users.firstname',
                'users.id as idUser',
                'users.familyname',
                'historys_acs.date_time',
                'historys_acs.reader_name',
                'historys_acs.id'
            )
            .from('historys_acs')
            .join('users', 'users.id', 'historys_acs.user_id')
            .where(function() {
                this.where('users.firstname', 'like', '%' + search + '%');
            })
            .orWhere('users.familyname', 'like', '%' + search + '%')
            .orWhere('historys_acs.date_time', 'like', '%' + search + '%')
            .orWhere('historys_acs.reader_name', 'like', '%' + search + '%')
            .groupBy('historys_acs.id')
            .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
            .limit(parseInt(res.length, 10))
            .offset(parseInt(res.start, 10));

        return response.json({
            draw: parseInt(res.draw, 10),
            recordsTotal: totalHistory,
            recordsFiltered: search ? history.length : totalHistory,
            data: history,
        });
    }

    async store(user_id, date_time, reader_name) {
        try {
            await History.create({ user_id, date_time, reader_name });
        } catch (e) {
            console.log('Error to save history: ' + e.name + 'Message: ' + e.message);
        }
    }

    async destroy({ response, request, view, params }) {
        const res = await History.find(params.id);
        await res
            .delete()
            .then((data) => {
                return response.status(200).send({ data: 'yes' });
            })
            .catch((e) => {
                console.log('Error to save subscription: ' + e.name + 'Message: ' + e.message);
            });
    }
}

module.exports = HistoryController;
