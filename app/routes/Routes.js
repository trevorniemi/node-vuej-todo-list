'use strict'

var express = require('express')

var todoRoutes = express.Router()

var Todo = require('../models/Todo')
var Users = require('../models/Users')

var mongoose = require('mongoose')

var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')

// get all todo items in the db

todoRoutes.route('/all').get(function (req, res, next) {
  Todo.find(function (err, todos) {
    if (err) {
      return next(new Error(err))
    }

    res.json(todos) // return all todos
  })
})

// add a todo item
todoRoutes.route('/add').post(function (req, res) {
  Todo.create(
    {
      name: req.body.name,
      done: false
    },
    function (error, todo) {
      if (error) {
        res.status(400).send('Unable to create todo list')
      }
      res.status(200).json(todo)
    }
  )
})

// delete a todo item

todoRoutes.route('/delete/:id').get(function (req, res, next) {
  var id = req.params.id
  Todo.findByIdAndRemove(id, function (err, todo) {
    if (err) {
      return next(new Error('Todo was not found'))
    }
    res.json('Successfully removed')
  })
})

// update a todo item

todoRoutes.route('/update/:id').post(function (req, res, next) {
  var id = req.params.id
  Todo.findById(id, function (error, todo) {
    if (error) {
      return next(new Error('Todo was not found'))
    } else {
      todo.name = req.body.name
      todo.done = req.body.done

      todo.save({
        function (error, todo) {
          if (error) {
            res.status(400).send('Unable to update todo')
          } else {
            res.status(200).json(todo)
          }
        }
      })
    }
  })
})

todoRoutes.route('/checking').get(function (req, res, next) {
  Todo.find(function (err, todos) {
    if (err) {
      return next(new Error(err))
    }

   res.json({
      "Tutorial": "Welcome to the Node express JWT Tutorial"
   });
  })
})


// add a todo item
todoRoutes.route('/user/add').post(function (req, res) {
    
    bcrypt.hash(req.body.password, 10, function(err, hash){
    
   
  Users.create(
    {
        _id: new  mongoose.Types.ObjectId(),
        email: req.body.email,
        password: hash
    },
    function (error, todo) {
      if (error) {
        res.status(400).send('Unable to create user')
      }
      res.status(200).json(todo)
    }
  )
  });
})

// add a todo item
todoRoutes.route('/user/login').post(function (req, res) {
    
Users.findOne({email: req.body.email}, function (err, result) {
      if (!result) {
        res.sendStatus(404);
      }
     
        bcrypt.compare(req.body.password, result.password, function(err, result){
         if(err) {
            return res.status(401).json({
               failed: 'Unauthorized Access'
            });
         }
         if(result) {
            const JWTToken = jwt.sign({
               email: result.email,
               _id: result._id
            },
            'secret',
               {
                  expiresIn: '2h'
               });
            return res.status(200).json({
               success: 'Welcome to the JWT Auth',
               token: JWTToken
            });
         }
         return res.status(401).json({
            failed: 'Unauthorized Access'
         });
      });


    });
    
// Users.findOne({email: req.body.email})
//   .exec()
//   .then(function(users) {
//      bcrypt.compare(req.body.password, users.password, function(err, result){
//         if(err) {
//            return res.status(401).json({
//               failed: 'Unauthorized Access'
//            });
//         }
//         if(result) {
//            const JWTToken = jwt.sign({
//               email: users.email,
//               _id: users._id
//            },
//            'secret',
//               {
//                  expiresIn: '2h'
//               });
//            return res.status(200).json({
//               success: 'Welcome to the JWT Auth',
//               token: JWTToken
//            });
//         }
//         return res.status(401).json({
//            failed: 'Unauthorized Access'
//         });
//      });
//   })
//   .catch(error => {
//      res.status(500).json({
//         error: error
//      });
//    });
});


module.exports = todoRoutes
