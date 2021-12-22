'use strict'

const moment = require('moment')
const Database = use("Database");
const Pause = use("App/Models/Pause");

class PauseController {

  async index({ view, params }) {

    console.log("index works")
    return view.render("gestion_rh.pause.index");
  }

  async pauseapi({ response, request}){
    console.log("pauseapi works")
    const res = await request.body;
    const search = res.search.value;
    const orderFields = ['timeIn', 'timeOut', 'datePause',  'user'];
    const totalPause = await Pause.getCount();
    const pauses = await Database.select("pauses.*","users.firstname","users.familyname")
    .from("pauses")
    .leftJoin('users', 'users.id', 'pauses.user_id')
    .where('users.firstname', 'like', '%' + search + '%')
  .orWhere('users.familyname', 'like', '%' + search + '%')
  .orWhere('pauses.timeIn', 'like', '%' + search + '%')
  .orWhere('pauses.timeOut', 'like', '%' + search + '%')
  .orWhere('pauses.datePause', 'like', '%' + DateFormaterFunction(search) + '%')
    .groupBy('pauses.id')
    .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
    .limit(parseInt(res.length, 10))
    .offset(parseInt(res.start, 10));

    console.log(pauses)

    return response.json({
      draw: parseInt(res.draw, 10),
      recordsTotal: totalPause,
      recordsFiltered: search ? pauses.length : totalPause, 
      data: pauses,
  });
}

  async create({view,params }) {
    const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
    .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
    .leftJoin('roles', 'user_roles.role_id', 'roles.id')
    .where('users.status', 1)
    .groupBy('users.id')
    return view.render("gestion_rh.pause.create",{users:users});
  }
  async store({request,response}) {
    const { timeIn,timeOut,datePause,user} = request.all();
    const pause  = new Pause();
    pause.timeIn=timeIn;
    pause.timeOut =timeOut;
    pause.datePause=datePause;
    pause.user_id=user;

    await pause.save().then(function () {
      console.log("a pause has been add")
    });
    
    
    return response.redirect("/pause");
  }

  async edit({ response, request, view, params }) {
    const { id }  =  params
    console.log(id)
    const pause = await Pause.findOrFail(id);
    pause.datePause  = dateInputMaker(pause.datePause )
    const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
    .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
    .leftJoin('roles', 'user_roles.role_id', 'roles.id')
    .where('users.status', 1)
    .groupBy('users.id')
    return view.render("gestion_rh.pause.update", {users:users, pause : pause,id : id});    
  }
  async update({request,response}) {
     
      const {id,user,timeIn,timeOut,datePause} = request.all();
      const pause = await Pause.findOrFail(id);
    
      if(user!='' && user != undefined){
        pause.user_id=user;
      }
      if(timeIn!='' && timeIn != undefined){
        pause.timeIn = timeIn;
      }
      if(timeOut!='' && timeOut != undefined){
        pause.timeOut = timeOut;
      }
      if(datePause!='' && datePause != undefined){
        pause.datePause = datePause;
      }
      await pause.save().then(function () {
        console.log("A pause has been updated")
      });
      return response.redirect("/pause"); 
  }  
  async destroy({ response, request, view, params }) {
    const { id } = params
      const pause = await Pause.findOrFail(id)
      await pause.delete()
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

module.exports = PauseController
