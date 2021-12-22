'use strict'

const View = use('View');
const moment = require('moment')
const Database = use("Database");
const Delay = use("App/Models/Delay");

class DelayController {

  async index({ view, params }) {
   
    console.log("index works")
    return view.render("gestion_rh.delay.index");
    
  }

  async firstPage({ view}) {

    return view.render('gestion_rh.index');

  }

  async delayapi({ response, request}){
    console.log("delayapi works")
    const res = await request.body;
    const search = res.search.value;
    const orderFields = ['dateDelay', 'duration',  'user'];
    const totalDelay = await Delay.getCount();
    const delays = await Database.select("delays.*","users.firstname","users.familyname").from("delays")
    .leftJoin('users', 'users.id', 'delays.user_id')
    .where('users.firstname', 'like', '%' + search + '%')
    .orWhere('users.familyname', 'like', '%' + search + '%')
  .orWhere('delays.dateDelay', 'like', '%' + DateFormaterFunction(search) + '%')
  .orWhere('delays.duration', 'like', '%' + search + '%')
    .groupBy('delays.id')
    .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
    .limit(parseInt(res.length, 10))
    .offset(parseInt(res.start, 10));


    return response.json({
      draw: parseInt(res.draw, 10),
      recordsTotal: totalDelay,
      recordsFiltered: search ? delays.length : totalDelay,
      data: delays,
  });

  }
  async create({view,params }) {
    const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
    .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
    .leftJoin('roles', 'user_roles.role_id', 'roles.id')
    .where('users.status', 1)
    .groupBy('users.id')
    return view.render("gestion_rh.delay.create",{users:users});
  }
  async store({request,response}) {
    const { dateDelay,duration,user,} = request.all();
    const delay  = new Delay();
    delay.dateDelay=dateDelay;
    delay.duration=duration;
    delay.user_id=user;

    console.log("store works")

    await delay.save().then(function () {
      console.log("a delay has been add")
    });
    
    
    return response.redirect("/delay");
  }

  async edit({ response, request, view, params }) {
    //const { id }  =  params
    const delay = await Delay.findOrFail(params.id);
    console.log("edit works")
    delay.dateDelay = dateInputMaker(delay.dateDelay)
    
    const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
    .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
    .leftJoin('roles', 'user_roles.role_id', 'roles.id')
    .where('users.status', 1)
    .groupBy('users.id')
    console.log(delay)
    return view.render("gestion_rh.delay.update", {users:users, delay : delay,id : params.id});    
  }

  
  async update({request,response}) {
     
    console.log("update works")
      const {id,user,dateDelay,duration} = request.all();
      
      const delay = await Delay.findOrFail(id);
      
    
      if(user!='' && user != undefined){
        delay.user_id=user;
      }

      if(dateDelay!='' && dateDelay != undefined){
        delay.dateDelay = dateDelay;
      }

      if(duration!='' && duration != undefined){
        delay.duration = duration;
      }
      
      await delay.save().then(function () {
        console.log("A delay has been updated")
      });

      return response.redirect("/delay");
    
  }
  

  async destroy({ response, request, view, params }) {
    const { id } = params
      const delay = await Delay.findOrFail(id)
      await delay.delete()
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

module.exports = DelayController
