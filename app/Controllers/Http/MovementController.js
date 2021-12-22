'use strict'

const moment = require('moment')
const Database = use("Database");
const Movement = use("App/Models/Movement");

class MovementController {

  async index({ view, params }) {
    console.log("index works")
    return view.render("gestion_rh.movement.index");
    
  }

  async movementapi({ response, request}){
    console.log("movementapi works")
    const res = await request.body;
    const search = res.search.value;
    const orderFields = ['dateMovement', 'timeInMovement', 'timeOutMovement',  'user', 'department'];
    const totalMovement = await Movement.getCount();
    const movements = await Database.select("movements.*","users.firstname","users.familyname","departments.name")
    .from("movements")
    .leftJoin('users', 'users.id', 'movements.user_id')
    .leftJoin('departments', 'departments.id', 'movements.department_id')
    .where('users.firstname', 'like', '%' + search + '%')
    .orWhere('users.familyname', 'like', '%' + search + '%')
    .orWhere('departments.name', 'like', '%' + search + '%')
  .orWhere('movements.dateMovement', 'like', '%' + DateFormaterFunction(search) + '%')
  .orWhere('movements.timeInMovement', 'like', '%' + search + '%')
  .orWhere('movements.timeOutMovement', 'like', '%' + search + '%')
    .groupBy('movements.id')
    .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
    .limit(parseInt(res.length, 10))
    .offset(parseInt(res.start, 10));

    return response.json({
      draw: parseInt(res.draw, 10),
      recordsTotal: totalMovement,
      recordsFiltered: search ? movements.length : totalMovement, 
      data: movements,
  });
}

  async create({view,params }) {
    const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
    .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
    .leftJoin('roles', 'user_roles.role_id', 'roles.id')
    .where('users.status', 1)
    .groupBy('users.id')
    const departments = await Database.select('departments.*').from('departments')
    .groupBy('departments.id')
    console.log("a index is working")
    return view.render("gestion_rh.movement.create",{users:users,departments:departments});
  }
  async store({request,response}) {
    const { dateMovement,timeInMovement,timeOutMovement,user,department} = request.all();
    const movement  = new Movement();
    movement.dateMovement=dateMovement;
    movement.timeInMovement=timeInMovement;
    movement.timeOutMovement=timeOutMovement;
    movement.user_id=user;
    movement.department_id=department;

    await movement.save().then(function () {
      console.log("a movement has been add")
    });
    
    return response.redirect("/movement");
  }

  async edit({ response, request, view, params }) {
    const { id }  =  params
    console.log(id)
    const movement = await Movement.findOrFail(id);
    movement.dateMovement = dateInputMaker(movement.dateMovement)
    const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
    .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
    .leftJoin('roles', 'user_roles.role_id', 'roles.id')
    .where('users.status', 1)
    .groupBy('users.id')
    const departments = await Database.select('departments.*').from('departments')
    .groupBy('departments.id')
    return view.render("gestion_rh.movement.update", {users:users,departments:departments, movement : movement,id : id});    
  }
  async update({request,response}) {
     
      const {id,user,department,dateMovement,timeInMovement,timeOutMovement} = request.all();
      const movement = await Movement.findOrFail(id);
    
      if(user!='' && user != undefined){
        movement.user_id=user;
      }
      if(department!='' && department != undefined){
        movement.department_id=department;
      }
      if(dateMovement!='' && dateMovement != undefined){
        movement.dateMovement = dateMovement;
      }
      if(timeInMovement!='' && timeInMovement != undefined){
        movement.timeInMovement = timeInMovement;
      }
      if(timeOutMovement!='' && timeOutMovement != undefined){
        movement.timeOutMovement = timeOutMovement;
      }
      await movement.save().then(function () {
        console.log("A movement has been updated")
      });
      return response.redirect("/movement"); 
  }  
  async destroy({ response, request, view, params }) {
    const { id } = params
      const movement = await Movement.findOrFail(id)
      await movement.delete()
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

module.exports = MovementController