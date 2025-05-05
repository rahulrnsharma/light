require('dotenv').config();
const app = require('./src/app');
const { runNodeMediaServer } = require('./src/core/nodeMediaServer');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.info(`Server is started on port ${PORT}`);
});

runNodeMediaServer();
