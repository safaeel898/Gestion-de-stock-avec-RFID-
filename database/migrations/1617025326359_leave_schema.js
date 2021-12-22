'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LeaveSchema extends Schema {
  up () {
    this.create('leaves', (table) => {
      table.increments()
      table.string('type')
      table.string('duration')
      table.date('startDate')
      table.date('endDate')
      table.integer('user_id', 25).unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.timestamps()
    })
  }

  down () {
    this.drop('leaves')
  }
}

module.exports = LeaveSchema
