'use strict'

const Database = use("Database");
const Displacement = use("App/Models/Displacement");

class DisplacementController {

  async index({ view, params }) {
    const page = params.page ? params.page : 1;
    const displacements = await Database.select("displacements.*","users.firstname","users.familyname").from("displacements")
    .leftJoin('users', 'users.id', 'displacements.user_id').paginate(page, 10);
    
    for(var i=0;i<displacements.data.length;i++){
      
        displacements.data[i].dateInDisplacement = dateMaker(displacements.data[i].dateInDisplacement)
        displacements.data[i].dateOutDisplacement = dateMaker(displacements.data[i].dateOutDisplacement)
    }
    return view.render("gestion_rh.displacement.index", {
        displacements:displacements,
        page:page
    });
  }
  async create({view,params }) {
    const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
    .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
    .leftJoin('roles', 'user_roles.role_id', 'roles.id')
    .groupBy('users.id')
    return view.render("gestion_rh.displacement.create",{users:users});
  }
  async store({request,response}) {
    const { dateInDisplacement,dateOutDisplacement,user,} = request.all();
    const displacement  = new Displacement();
    displacement.dateInDisplacement=dateInDisplacement;
    displacement.dateOutDisplacement=dateOutDisplacement ;
    displacement.user_id=user;

    await displacement.save().then(function () {
      console.log("a displacement has been add")
    });
    
    
    return response.redirect("/displacement/list");
  }

  async edit({ response, request, view, params }) {
    const { id }  =  params
    console.log(id)
    const displacement = await Displacement.findOrFail(id);
    displacement.dateInDisplacement  = dateInputMaker(displacement.dateInDisplacement )
    displacement.dateOutDisplacement  = dateInputMaker(displacement.dateOutDisplacement )
    const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
    .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
    .leftJoin('roles', 'user_roles.role_id', 'roles.id')
    .groupBy('users.id')
    return view.render("gestion_rh.displacement.update", {users:users, displacement : displacement,id : id});    
  }
  async update({request,response}) {
     
      const {id,user,dateInDisplacement,dateOutDisplacement } = request.all();
      const displacement = await Displacement.findOrFail(id);
    
      if(user!='' && user != undefined){
        displacement.user_id=user;
      }
      if(dateInDisplacement!='' && dateInDisplacement != undefined){
        displacement.dateInDisplacement = dateInDisplacement;
      }
      if(dateOutDisplacement !='' && dateOutDisplacement  != undefined){
        displacement.dateOutDisplacement  = dateOutDisplacement ;
      }
      await displacement.save().then(function () {
        console.log("A displacement has been updated")
      });
      return response.redirect("/displacement/list"); 
  }  
  async delete({ response, request, view, params }) {
    const { id } = params
      const displacement = await Displacement.findOrFail(id)
      await displacement.delete()
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

module.exports = DisplacementController
