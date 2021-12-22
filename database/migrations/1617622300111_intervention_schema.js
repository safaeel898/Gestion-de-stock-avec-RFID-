'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class InterventionSchema extends Schema {
  up () {
    this.create('interventions', (table) => {
      table.increments()
      table.date('dateInIntervention')
      table.date('dateOutIntervention')
      table.time('timeInIntervention')
      table.time('timeOutIntervention')
      table.integer('user_id', 25).unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.timestamps()
    })
  }

  down () {
    this.drop('interventions')
  }
}

module.exports = InterventionSchema
