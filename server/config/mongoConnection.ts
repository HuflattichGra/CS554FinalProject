import {MongoClient} from 'mongodb';
import {mongoConfig} from './settings.js';

let _connection = undefined;
let _db = undefined;

const dbConnection = async () => {
  if (!_connection) {
    try {
      console.log('Connecting to MongoDB:', mongoConfig.serverUrl);
      _connection = await MongoClient.connect(mongoConfig.serverUrl);
      _db = _connection.db(mongoConfig.database);
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  return _db;
};
const closeConnection = async () => {
  await _connection.close();
};

export {dbConnection, closeConnection};
