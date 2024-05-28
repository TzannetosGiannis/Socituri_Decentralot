const app = require('./app');
const connectMongo = require('./utils/connectMongo');
const connectSUI = require('./utils/connectSUI');

const PORT = process.env.port || 3000;

connectMongo();
connectSUI();

app.listen(PORT,'0.0.0.0', () => {
  console.log(`REST API running at http://localhost:${ PORT }/`);
});