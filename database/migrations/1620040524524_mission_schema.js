'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MissionSchema extends Schema {
  up () {
    this.create('missions', (table) => {
      table.increments()
      table.integer('user_id', 25).unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.date('dateInMission')
      table.date('dateOutMission')
      table.time('timeInMission')
      table.time('timeOutMission')
      table.string('type')
      table.timestamps()
    })
  }

  down () {
    this.table('missions', (table) => {
      // reverse alternations
    })
  }
}

module.exports = MissionSchema
