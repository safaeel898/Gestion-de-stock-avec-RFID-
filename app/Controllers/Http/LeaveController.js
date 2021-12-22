"use strict";

const moment = require('moment')
const Database = use("Database");
const Leave = use("App/Models/Leave");


class LeaveController {

  async index({ view, params }) {
        
    console.log("index works")
    return view.render("gestion_rh.leave.index");

      }
      
  async leaveapi({ response, request}){
    console.log("leaveapi works")
    const res = await request.body;
    const search = res.search.value;
    const orderFields = ['type','duration','startDate','endDate','user'];
    const totalLeave = await Leave.getCount();
    const leaves = await Database.select("leaves.*","users.firstname","users.familyname").from("leaves")
    .leftJoin('users', 'users.id', 'leaves.user_id')
    .where('users.firstname', 'like', '%' + search + '%')
    .orWhere('users.familyname', 'like', '%' + search + '%')
  .orWhere('leaves.type', 'like', '%' + search + '%')
  .orWhere('leaves.duration', 'like', '%' + search + '%')
  .orWhere('leaves.startDate', 'like', '%' + DateFormaterFunction(search) + '%')
  .orWhere('leaves.endDate', 'like', '%' + DateFormaterFunction(search) + '%')
    .groupBy('leaves.id')
    .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
    .limit(parseInt(res.length, 10))
    .offset(parseInt(res.start, 10));


    return response.json({
      draw: parseInt(res.draw, 10),
      recordsTotal: totalLeave,
      recordsFiltered: search ? leaves.length : totalLeave, 
      data: leaves,
  });
}                                   

      async create({view,params }) {
        const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
        .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
        .leftJoin('roles', 'user_roles.role_id', 'roles.id')
        .where('users.status', 1)
        .groupBy('users.id')
        return view.render("gestion_rh.leave.create",{users:users});
      }
      async store({request,response}) {
        const {type,duration,startDate,endDate,user} = request.all();
        const leave = new Leave();
        leave.type=type;
        leave.duration=duration;
        leave.startDate=startDate;
        leave.endDate=endDate;
        leave.user_id=user;

        await leave.save().then(function () {
          console.log("a leave has been add")
        });
        
        
        return response.redirect("/leave");
      }

      async edit({ response, request, view, params }) {
        const { id }  =  params
        console.log(id)
        const leave = await Leave.find(id);
        
        leave.startDate = dateInputMaker(leave.startDate)  
        leave.endDate = dateInputMaker(leave.endDate)       
     
        
        
        const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
        .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
        .leftJoin('roles', 'user_roles.role_id', 'roles.id')
        .where('users.status', 1)
        .groupBy('users.id')

        return view.render("gestion_rh.leave.update", {users:users, leave : leave,id : id});    
      
      }
    
      
      async update({request,response}) {
         
          const {id,user,type,duration,startDate,endDate} = request.all();

          const leave = await Leave.find(id);
          
          if(user!='' && user != undefined){
            leave.user_id=user;
          }

          if(type!='' && type != undefined){
           leave.type = type;
          }
    
          if(duration!='' && duration != undefined){
           leave.duration = duration;
          }

          if(startDate!='' && startDate != undefined){
            leave.startDate = startDate;
           }

           if(endDate!='' && endDate != undefined){
            leave.endDate = endDate;
           }
 
         
          await leave.save().then(function () {
            console.log("A leave has been updated")
          });
    
          return response.redirect("/leave");
        
      }
      
 
      async destroy({ response, request, view, params }) {
        const { id } = params
          const leave = await Leave.find(id)
          await leave.delete()
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

module.exports = LeaveController;