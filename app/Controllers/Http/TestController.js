'use strict'

const Database = use("Database");
const Mission = use("App/Models/Mission");
const Leave = use("App/Models/Leave");
const check=require("../../Tools/test")


class TestController {
    async index({ request, response }) {
        const { id, name, date } = request.all();
        const rhTest=check.RHTest(id,date)
        const accessTest=check.AccessTest(id,name,date)
        if(rhTest && accessTest){
            return response.status(200).send({ data: true });
        }
        else{
            return response.status(200).send({ data: false });
        }
        
      }
}
                      

module.exports = TestController
