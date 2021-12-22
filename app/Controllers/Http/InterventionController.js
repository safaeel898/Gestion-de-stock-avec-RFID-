'use strict'

const Database = use("Database");
const Intervention = use("App/Models/Intervention");

class InterventionController {

  async index({ view, params }) {
    const page = params.page ? params.page : 1;
    const interventions = await Database.select("interventions.*","users.firstname","users.familyname").from("interventions")
    .leftJoin('users', 'users.id', 'interventions.user_id').paginate(page, 10);
    
    for(var i=0;i<interventions.data.length;i++){
      
        interventions.data[i].dateInIntervention = dateMaker(interventions.data[i].dateInIntervention)
        interventions.data[i].dateOutIntervention = dateMaker(interventions.data[i].dateOutIntervention)
    }
    return view.render("gestion_rh.intervention.index", {
        interventions:interventions,
        page:page
    });
  }
  async create({view,params }) {
    const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
    .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
    .leftJoin('roles', 'user_roles.role_id', 'roles.id')
    .groupBy('users.id')
    return view.render("gestion_rh.intervention.create",{users:users});
  }
  async store({request,response}) {
    const { dateInIntervention,dateOutIntervention,timeInIntervention,timeOutIntervention,user,} = request.all();
    const intervention  = new Intervention();
    intervention.dateInIntervention=dateInIntervention;
    intervention.dateOutIntervention=dateOutIntervention;
    intervention.timeInIntervention=timeInIntervention ;
    intervention.timeOutIntervention=timeOutIntervention;
    intervention.user_id=user;

    await intervention.save().then(function () {
      console.log("a intervention has been add")
    });
    
    
    return response.redirect("/intervention/list");
  }

  async edit({ response, request, view, params }) {
    const { id }  =  params
    console.log(id)
    const intervention = await Intervention.findOrFail(id);
    intervention.dateInIntervention  = dateInputMaker(intervention.dateInIntervention )
    intervention.dateOutIntervention  = dateInputMaker(intervention.dateOutIntervention )
    const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
    .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
    .leftJoin('roles', 'user_roles.role_id', 'roles.id')
    .groupBy('users.id')
    return view.render("gestion_rh.intervention.update", {users:users, intervention : intervention,id : id});    
  }
  async update({request,response}) {
     
      const {id,user,dateInIntervention,dateOutIntervention,timeInIntervention,timeOutIntervention } = request.all();
      const intervention = await Intervention.findOrFail(id);
    
      if(user!='' && user != undefined){
        intervention.user_id=user;
      }
      if(dateInIntervention!='' && dateInIntervention != undefined){
        intervention.dateInIntervention = dateInIntervention;
      }
      if(dateOutIntervention!='' && dateOutIntervention != undefined){
        intervention.dateOutIntervention = dateOutIntervention;
      }
      if(timeInIntervention !='' && timeInIntervention  != undefined){
        intervention.timeInIntervention  = timeInIntervention ;
      }
      if(timeOutIntervention !='' && timeOutIntervention  != undefined){
        intervention.timeOutIntervention  = timeOutIntervention ;
      }

      await intervention.save().then(function () {
        console.log("A intervention has been updated")
      });
      return response.redirect("/intervention/list"); 
  }  
  async delete({ response, request, view, params }) {
    const { id } = params
      const intervention = await Intervention.findOrFail(id)
      await intervention.delete()
      .then((data)=>  {return response.status(200).send({ data: 'yes' })})
      .catch(e => {
        return response.status(500).json({"error":e})
    });
    }
}

function dateMaker(d){
  var date = new Date(d)
  var day = date.getDate()
  var month = (date.getMonth()+1)+''
  if (month.length ==1){
    month = '0'+ month
  }
  var year = date.getFullYear()
  return day + "-" + month + "-" + year
}

function dateInputMaker(d){
  var date = new Date(d)
  var day = date.getDate()+''
  var month = (date.getMonth()+1)+''
  if (month.length ==1){
    month = '0'+ month
  }
  if (day.length ==1){
    day = '0'+ day
  }
  var year = date.getFullYear()
  return  year + "-" + month  + "-" + day
}


module.exports = InterventionController
