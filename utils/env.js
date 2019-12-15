const dotenv = require('dotenv');

function loadEnv() {
  dotenv.config();

  dotenv.config({ path: './default.env' });
}

exports.loadEnv = loadEnv;

function getEnv() {
  return process.env.NODE_ENV || 'development';
}

exports.getEnv = getEnv;

function isDevelopment() {
  return getEnv() === 'development';
}

exports.isDevelopment = isDevelopment;

function isTest() {
  return getEnv() === 'test';
}

exports.isTest = isTest;

function isProduction() {
  return getEnv() === 'production';
}

exports.isProduction = isProduction;
