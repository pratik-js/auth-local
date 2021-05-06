const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const jsonDb = low(adapter);

module.exports = jsonDb;