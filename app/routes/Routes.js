'use strict'

var express = require('express')

var todoRoutes = express.Router()

var Todo = require('../models/Todo')
var Users = require('../models/Users')

var mongoose = require('mongoose')

var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')

var Cookies = require('cookies')
var secretKey = "hellworld";
// get all todo items in the db

todoRoutes.route('/all').get(function (req, res, next) {

    var token = new Cookies(req, res).get('access_token');

    jwt.verify(token, secretKey, function (err, token) {
        if (err) {
            // respond to request with error
            res.status(400).send('Unable to valide jwt')
        } else {
            // continue with the request
            Todo.find(function (err, todos) {
                if (err) {
                    return next(new Error(err))
                }

                res.json(todos) // return all todos
            })
        }
    });

})

// add a todo item
todoRoutes.route('/add').post(function (req, res) {
    var token = new Cookies(req, res).get('access_token');

    jwt.verify(token, secretKey, function (err, token) {
        if (err) {
            // respond to request with error
            res.status(400).send('Unable to valide jwt')
        } else {
            // continue with the request
            Todo.create(
                    {
                        name: req.body.name,
                        done: false
                    },
                    function (error, todo) {
                        if (error) {
                            res.status(400).send('Unable to create todo list')
                        }
                        return res.status(200).json(todo)
                    }
            )
        }
    });



})

// delete a todo item

todoRoutes.route('/delete/:id').get(function (req, res, next) {

    var token = new Cookies(req, res).get('access_token');

    jwt.verify(token, secretKey, function (err, token) {
        if (err) {
            // respond to request with error
            res.status(400).send('Unable to valide jwt')
        } else {
            var id = req.params.id
            Todo.findByIdAndRemove(id, function (err, todo) {
                if (err) {
                    return next(new Error('Todo was not found'))
                }
                res.json('Successfully removed')
            })
        }
    })
})

// update a todo item

todoRoutes.route('/update/:id').post(function (req, res) {

    var token = new Cookies(req, res).get('access_token');
    jwt.verify(token, secretKey, function (err, token) {
        if (err) {
            // respond to request with error
            res.status(400).send('Unable to valide jwt')
        } else {
            var id = req.params.id
            Todo.findOneAndUpdate({_id: req.body.id}, {$set: {name: req.body.name}}, (err, doc) => {
                if (err) {
                    console.log("Something wrong when updating data!");
                }

                return res.status(200).json('Good work boys!')
            })
        }
    })
})

// add a user
todoRoutes.route('/user/add').post(function (req, res) {

    bcrypt.hash(req.body.password, 10, function (err, hash) {
        Users.create(
                {
                    _id: new mongoose.Types.ObjectId(),
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

// login with a user
todoRoutes.route('/user/login').post(function (req, res) {

    Users.findOne({email: req.body.email}, function (err, result) {
        if (!result) {
            res.sendStatus(404);
        }

        bcrypt.compare(req.body.password, result.password, function (err, result) {
            if (err) {
                return res.status(401).json({
                    failed: 'Unauthorized Access'
                });
            }
            if (result) {
                var token = jwt.sign(req.body, secretKey);

                new Cookies(req, res).set('access_token', token, {
                    httpOnly: true,
                    secure: false      // for your production environment
                });
                return res.status(200).json({
                    success: 'Welcome to the JWT Auth',
                    token: token
                });
            }
            return res.status(401).json({
                failed: 'Unauthorized Access'
            });
        });


    });
});


module.exports = todoRoutes
