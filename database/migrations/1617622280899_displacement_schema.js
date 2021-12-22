'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DisplacementSchema extends Schema {
  up () {
    this.create('displacements', (table) => {
      table.increments()
      table.date('dateInDisplacement')
      table.date('dateOutDisplacement')
      table.integer('user_id', 25).unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.timestamps()
    })
  }

  down () {
    this.drop('displacements')
  }
}

module.exports = DisplacementSchema
