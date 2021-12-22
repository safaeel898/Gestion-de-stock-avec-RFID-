'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AdditionalHourSchema extends Schema {
  up () {
    this.create('additional_hours', (table) => {
      table.increments()
      table.integer('nbrHours')
      table.date('dateAdditionalHours')
      table.integer('user_id', 25).unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.timestamps()
    })
  }

  down () {
    this.drop('additional_hours')
  }
}

module.exports = AdditionalHourSchema
