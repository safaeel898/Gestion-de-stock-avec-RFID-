'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DelaySchema extends Schema {
  up () {
    this.create('delays', (table) => {
      table.increments()
      table.date('dateDelay')
      table.string('duration')
      table.integer('user_id', 25).unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.timestamps()
    })
  }

  down () {
    this.drop('delays')
  }
}

module.exports = DelaySchema
