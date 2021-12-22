'use strict'

const moment = require('moment')
const Database = use("Database");
const AdditionalHour = use("App/Models/AdditionalHour");

class AdditionalHourController {

  async index({ view }) {
    
    console.log("index works")
    return view.render("gestion_rh.additionalHour.index");
  }

  async additionalHourapi({ response, request}){
    console.log("additionalHourapi works")
    const res = await request.body;
    const search = res.search.value;
    const orderFields = ['nbrHours', 'dateAdditionalHours',  'user'];
    const totalAdditionalHour = await AdditionalHour.getCount();
    const additionalHours = await Database.select("additional_hours.*","users.firstname","users.familyname").from("additional_hours")
    .leftJoin('users', 'users.id', 'additional_hours.user_id')
    .where('users.firstname', 'like', '%' + search + '%')
    .orWhere('users.familyname', 'like', '%' + search + '%')
  .orWhere('additional_hours.dateAdditionalHours', 'like', '%' + DateFormaterFunction(search) + '%')
  .orWhere('additional_hours.nbrHours', 'like', '%' + search + '%')
    .groupBy('additional_hours.id')
    .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
    .limit(parseInt(res.length, 10))
    .offset(parseInt(res.start, 10));


    return response.json({
      draw: parseInt(res.draw, 10),
      recordsTotal: totalAdditionalHour,
      recordsFiltered: search ? additionalHours.length : totalAdditionalHour,
      data: additionalHours,
  });
}

  async create({view,params }) {
    const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
    .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
    .leftJoin('roles', 'user_roles.role_id', 'roles.id')
    .where('users.status', 1)
    .groupBy('users.id')
    return view.render("gestion_rh.additionalHour.create",{users:users});
  }
  async store({request,response}) {
    const { dateAdditionalHours,nbrHours,user,} = request.all();
    const additionalHour  = new AdditionalHour();
    additionalHour.nbrHours=nbrHours ;
    additionalHour.dateAdditionalHours=dateAdditionalHours;
    additionalHour.user_id=user;

    await additionalHour.save().then(function () {
      console.log("a additionalHour has been add")
    });
    
    
    return response.redirect("/additionalHour");
  }

  async edit({ response, request, view, params }) {
    const { id }  =  params
    console.log(id)
    const additionalHour = await AdditionalHour.findOrFail(id);
    additionalHour.dateAdditionalHours  = dateInputMaker(additionalHour.dateAdditionalHours )
    const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
    .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
    .leftJoin('roles', 'user_roles.role_id', 'roles.id')
    .where('users.status', 1)
    .groupBy('users.id')
    return view.render("gestion_rh.additionalHour.update", {users:users, additionalHour : additionalHour,id : id});    
  }
  async update({request,response}) {
     
      const {id,user,nbrHours,dateAdditionalHours } = request.all();
      const additionalHour = await AdditionalHour.findOrFail(id);
    
      if(user!='' && user != undefined){
        additionalHour.user_id=user;
      }

      if(nbrHours !='' && nbrHours  != undefined){
        additionalHour.nbrHours  = nbrHours ;
      }

      if(dateAdditionalHours!='' && dateAdditionalHours != undefined){
        additionalHour.dateAdditionalHours = dateAdditionalHours;
      }
      
      await additionalHour.save().then(function () {
        console.log("A additionalHour has been updated")
      });
      return response.redirect("/additionalHour"); 
  }  
  async destroy({ response, request, view, params }) {
    const { id } = params
      const additionalHour = await AdditionalHour.findOrFail(id)
      await additionalHour.delete()
      .then((data)=>  {return response.status(200).send({ data: 'yes' })})
      .catch(e => {
        return response.status(500).json({"error":e})
    });
    }
}

function DateFormaterFunction(d){
  var x = d.split("/")
  var date = x[2] + "-" + x[1] + "-" + x[0]
  console.log(date)
  return date
}

function dateInputMaker(d){
  var day2 = moment(d).format('YYYY-MM-DD')
  return day2
}

module.exports = AdditionalHourController
