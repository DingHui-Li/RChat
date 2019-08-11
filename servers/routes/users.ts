var express = require('express');
var router = express.Router();

router.post('/register', function(req:any, res:any, next:any) {
  console.log(req.query);
});

module.exports = router;
