'use strict'

const Database = use('Database');
//const check=require("../../Tools/noReader")


class ZoneReaderController  {

    async index({ view, params }) {

        const page = params.page ? params.page : 1;

        //const have =check.noReaderFunction()
        
        const readersNotAffected = await Database.select("readers.id", "readers.reader_name").from("readers")
        .whereNull('zone_id').paginate(page, 10);

        console.log(readersNotAffected)
        let have=true
    
    
        if (readersNotAffected[0] != null ){
            console.log("ces lecteurs ne sont pas affectés")
            console.log(readersNotAffected)
            have=false
            console.log(have)
        }

        // let readersaffected =  await Database.table('readers')
        // .insert({readers.reader_name: })
        return view.render("gest_aces.readers.index2", {
            readersNotAffected:readersNotAffected,
          page: page,
    
        });
      
    }

    async index2({ view, params }) {

        const page = params.page ? params.page : 1;

        //const have =check.noReaderFunction()
        const empty_zones = await Database.select("zones.id","zones.name").from("zones")
    .whereNotIn('id', Database.select("readers.zone_id").from("readers")
    .whereNotNull('zone_id')
    ).paginate(page, 10);

    console.log(empty_zones)

let have=true
    if (empty_zones[0] != null ){
        console.log("ces zones n'ont pas de lecteurs")
        console.log(empty_zones)
        have=false
        console.log(have)
    }
    

        // let readersaffected =  await Database.table('readers')
        // .insert({readers.reader_name: })
        return view.render("gest_aces.readers.index3", {
            empty_zones:empty_zones,
          page: page,
    
        });
      
    }

}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
module.exports = ZoneReaderController
