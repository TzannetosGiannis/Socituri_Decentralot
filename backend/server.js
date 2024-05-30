require('custom-env').env('localhost');
const connectMongo = require('./utils/connectMongo');
const connectSUI = require('./utils/connectSUI');
const {newRoundLottery} = require('./utils/lottery_handling');

(async () => {
  await connectMongo();
  // connectSUI();
  
  // newRoundLottery();
  
  const app = require('./app');

  const PORT = process.env.port || 3001;
  app.listen(PORT,'0.0.0.0', () => {
    console.log(`REST API running at http://localhost:${ PORT }/`);
  });
})();
