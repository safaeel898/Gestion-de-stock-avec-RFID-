'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PauseSchema extends Schema {
  up () {
    this.create('pauses', (table) => {
      table.increments()
      table.time('timeIn')
      table.time('timeOut')
      table.date('datePause')
      table.integer('user_id', 25).unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.timestamps()
    })
  }

  down () {
    this.drop('pauses')
  }
}

module.exports = PauseSchema
