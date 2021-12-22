'use strict'

const moment = require('moment')
const Database = use("Database");
const Absence = use("App/Models/Absence");


class AbsenceController {

  async index({ view, params }) {
    
    console.log("index works")
    return view.render("gestion_rh.absence.index");
  }

  async absenceapi({ response, request}){
    console.log("absenceapi works")
    const res = await request.body;
    const search = res.search.value;
    const orderFields = ['dateAbsence', 'user'];
    const totalAbsence = await Absence.getCount();
    const absences = await Database.select("absences.*","users.firstname","users.familyname").from("absences")
    .leftJoin('users', 'users.id', 'absences.user_id')
    .where('users.firstname', 'like', '%' + search + '%')
    .orWhere('users.familyname', 'like', '%' + search + '%')
  .orWhere('absences.dateAbsence', 'like', '%' + DateFormaterFunction(search) + '%')
    .groupBy('absences.id')
    .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
    .limit(parseInt(res.length, 10))
    .offset(parseInt(res.start, 10));


    return response.json({
      draw: parseInt(res.draw, 10),
      recordsTotal: totalAbsence,
      recordsFiltered: search ? absences.length : totalAbsence,
      data: absences,
  });
}

  async create({view,params }) {
    const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
    .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
    .leftJoin('roles', 'user_roles.role_id', 'roles.id')
    .where('users.status', 1)
    .groupBy('users.id')
    return view.render("gestion_rh.absence.create",{users:users});
  }
  async store({request,response}) {
    const { dateAbsence,user,} = request.all();
    const absence  = new Absence();
    absence.dateAbsence=dateAbsence;
    absence.user_id=user;

    await absence.save().then(function () {
      console.log("a absence has been add")
    });
    
    
    return response.redirect("/absence");
  }

  async edit({ response, request, view, params }) {
    const { id }  =  params
    console.log(id)
    const absence = await Absence.findOrFail(id);
    absence.dateAbsence = dateInputMaker(absence.dateAbsence)
    const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
    .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
    .leftJoin('roles', 'user_roles.role_id', 'roles.id')
    .where('users.status', 1)
    .groupBy('users.id')
    return view.render("gestion_rh.absence.update", {users:users, absence : absence,id : id});    
  }
  async update({request,response}) {
     
      const {id,user,dateAbsence} = request.all();
      const absence = await Absence.findOrFail(id);
    
      if(user!='' && user != undefined){
        absence.user_id=user;
      }
      
      if(dateAbsence!='' && dateAbsence != undefined){
        absence.dateAbsence = dateAbsence;
      }
      await absence.save().then(function () {
        console.log("A absence has been updated")
      });
      return response.redirect("/absence"); 
  }  
  async destroy({ response, request, view, params }) {
    const { id } = params
      const absence = await Absence.findOrFail(id)
      await absence.delete()
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

module.exports = AbsenceController
