"use strict";

const moment = require('moment')
const Database = use("Database");
const Mission = use("App/Models/Mission");


class MissionController {

    async index({ view, params }) {
       
        console.log("index works")
    return view.render("gestion_rh.mission.index");
      }

      async missionapi({ response, request}){
        console.log("missionapi works")
        const res = await request.body;
        const search = res.search.value;
        const orderFields = ['dateInMission', 'dateOutMission', 'timeInMission','timeOutMission',  'type', 'user'];
        const totalMission = await Mission.getCount();
        const missions = await Database.select("missions.*","users.firstname","users.familyname").from("missions")
        .leftJoin('users', 'users.id', 'missions.user_id')
        .where('users.firstname', 'like', '%' + search + '%')
        .orWhere('users.familyname', 'like', '%' + search + '%')
  .orWhere('missions.dateInMission', 'like', '%' + DateFormaterFunction(search) + '%')
  .orWhere('missions.dateOutMission', 'like', '%' + DateFormaterFunction(search) + '%')
  .orWhere('missions.timeInMission', 'like', '%' + search + '%')
  .orWhere('missions.timeOutMission', 'like', '%' + search + '%')
  .orWhere('missions.type', 'like', '%' + search + '%')
        .groupBy('missions.id')
        .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
        .limit(parseInt(res.length, 10))
        .offset(parseInt(res.start, 10));
    
    
        return response.json({
          draw: parseInt(res.draw, 10),
          recordsTotal: totalMission,
          recordsFiltered: search ? missions.length : totalMission, 
          data: missions,
      });
    }
      
    async create({view,params }) {
        const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
        .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
        .leftJoin('roles', 'user_roles.role_id', 'roles.id')
        .where('users.status', 1)
        .groupBy('users.id')
        console.log("createFunction")
        return view.render("gestion_rh.mission.create",{users:users});
      }
      async store({request,response}) {
        const {dateInMission,dateOutMission,timeInMission,timeOutMission,type,user} = request.all();
        const mission= new Mission();
        mission.dateInMission=dateInMission;
        mission.dateOutMission=dateOutMission;
        mission.timeInMission=timeInMission;
        mission.timeOutMission=timeOutMission;
        mission.type=type;
        mission.user_id=user;

        await mission.save().then(function () {
          console.log("a mission has been add")
        });
        console.log("storeFunction")
        
        return response.redirect("/mission");
      }

      async edit({ response, request, view, params }) {
        const { id }  =  params
        console.log(id)
        const mission = await Mission.find(id);
        
       mission.dateInMission = dateInputMaker(mission.dateInMission)     
       mission.dateOutMission = dateInputMaker(mission.dateOutMission)      
        
        const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
        .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
        .leftJoin('roles', 'user_roles.role_id', 'roles.id')
        .where('users.status', 1)
        .groupBy('users.id')

        return view.render("gestion_rh.mission.update", {users:users, mission : mission,id : id});    
      
      }
    
      
      async update({request,response}) {
         
          const {id,user,dateInMission,dateOutMission,timeInMission,timeOutMission,type} = request.all();

          const mission = await Mission.find(id);
          
          if(user!='' && user != undefined){
            mission.user_id=user;
          }

          if(dateInMission!='' && dateInMission != undefined){
           mission.dateInMission = dateInMission;
          }
    
          if(dateOutMission !='' && dateOutMission != undefined){
            mission.dateOutMission = dateOutMission;
          }
          if(timeInMission!='' && timeInMission != undefined){
            mission.timeInMission = timeInMission;
           }
     
           if(timeOutMission !='' && timeOutMission != undefined){
             mission.timeOutMission = timeOutMission;
           }

           if(type !='' && type != undefined){
            mission.type = type;
          }
         
          await mission.save().then(function () {
            console.log("A mission has been updated")
          });
    
          return response.redirect("/mission");
        
      }
      
 
      async destroy({ response, request, view, params }) {
        const { id } = params
          const mission = await Mission.find(id)
          await mission.delete()
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


module.exports = MissionController;