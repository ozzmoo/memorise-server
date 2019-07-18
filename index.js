const express = require('express')
const app = express()
const Datastore = require('nedb')
const cors = require('cors')

const port = process.env.PORT || 3000

app.use(cors())
app.listen(port, () => { console.log("listen 3000 port") })
app.use(express.static('public'))
app.use(express.json({ limit: "1mb" }))

const userbase = new Datastore('userbase.db')
userbase.loadDatabase()
const wordbase = new Datastore('wordbase.db')
wordbase.loadDatabase()







/*
По запросу возвращает случайное слово из указанного юнита, для указанного пользователя
*/


app.post('/game', (req, res) => {
  const request = req.body

  const username = request.username
  const unitName = request.unit
  console.log(req.body)
  wordbase.find({ username: username }, (err, data) => {
    if (err) {
      res.end()
      console.log(err)
      return
    }
    if (data.length == 0) {
      res.send("В базе нет слов под вашим именем")
    } else {
      try {
        console.log("Зашли")
        console.log(data[0][unitName])
        const unit = data[0][unitName]
        const numberOfWords = unit.length
        res.send(unit[getRandomWord(0, numberOfWords)])
      } catch (error) {
        res.send("Юнита нет в базе")
        console.log("Ошибка:", error)
      }

    }
  })
})


function getRandomWord(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

app.post('/game/wordbase', (req, res) => {
  const wordsJson = req.body
  const username = wordsJson.username
  const unit = wordsJson.unit
  const eng = wordsJson.eng
  const rus = wordsJson.rus

  const obj = {
    username: username,
  }
  obj[unit] = [{ eng: eng, rus: rus }]

  wordbase.find({ username: username }, (err, data) => {
    if (err) {
      res.end()
      console.log(err)
      return
    }
    if (data.length == 0) {
      wordbase.insert(obj)
    } else {
      wordbase.update({ username: username }, { $push: { [unit]: { eng: eng, rus: rus } } }, function () {
      });

    }
  })
})


app.post('/units', (req, res) => {
  const username = req.body.username
  wordbase.find({username:username}, (err, data) => {
    if (err) {
      res.end()
      console.log(err)
      return
    }
    if (data.length == 0) {
      res.send("Нет слов под этим именем")
    } else {
      console.log(data)
      res.send(data)
    }
  })
})


/*
Аутентификация и сессии
*/

const cookieParser = require('cookie-parser')
const session = require('express-session')


const cookieStore = require('connect-nedb-session')(session);

app.use(session({
  secret: 'yoursecret',
  saveUninitialized: true,
  resave: false,
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 2   // One year for example
  }
  , store: new cookieStore({ filename: 'session_store.db' })
}));

//Основной логин

/*app.post('/login', (req, res) => {
  //console.log(req.session)
  const logpas = req.body
  console.log(req.body)
  userbase.find({
    $and: [{ login: logpas.login },
    { password: logpas.password }]
  }, (err, data) => {
    if (err) {
      res.end()
      console.log(err)
      return
    }
    if (data.length == 0) {
      console.log("В базе не найден")
      res.send({
        logStatus: false
      })
    } else {
      console.log("В базе найден")
      req.session.username = logpas.login
      res.send({
        logStatus: true,
        username: logpas.login
      })
    }
  })
})*/

app.post('/reg', (req, res) => {
  const logpas = req.body
  userbase.find({ login: `${logpas.login}` }, (err, data) => {
    if (err) {
      res.end()
      console.log(err)
      return
    }
    if (data.length == 0) {
      userbase.insert(logpas)
      res.json({
        status: true
      })
    } else {
      res.json({
        status: false
      })
    }
  })

})

//Временный логин

app.post('/login', (req, res) => {
  const logpas = req.body
  console.log(req.body)
  userbase.find({ login: logpas.login }, (err, data) => {
    if (err) {
      res.end()
      console.log(err)
      return
    }
    if (data.length == 0) {
      console.log("В базе не найден")
      res.send({
        logStatus: false
      })
    } else {
      console.log("В базе найден")
      res.send({
        logStatus: true,
        username: logpas.login
      })
    }
  })
})

