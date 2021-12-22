'use strict'

const moment = require('moment')
const Database = use("Database");
const Holiday = use("App/Models/Holiday");

class HolidayController {

  async index({ view, params }) {
    // const page = params.page ? params.page : 1;
    // const holidays = await Database.select("holidays.*","users.firstname","users.familyname").from("holidays")
    // .leftJoin('users', 'users.id', 'holidays.user_id').paginate(page, 10);
    
    // for(var i=0;i<holidays.data.length;i++){
      
    //     holidays.data[i].dateInHolidays = dateMaker(holidays.data[i].dateInHolidays)
    //     holidays.data[i].dateOutHolidays = dateMaker(holidays.data[i].dateOutHolidays)
    // }
    // return view.render("gestion_rh.holiday.index", {
    //     holidays:holidays,
    //     page:page
    // });
    console.log("index works")
    return view.render("gestion_rh.holiday.index");
  }

  async holidayapi({ response, request}){
    console.log("holidayapi works")
    const res = await request.body;
    const search = res.search.value;
    const orderFields = [ 'dateInHolidays', 'dateOutHolidays','durationHolidays','typeHolidays', 'user'];
    const totalHoliday = await Holiday.getCount();
    const holidays = await Database.select("holidays.*","users.firstname","users.familyname").from("holidays")
    .leftJoin('users', 'users.id', 'holidays.user_id')
    .where('users.firstname', 'like', '%' + search + '%')
    .orWhere('users.familyname', 'like', '%' + search + '%')
    .orWhere('holidays.durationHolidays', 'like', '%' + search + '%')
  .orWhere('holidays.dateInHolidays', 'like', '%' + DateFormaterFunction(search) + '%')
  .orWhere('holidays.dateOutHolidays', 'like', '%' + DateFormaterFunction(search) + '%')
  .orWhere('holidays.typeHolidays', 'like', '%' + search + '%')
    .groupBy('holidays.id')
    .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
    .limit(parseInt(res.length, 10))
    .offset(parseInt(res.start, 10));


    return response.json({
      draw: parseInt(res.draw, 10),
      recordsTotal: totalHoliday,
      recordsFiltered: search ? holidays.length : totalHoliday, 
      data: holidays,
  });
}

  async create({view,params }) {
    const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
    .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
    .leftJoin('roles', 'user_roles.role_id', 'roles.id')
    .where('users.status', 1)
    .groupBy('users.id')
    return view.render("gestion_rh.holiday.create",{users:users});
  }
  async store({request,response}) {
    const { durationHolidays,dateInHolidays,dateOutHolidays,user,typeHolidays} = request.all();
    const holiday  = new Holiday();
    holiday.durationHolidays=durationHolidays;
    holiday.dateInHolidays=dateInHolidays;
    holiday.dateOutHolidays=dateOutHolidays ;
    holiday.typeHolidays=typeHolidays ;
    holiday.user_id=user;

    await holiday.save().then(function () {
      console.log("a holiday has been add")
    });
    
    
    return response.redirect("/holiday");
  }

  async edit({ response, request, view, params }) {
  
      const { id }  =  params
      console.log(id)
      const holiday = await Holiday.findOrFail(id);
      holiday.dateInHolidays  = dateInputMaker(holiday.dateInHolidays )
      holiday.dateOutHolidays  = dateInputMaker(holiday.dateOutHolidays )
      const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .where('users.status', 1)
      .groupBy('users.id')
      return view.render("gestion_rh.holiday.update", {users:users, holiday : holiday,id : id});
     
  }
  async update({request,response}) {
     
      const {id,user,durationHolidays,dateInHolidays,dateOutHolidays,typeHolidays } = request.all();
      const holiday = await Holiday.findOrFail(id);
    
      if(user!='' && user != undefined){
        holiday.user_id=user;
      }
      if(durationHolidays!='' && durationHolidays != undefined){
        holiday.durationHolidays = durationHolidays;
      }
      if(typeHolidays!='' && typeHolidays != undefined){
        holiday.typeHolidays = typeHolidays;
      }
      if(dateInHolidays!='' && dateInHolidays != undefined){
        holiday.dateInHolidays = dateInHolidays;
      }
      if(dateOutHolidays !='' && dateOutHolidays  != undefined){
        holiday.dateOutHolidays  = dateOutHolidays ;
      }
      await holiday.save().then(function () {
        console.log("A holiday has been updated")
      });
      return response.redirect("/holiday"); 
  }  
  async destroy({ response, request, view, params }) {
    const { id } = params
      const holiday = await Holiday.findOrFail(id)
      await holiday.delete()
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

module.exports = HolidayController
