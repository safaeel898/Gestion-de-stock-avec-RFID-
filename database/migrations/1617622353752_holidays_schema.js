'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class HolidaysSchema extends Schema {
  up () {
    this.create('holidays', (table) => {
      table.increments()
      table.string('durationHolidays')
      table.date('dateInHolidays')
      table.date('dateOutHolidays')
      table.integer('typeHolidays')
      table.integer('user_id', 25).unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.timestamps()
    })
  }

  down () {
    this.drop('holidays')
  }
}

module.exports = HolidaysSchema
