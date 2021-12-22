"use strict";

const Database = use("Database");
const Training = use("App/Models/Training");


class TrainingController {

    async index({ view, params }) {
        const page = params.page ? params.page : 1;
        const trainings = await Database.select("trainings.*","users.firstname","users.familyname").from("trainings")
        .leftJoin('users', 'users.id', 'trainings.user_id').paginate(page, 10);
        
        for(var i=0;i<trainings.data.length;i++){
          
          trainings.data[i].dateInTraining = dateMaker(trainings.data[i].dateInTraining)
          trainings.data[i].dateOutTraining = dateMaker(trainings.data[i].dateOutTraining)

        }
        return view.render("gestion_rh.training.index", {
            trainings:trainings,
            page:page
        });
      }
      async create({view,params }) {
        const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
        .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
        .leftJoin('roles', 'user_roles.role_id', 'roles.id')
        .groupBy('users.id')
        return view.render("gestion_rh.training.create",{users:users});
      }
      async store({request,response}) {
        const {dateInTraining,dateOutTraining,user} = request.all();
        const training = new Training();
        training.dateInTraining=dateInTraining;
        training.dateOutTraining=dateOutTraining;
        training.user_id=user;
  

        await training.save().then(function () {
          console.log("a tarining has been add")
        });
        
        
        return response.redirect("/training/list");
      }

      async edit({ response, request, view, params }) {
        const { id }  =  params
        console.log(id)
        const training = await Training.find(id);
        
        training.dateInTraining = dateInputMaker(training.dateInTraining)   
        training.dateOutTraining = dateInputMaker(training.dateOutTraining)       
    
        
        
        const users = await Database.select('users.*',Database.raw('GROUP_CONCAT(roles.title) as roles' )).from('users')
        .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
        .leftJoin('roles', 'user_roles.role_id', 'roles.id')
        .groupBy('users.id')

        return view.render("gestion_rh.training.update", {users:users, training : training ,id : id});    
      
      }
    
      
      async update({request,response}) {
         
    
          const {id,user,dateInTraining,dateOutTraining} = request.all();

         

          
          const training = await Training.find(id);
          
        
          if(user!='' && user != undefined){
            training.user_id=user;
          }

          if(dateInTraining!='' && dateInTraining != undefined){
            training.dateInTraining = dateInTraining;
          }
    
          if(dateOutTraining!='' && dateOutTraining != undefined){
            training.dateOutTraining = dateOutTraining;
          }
    
        
          
         
          await training.save().then(function () {
            console.log("A training has been updated")
          });
    
          return response.redirect("/training/list");
        
      }
      
 
      async delete({ response, request, view, params }) {
        const { id } = params
          const training = await Training.find(id)
          await training.delete()
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
module.exports = TrainingController;