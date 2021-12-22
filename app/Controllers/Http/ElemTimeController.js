'use strict';

const Database = use('Database');
const ElemTime = use('App/Models/ElemTime');
class ElemTimeController {
    index({ view }) {
        return view.render('gest_aces.schedule_time.index');
    }

    async elementtimeapi({ response, request, view, params }) {
        const res = await request.body;
        const search = res.search.value;
        const orderFields = ['start_date', 'end_date', 'day_week', 'repeat_by'];
        const totalElemTime = await ElemTime.getCount();
        const elements = await Database.select('elem_times.*')
            .from('elem_times')
            .where('elem_times.repeat_by', 'like', '%' + search + '%')
            .orWhere('elem_times.day_week', 'like', '%' + search + '%')
            .orWhere('elem_times.start_date', 'like', '%' + search + '%')
            .orWhere('elem_times.end_date', 'like', '%' + search + '%')
            .groupBy('elem_times.id')
            .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
            .limit(parseInt(res.length, 10))
            .offset(parseInt(res.start, 10));

        return response.json({
            draw: parseInt(res.draw, 10),
            recordsTotal: totalElemTime,
            recordsFiltered: search ? elements.length : totalElemTime,
            data: subscriptions,
        });
    }

    async create({ response, request, view, params }) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const repeat_by = ['Only', 'Day', 'Month', 'Year'];

        return view.render('gest_aces.schedule_time.create', {
            days,
            repeat_by,
        });
    }

    async store({ response, request, view, params }) {
        try {
            const res = request.all();
            await ElemTime.create({
                repeat_by: res.repeat_by,
                day_week: res.days,
                tart_hour: res.h_start,
                end_hour: res.h_end,
            });
            return response.redirect('/elementtime');
        } catch (e) {
            console.log(e);
        }
    }

    async destroy({ response, request, view, params }) {
        const { id } = params;
        const res = await ElemTime.find(id);
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
            const elements = await Database.select('elem_times.*')
                .from('elem_times')
                .where('elem_times.id', id)
                .groupBy('elem_times.id')
                .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
                .limit(parseInt(res.length, 10))
                .offset(parseInt(res.start, 10));

            return view.render('gest_aces.schedule_time.update', {
                elements,
                id,
            });
        } catch (e) {
            console.log(e);
        }
    }

    async update({ view, params, request, response }) {
        try {
            const { id } = params;
            const element = await scheduleTime.find(id);
            const res = request.all();
            console.log(res);
            (element.repeat_by = res.repeat_by),
            (element.day_week = res.days),
            (element.tart_hour = res.h_start),
            (element.end_hour = res.h_end),
            (element.user_id = res.user),
            (element.group_accesses_id = res.group_acs);
            await element.save();
            return response.redirect('/schedule');
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = ElemTimeController;
