var express = require('express');
var app = express();

// App configuration section
app.set('views', 'cloud/views');  // Folder containing view templates
app.set('view engine', 'ejs');    // Template engine
app.use(express.bodyParser());    // Read the request body into a JS object

// Attach request handlers to routes
app.get('/', function(req, res) {
    // GET http://example.parseapp.com/test?message=hello
    res.render('index.ejs');  // Render a template
});

app.post('/', function(req, res) {
    // POST http://example.parseapp.com/test (with request body "message=hello")
    res.render('index.ejs');  // Render a template
});

// Attach the Express app to your Cloud Code
app.listen();


//=================================================================

var Mandrill = require('mandrill');
Mandrill.initialize('4tFn-onMpCBIAYWLMMktjg');

//make sure user is logged in before saving goals or cardNotification
Parse.Cloud.beforeSave("Goal", function(request, response) {

    if (!request.user) {
        response.error("you need to be logged in");
    } else {
        response.success();
    }
});
Parse.Cloud.beforeSave("PrintCard", function(request, response) {
    if (!request.user) {
        response.error("you need to be logged in");
    } else {

        response.success();
    }
});

Parse.Cloud.afterSave("PrintCard", function(request) {
    var allWishes = request.object.get("wishes");
    Mandrill.sendEmail({
        message: {
            text: allWishes,
            subject: "Print card request from " + request.user.get("name"),
            from_email: "parse@cloudcode.com",
            from_name: "BW team",
            to: [
                {
                    email: "mn2587@columbia.edu",
                    name: "Marcellin Nshimiyimana"
                },
                {
                    email: "marcen0@sewanee.edu",
                    name: "Marcellin Nshimiyimana"
                }
            ]
        },
        async: true
    }, {
        success: function(httpResponse) {
            console.log(httpResponse);
//            response.success("Email sent!");

            request.object.get({wishes: []});
            request.object.save(null, {
                success: function() {
                    Mandrill.sendEmail({
                        message: {
                            text: "Thank for your request, We will get your card in a week!",
                            subject: "Request in process ...",
                            from_email: "parse@cloudcode.com",
                            from_name: "BW team",
                            to: [
                                {
                                    email: request.user.get("email"),
                                    name: request.user.get("name")
                                }
                            ]
                        },
                        async: true
                    });
                }
            });
        },
        error: function(httpResponse) {
            console.error(httpResponse);
//            response.error("Uh oh, something went wrong");
        }
    });




});


