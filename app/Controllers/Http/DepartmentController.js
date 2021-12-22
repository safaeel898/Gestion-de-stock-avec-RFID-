'use strict'

const Database = use("Database");
const Department = use("App/Models/Department");

class DepartmentController {

  async index({ view, params }) {
    
    console.log("index works")
    return view.render("gestion_rh.department.index");
  }

  async departmentapi({ response, request}){
    console.log("departmentapi works")
    const res = await request.body;
    const search = res.search.value;
    const orderFields = ['name'];
    const totalDepartment = await Department.getCount();
    const departments = await Database.select("departments.*").from("departments")
    .where('departments.name', 'like', '%' + search + '%')
    .groupBy('departments.id')
    .orderBy(orderFields[parseInt(res.order[0].column)], res.order[0].dir)
    .limit(parseInt(res.length, 10))
    .offset(parseInt(res.start, 10));


    return response.json({
      draw: parseInt(res.draw, 10),
      recordsTotal: totalDepartment,
      recordsFiltered: search ? departments.length : totalDepartment,
      data: departments,
  });
}

  async create({view,params }) {
   
    return view.render("gestion_rh.department.create");
  }
  async store({request,response}) {
    const { name} = request.all();
    const department = new Department();
    department.name=name;

    await department.save().then(function () {
      console.log("a department has been add")
    });
    
    
    return response.redirect("/department");
  }

  async edit({ response, request, view, params }) {
  
      const { id }  =  params
      console.log(id)
      const department = await Department.findOrFail(id);
     
      return view.render("gestion_rh.department.update", {department : department,id : id});
     
  }
  async update({request,response}) {
     
      const {id,name} = request.all();
      const department = await Department.findOrFail(id);
    
     
      if(name!='' && name != undefined){
        department.name = name;
      }
     
    
      await department.save().then(function () {
        console.log("A department has been updated")
      });
      return response.redirect("/department"); 
  }  
  async destroy({ response, request, view, params }) {
    const { id } = params
      const department = await Department.findOrFail(id)
      await department.delete()
      .then((data)=>  {return response.status(200).send({ data: 'yes' })})
      .catch(e => {
        return response.status(500).json({"error":e})
    });
    }
}



module.exports = DepartmentController