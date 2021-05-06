const express = require('express');
const user = require('./user');

const router = express.Router();

router.use('/', user);

router.use(function (req, res, next) {
  var err = new Error('Not Found(:<:<:<:<:<)');
  err.status = 404;
  // next(err);
  return res.send({ 'error': 404 });
});

// error handler
router.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err, " - 404");
  // render the error page
  res.status(err.status || 500);
  res.send({ 'error': 404 });
});



module.exports = router;