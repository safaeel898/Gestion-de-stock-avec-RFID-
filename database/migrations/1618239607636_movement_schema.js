'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MovementSchema extends Schema {
  up () {
    this.create('movements', (table) => {
      table.increments()
      table.date('dateMovement')
      table.time('timeInMovement')
      table.time('timeOutMovement')
      table.integer('user_id', 25).unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('department_id', 25).unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.timestamps()
    })
  }

  down () {
    this.drop('movements')
  }
}

module.exports = MovementSchema
