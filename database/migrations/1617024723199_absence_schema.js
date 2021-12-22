'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AbsenceSchema extends Schema {
  up () {
    this.create('absences', (table) => {
      table.increments()
      table.date('dateAbsence')
      table.integer('user_id', 25).unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.timestamps()
    })
  }

  down () {
    this.drop('absences')
  }
}

module.exports = AbsenceSchema
