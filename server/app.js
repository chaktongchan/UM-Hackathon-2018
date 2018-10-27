var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var moment = require('moment');
const cron = require("node-cron");

var con;
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/student_meal_consumption', function (req, res) {
  mysqlConnection();

  var request = require('request');

  // Set the headers
  var headers = {
    'Authorization': 'Bearer 55f6a1cc-a79c-31ca-9108-368e0023f859'
  }

  var options = {
    url: 'https://api.data.umac.mo/service/student/student_meal_consumption/v1.0.0/all',
    method: 'GET',
    headers: headers,
  }

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body)
        res.send(body)
    }
  })
})


/* [START]  Number of People */
app.get('/numberOfPeople/:rc', function (req, res) {
  mysqlConnection();

  var date = new Date();
  var currentHour = date.getHours();

  var mealType = "";
  if (currentHour >=0  && currentHour < 11) {
    mealType = "BREAKFAST";
  } else if (currentHour >=11 && currentHour < 17) {
    mealType = "LUNCH";
  } else {
    mealType = "DINNER";
  }
  
  con.query('SELECT * FROM DHR.People WHERE rc = ? and mealType = ? and date = ?', 
  [req.params.rc, mealType, date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()], function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      res.send(responseStr);
      return;
    }
    var responseStr = {'success': true, 'result': result};
    res.send(responseStr);
  });
})

app.get('/numberOfPeople/:rc/:date/:mealType', function (req, res) {
  mysqlConnection();

  con.query('SELECT * FROM DHR.People WHERE rc = ? and date = ? and mealType = ?', 
  [req.params.rc, req.params.date, req.params.mealType], function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      res.send(responseStr);
      return;
    }
    var responseStr = {'success': true, 'result': result};
    res.send(responseStr);
  });
})


/* [END]    Number of People */


/* [START]  Menu */
app.get('/menu/new', function (req, res) {
  mysqlConnection();

  con.query('INSERT INTO DHR.Menu (`date`, `mealType`, `rc`, `dish`) VALUES (?, ?, ?, ?);', 
  [req.query.date, req.query.mealType, req.query.rc, req.query.dish], function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      res.send(responseStr);
      return;
    }
    var responseStr = {'success': true};
    res.send(responseStr);
  });
})

app.get('/menu/remove/:rc/:date/:mealType/:dish', function (req, res) {
  mysqlConnection();

  con.query('DELETE FROM DHR.Menu where rc = ? and date = ? and mealType = ? and dish = ?', 
  [req.params.rc, req.params.date, req.params.mealType, req.params.dish], function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      res.send(responseStr);
      return;
    }
    var responseStr = {'success': true};
    res.send(responseStr);
  });
})

app.get('/menu/suggestion/:rc', function (req, res) {
  mysqlConnection();

  con.query('select dish, avg(love) from DHR.Menu WHERE DATEDIFF(CURDATE(), date) <= 20 and rc = ? group by rc, dish', 
  [req.params.rc], function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      res.send(responseStr);
      return;
    }
    var responseStr = {'success': true, 'result': result};
    res.send(responseStr);
  });
})

app.get('/menu/:rc', function (req, res) {
  mysqlConnection();

  var date = new Date();
  var currentHour = date.getHours();

  var mealType = "";
  if (currentHour >=0  && currentHour < 11) {
    mealType = "BREAKFAST";
  } else if (currentHour >=11 && currentHour < 17) {
    mealType = "LUNCH";
  } else {
    mealType = "DINNER";
  }
  
  con.query('SELECT * FROM DHR.Menu WHERE rc = ? and mealType = ? and date = ?', 
  [req.params.rc, mealType, date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()], function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      res.send(responseStr);
      return;
    }
    var responseStr = {'success': true, 'result': result};
    res.send(responseStr);
  });
})

app.get('/menu/allday/:rc', function (req, res) {
  mysqlConnection();

  var date = new Date();

  con.query('SELECT * FROM DHR.Menu WHERE rc = ? and date = ? group by dish', 
  [req.params.rc, date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()], function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      res.send(responseStr);
      return;
    }
    var responseStr = {'success': true, 'result': result};
    res.send(responseStr);
  });
})

app.get('/menu/allday/:rc/:date', function (req, res) {
  mysqlConnection();

  var date = new Date();

  con.query('SELECT * FROM DHR.Menu WHERE rc = ? and date = ? group by dish order by id desc', 
  [req.params.rc, req.params.date], function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      res.send(responseStr);
      return;
    }
    var responseStr = {'success': true, 'result': result};
    res.send(responseStr);
  });
})

app.get('/menu/:rc/:date/:mealType', function (req, res) {
  mysqlConnection();

  var date = new Date();

  con.query('SELECT * FROM DHR.Menu WHERE rc = ? and date = ?', 
  [req.params.rc, date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()], function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      res.send(responseStr);
      return;
    }
    var responseStr = {'success': true, 'result': result};
    res.send(responseStr);
  });
})

app.get('/love/:rc/:date/:mealType/:dish', function (req, res) {
  mysqlConnection();

  con.query('UPDATE DHR.Menu SET love = love + 1 where rc = ? and date = ? and mealType = ? and dish = ?', 
  [req.params.rc, req.params.date, req.params.mealType, req.params.dish], function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      res.send(responseStr);
      return;
    }
    con.query('SELECT * FROM DHR.Menu WHERE rc = ? and mealType = ? and date = ? and dish = ?', 
    [req.params.rc, req.params.mealType, req.params.date, req.params.dish], function (err, result, fields) {
      if (err) {
        var responseStr = {'success': false, 'message': err};
        res.send(responseStr);
        return;
      }
      var responseStr = {'success': true, 'result': result};
      res.send(responseStr);
    });
  });
})
/* [END]    Menu */


/* [START]  Dish */
app.get('/dish/mostWelcome/:rc', function (req, res) {
  mysqlConnection();
  var date = new Date();
  con.query('select *, sum(love) as loveSum from DHR.Menu where rc = ? and date = ? group by dish order by loveSum DESC limit 5', 
  [req.params.rc, date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()], function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      res.send(responseStr);
      return;
    }
    var responseStr = {'success': true, 'result': result};
    res.send(responseStr);
  });
})

app.get('/dish/leastWelcome/:rc', function (req, res) {
  mysqlConnection();
  var date = new Date();
  con.query('select *, sum(love) as loveSum from DHR.Menu where rc = ? and date = ? group by dish order by loveSum limit 5', 
  [req.params.rc, date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()], function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      res.send(responseStr);
      return;
    }
    var responseStr = {'success': true, 'result': result};
    res.send(responseStr);
  });
})
/* [END]  Dish */


/* [START]  Feedback */
app.get('/feedback/new', function (req, res) {
  mysqlConnection();
  console.log(req.query.comment);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  var date = new Date();
  var currentHour = date.getHours();

  var mealType = "";
  if (currentHour >=0  && currentHour < 11) {
    mealType = "BREAKFAST";
  } else if (currentHour >=11 && currentHour < 17) {
    mealType = "LUNCH";
  } else {
    mealType = "DINNER";
  }

  var dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

  con.query('INSERT INTO DHR.Feedback (`date`, `mealType`, `rc`, `dish`, `taste`, `fresh`, `amount`, `comment`) VALUES (?, ?, ?, ?, ?, ?, ?, ?);', 
  [dateStr, mealType, req.query.rc, req.query.dish, req.query.taste, req.query.fresh , req.query.amount, req.query.comment], function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      res.send(responseStr);
      return;
    }
    var responseStr = {'success': true};
    res.send(responseStr);
  });
})

app.get('/feedback/past/:rc/:dish', function (req, res) {
  mysqlConnection();

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  con.query('SELECT FLOOR(DATEDIFF(date, CURDATE())/14) as _week, avg(love) as love From DHR.Menu where rc = ? and dish = ? and FLOOR(DATEDIFF(date, CURDATE())/14) = \'-1\' group by _week', 
  [req.params.rc, req.params.dish], function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      res.send(responseStr);
      return;
    }
    var past14 = 0;
    if (result.length != 0) {
      past14 = result[0].love;
    }
    con.query('SELECT FLOOR(DATEDIFF(date, CURDATE())/7) as _week, avg(love) as love From DHR.Menu where rc = ? and dish = ? and FLOOR(DATEDIFF(date, CURDATE())/7) = \'-1\' group by _week', 
    [req.params.rc, req.params.dish], function (err, result, fields) {
      if (err) {
        var responseStr = {'success': false, 'message': err};
        res.send(responseStr);
        return;
      }
      var past7 = 0;
      if (result.length != 0) {
        past7 = result[0].love;
      }
      var pastStr = {'past7': past7, 'past14': past14};
      var responseStr = {'success': true, 'result': pastStr};
      res.send(responseStr);
    });
  });
})

app.get('/feedback/past28/:rc/:dish', function (req, res) {
  mysqlConnection();

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  con.query('SELECT FLOOR(DATEDIFF(date, CURDATE())/7) as _week, avg(love) as love From DHR.Menu where rc = ? and dish = ? and FLOOR(DATEDIFF(date, CURDATE())/7) >= -4 group by _week', 
  [req.params.rc, req.params.dish], function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      res.send(responseStr);
      return;
    }
    var date = new Date();
    var responseStr = {'success': true, 'currentDate': date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),'result': result};
    res.send(responseStr);
  });
})

app.get('/feedback/:rc/:dish/:date', function (req, res) {
  mysqlConnection();

  con.query('SELECT * FROM DHR.Feedback WHERE dish = ? and date = ? and rc = ?', 
  [req.params.dish, req.params.date, req.params.rc], function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      res.send(responseStr);
      return;
    }
    var responseStr = {'success': true, 'result': result};
    res.send(responseStr);
  });
})

app.get('/feedback/:rc/:dish', function (req, res) {
  mysqlConnection();

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  con.query('SELECT * FROM DHR.Feedback WHERE dish = ?', 
  [req.params.dish], function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      res.send(responseStr);
      return;
    }
    var responseStr = {'success': true, 'result': result};
    res.send(responseStr);
  });
})
/* [END]    Feedback */


/* [START]  Comment */
app.get('/comment/:day/:rc/:dish', function (req, res) {
  mysqlConnection();

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  mysqlConnection();

  con.query('SELECT date, comment FROM DHR.Feedback WHERE dish = ? and rc = ? and DATEDIFF(CURDATE(), date) <= ? ORDER BY id DESC', 
  [req.params.dish, req.params.rc, req.params.day], function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      res.send(responseStr);
      return;
    }
    var responseStr = {'success': true, 'result': result};
    res.send(responseStr);
  });
})
/* [END]    Comment */


/* [START]  RC */
app.get('/rc', function (req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send('{\"CKLC\":{\"chinUnitName\":\"\u5F35\u5D11\u5D19\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio Cheong Kun Lun\",\"unitName\":\"CHEONG KUN LUN COLLEGE\"},\"MLC\":{\"chinUnitName\":\"\u99AC\u842C\u797A\u7F85\u67CF\u5FC3\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio Ma Man Kei e Lo Pak Sam\",\"unitName\":\"MA MAN KEI AND LO PAK SAM COLLEGE\"},\"CKPC\":{\"chinUnitName\":\"\u66F9\u5149\u5F6A\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio Chao Kuang Piu\",\"unitName\":\"CHAO KUANG PIU COLLEGE\"},\"LCWC\":{\"chinUnitName\":\"\u5442\u5FD7\u548C\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio Lui Che Woo\",\"unitName\":\"LUI CHE WOO COLLEGE\"},\"CKYC\":{\"chinUnitName\":\"\u8521\u7E7C\u6709\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio Choi Kai Yau\",\"unitName\":\"CHOI KAI YAU COLLEGE\"},\"SPC\":{\"chinUnitName\":\"\u7D39\u90A6\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio Shiu Pong\",\"unitName\":\"SHIU PONG COLLEGE\"},\"CYTC\":{\"chinUnitName\":\"\u912D\u88D5\u5F64\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio Cheng Yu Tung\",\"unitName\":\"CHENG YU TUNG COLLEGE\"},\"MCMC\":{\"chinUnitName\":\"\u6EFF\u73CD\u7D00\u5FF5\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio Memorial Moon Chun\",\"unitName\":\"MOON CHUN MEMORIAL COLLEGE\"},\"HFPJC\":{\"chinUnitName\":\"\u970D\u82F1\u6771\u73CD\u79A7\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio do Jubileu de P\u00E9rola Henry Fok\",\"unitName\":\"HENRY FOK PEARL JUBILEE COLLEGE\"},\"SHEAC\":{\"chinUnitName\":\"\u4F55\u9D3B\u71CA\u6771\u4E9E\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio da \u00C1sia Oriental Stanley Ho\",\"unitName\":\"STANLEY HO EAST ASIA COLLEGE\"}}  ');
})

app.get('/rc/:rc', function (req, res) {
  var rcJson = JSON.parse('{\"CKLC\":{\"chinUnitName\":\"\u5F35\u5D11\u5D19\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio Cheong Kun Lun\",\"unitName\":\"CHEONG KUN LUN COLLEGE\"},\"MLC\":{\"chinUnitName\":\"\u99AC\u842C\u797A\u7F85\u67CF\u5FC3\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio Ma Man Kei e Lo Pak Sam\",\"unitName\":\"MA MAN KEI AND LO PAK SAM COLLEGE\"},\"CKPC\":{\"chinUnitName\":\"\u66F9\u5149\u5F6A\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio Chao Kuang Piu\",\"unitName\":\"CHAO KUANG PIU COLLEGE\"},\"LCWC\":{\"chinUnitName\":\"\u5442\u5FD7\u548C\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio Lui Che Woo\",\"unitName\":\"LUI CHE WOO COLLEGE\"},\"CKYC\":{\"chinUnitName\":\"\u8521\u7E7C\u6709\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio Choi Kai Yau\",\"unitName\":\"CHOI KAI YAU COLLEGE\"},\"SPC\":{\"chinUnitName\":\"\u7D39\u90A6\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio Shiu Pong\",\"unitName\":\"SHIU PONG COLLEGE\"},\"CYTC\":{\"chinUnitName\":\"\u912D\u88D5\u5F64\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio Cheng Yu Tung\",\"unitName\":\"CHENG YU TUNG COLLEGE\"},\"MCMC\":{\"chinUnitName\":\"\u6EFF\u73CD\u7D00\u5FF5\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio Memorial Moon Chun\",\"unitName\":\"MOON CHUN MEMORIAL COLLEGE\"},\"HFPJC\":{\"chinUnitName\":\"\u970D\u82F1\u6771\u73CD\u79A7\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio do Jubileu de P\u00E9rola Henry Fok\",\"unitName\":\"HENRY FOK PEARL JUBILEE COLLEGE\"},\"SHEAC\":{\"chinUnitName\":\"\u4F55\u9D3B\u71CA\u6771\u4E9E\u66F8\u9662\",\"portUnitName\":\"Col\u00E9gio da \u00C1sia Oriental Stanley Ho\",\"unitName\":\"STANLEY HO EAST ASIA COLLEGE\"}}');
  var rcCode = req.params.rc;

  res.setHeader('Content-Type', 'application/json; charset=utf-8'); 
  res.send(rcJson[rcCode]);
})
/* [END]    RC */

/* [START]  Auto update people */
cron.schedule("* * * * *", function() {
  updatePeople();
});
/* [END]    Auto update people */



app.listen(3000, function () {
  console.log('App started!');
});

function mysqlConnection() { 
  if (con == 'undefined' || !con) {
    con = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root'
    });
  }
}

/* Demo for CYTC */
function updatePeople() {
  mysqlConnection();

  con.query('SELECT * FROM DHR.OpenData', function (err, result, fields) {
    if (err) {
      var responseStr = {'success': false, 'message': err};
      console.log(responseStr);
      return;
    }
    var request = require('request');

    // Set the headers
    var headers = {
      'Authorization': 'Bearer 55f6a1cc-a79c-31ca-9108-368e0023f859'
    }
  
    var options = {
      url: 'https://api.data.umac.mo/service/student/student_meal_consumption/v1.0.0/all?consumption_location=CYTC&consume_date_from=' + encodeURIComponent(result[0].lastUpdate) + '&sort_by=consumeTime',
      method: 'GET',
      headers: headers,
    }
  
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          console.log(body);
          var jsonObj = JSON.parse(body);
          console.log(jsonObj._embedded);

          var mealCount = [0, 0, 0];
          for (i = 0; i < jsonObj._embedded.length; i++) { 
            if (jsonObj._embedded[i].mealType == 'BREAKFAST') {
              mealCount[0] = mealCount[0] + 1;
            } else if (jsonObj._embedded[i].mealType == 'LUNCH') {
              mealCount[1] = mealCount[1] + 1;
            } else if (jsonObj._embedded[i].mealType == 'DINNER') {
              mealCount[2] = mealCount[2] + 1;
            }
          }

          if (jsonObj._embedded.length != 0) {
            var date = new Date(jsonObj._embedded[jsonObj._embedded.length - 1].consumeTime);
            console.log(jsonObj._embedded[jsonObj._embedded.length - 1].consumeTime);
            var ms = date.getTime();
            var newDate = new Date(date.getTime() + 1000);
  
            con.query('UPDATE DHR.People SET people = people + ? where rc = ? and date = ? and mealType = ?', 
            [mealCount[0], 'CYTC', date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(), 'BREAKFAST'], function (err, result, fields) {
              con.query('UPDATE DHR.People SET people = people + ? where rc = ? and date = ? and mealType = ?', 
              [mealCount[1], 'CYTC', date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(), 'LUNCH'], function (err, result, fields) {
                con.query('UPDATE DHR.People SET people = people + ? where rc = ? and date = ? and mealType = ?', 
                [mealCount[2], 'CYTC', date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(), 'DINNER'], function (err, result, fields) {
                  con.query('UPDATE DHR.OpenData SET lastUpdate = ?', 
                  [moment(newDate).format()], function (err, result, fields) {
                    
                  });
                });
              });
            });
          }
      } 
    })

  });

}

