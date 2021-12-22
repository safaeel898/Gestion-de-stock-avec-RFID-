'use strict';

const Database = use('Database');
const Client = use('App/Models/Client');

class ClientController {
    async index({ view, params }) {
        const page = params.page ? params.page : 1;
        const client = await Database.from('clients').paginate(page, 10);
        return view.render('dashboard.client.index', {
            clients: client,
            page: page,
        });
    }

    async create({ response, request, view, params }) {
        return view.render('dashboard.client.create');
    }

    async store({ request, response }) {
        const { firstname, familyname, email, address, phonenumber } = request.all();
        const client = new Client();
        client.firstname = firstname;
        client.familyname = familyname;
        client.email = email;
        client.address = address;
        client.phonenumber = phonenumber;
        await client.save().then(function() {
            console.log('A client has been added !');
        });
        return response.redirect('/client/list');
    }

    async edit({ response, request, view, params }) {
        const { id } = params;
        const client = await Client.find(id);
        return view.render('dashboard.client.update', { client: client, id: id });
    }

    async update({ request, response }) {
        //console.log("i am here !")

        const { id, firstname, familyname, email, phonenumber, address } = request.all();
        const client = await Client.find(id);

        if (firstname != '' && firstname != undefined) {
            client.firstname = firstname;
        }

        if (familyname != '' && familyname != undefined) {
            client.familyname = familyname;
        }

        if (email != '' && email != undefined) {
            client.email = email;
        }

        if (phonenumber != '' && phonenumber != undefined) {
            client.phonenumber = phonenumber;
        }

        if (address != '' && address != undefined) {
            client.address = address;
        }

        await client.save().then(function() {
            console.log('A client has been updated');
        });

        return response.redirect('/client/list');
    }

    async delete({ response, request, view, params }) {
        const { id } = params;
        const client = await Client.find(id);
        await client
            .delete()
            .then((data) => {
                return response.status(200).send({ data: 'yes' });
            })
            .catch((e) => {
                return response.status(500).json({ error: e });
            });
    }
}

module.exports = ClientController;
