/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//global var
SEARCH_MODE = false;
window.localS = null;
//window.localStorage = null;
$(document).ready(function() {
    (function($, Parse) {
        Parse.initialize("iqzupv596Guq487ZlrZsFgOpu8gVXqORR7r2RrIR", "dscOJXcCVLoqgwRcvft8AsWyoetCil1yJChyOizz");


        /**
         * 
         */
        var Printcard = Parse.Object.extend("PrintCard", {
            defaults: function() {

                return {
                    thisUser: null, //logged in user
                    email: "none",
                    hardCopy: false,
                    wishes: []
                };
            },
            toggle: function() {
                this.save({hardCopy: !this.get("hardCopy")});
            }

        });

        var Printcards = Parse.Collection.extend({
            model: Printcard

        });

        /**
         * in charge of printcard input form
         * @type @exp;Parse@pro;View@call;extend
         */
        var PrintcardView = Parse.View.extend({
            tagname: "div",
            className: "col-lg-8 col-lg-offset-2 newPrintCard",
            template: _.template($('#print_view_template').html()),
            events: {
                "submit .printForm": "submitprintForm",
                "click .close_btn": "close",
                "click .hcopy": "sethardCopy"
            },
            initialize: function(e) {

                this.printForm = this.$(".printForm");
                this.printCards = new Printcards();
                this.hardCopys = true;
            },
            render: function() {
                var thisUser = Parse.User.current(); //logged in user
                var nauth = true;
                if (thisUser)
                    nauth = false;

                this.$el.html(this.template({nologgin: nauth}));
                this.printForm = this.$(".printForm");

                return this;
            },
            submitprintForm: function(e) {
                e.preventDefault();
                var self = this;
                console.log("print :: ", $(e.target));

                console.log("printForm :: ", self.printForm);

                var thisUser = Parse.User.current();// logged in user
                var email = self.printForm.find('[name=email]').val();

                var mds = ttcn.getModels();



                var wsContain = "[\n";
                mds.forEach(function(el) {
                    wsContain += "{title : " + el.get("title") + ",body : " + el.get("body") + "}";
                });
                wsContain += "\n]";


                if (email.trim() === "" || !thisUser)
                    return false;
                //saving happens here -- parse needed
                this.printCards.create(
                        {email: email.trim(), hardCopy: self.hardCopys, thisUser: thisUser,
                            wishes: wsContain
                        }
                , {
                    success: function(pcrad) {
                        console.log("[saved] ::", pcrad);
                        this.hardCopys = false;

                        self.$el.animate({
                            height: "toggle"
                        }, 500);
                    },
                    error: function(pcard, error) {
                        console.log(error.message);
                    }
                });

                return false;

            },
            close: function(e) {

                this.$el.animate({
                    height: "toggle"
                }, 500);

                return false;
            },
            sethardCopy: function(e) {

                console.log($(e.target).text());
                var hardCopy = $(e.target).text();

//               $(e.target).html();
                if (hardCopy.trim() === "YES") {
                    this.hardCopys = true;
                } else {
                    this.hardCopys = false;
                }
                console.log("hardCopy :: ", this.hardCopys);


            }
        });


        var Feedback = Parse.Object.extend("FeedBack", {
            defaults: {
                thisUser: null, //logged in user
                name: "Anonymous",
                body: "I represent this content",
                reviewed: false

            },
            // Ensure that each todo created has `content`.
            initialize: function() {
                if (!this.get("body")) {
                    this.set({"body": this.defaults.body});
                }
            }

        });

        var FeedBacks = Parse.Collection.extend({
            model: Feedback

        });

        /**
         * In charge of feedback collector form
         * @type @exp;Parse@pro;View@call;extend
         */
        var FeedbView = Parse.View.extend({
            tagname: "div",
            className: "col-lg-8 col-lg-offset-2 newFeedback",
            template: _.template($('#feedb_view_template').html()),
            events: {
                "submit .feedBackForm": "feedBackForm",
                "click .close_btn": "close"
            },
            initialize: function(e) {

                this.fbForm = this.$(".feedBackForm");
                this.feedBacks = new FeedBacks();

            },
            render: function() {


                this.$el.html(this.template({nologgin: false}));
                this.fbForm = this.$(".feedBackForm");

                return this;
            },
            feedBackForm: function(e) {
                e.preventDefault();
                var self = this;
                console.log("feedbacks :: ", $(e.target));

                var thisUser = Parse.User.current();// logged in user
                var name = self.fbForm.find('[name=uname]').val();
                var body = self.fbForm.find('[name=body]').val();

                if (body.trim() === "")
                    return false;

                // saving happens here -- parse needed

                //save it to parse and get two call back functions
                //create a new class if it does not exist
                this.feedBacks.create({body: body.trim(), name: name.trim(), thisUser: thisUser}, {
                    success: function(feedb) {
                        console.log("[saved] ::", feedb);

//                    feedbacks.create({body: body.trim(), name: name.trim(), thisUser: thisUser}); //not necessary
                        //$(".wishesFeedback").trigger("click");


                        self.$el.animate({
                            height: "toggle"
                        }, 500);

//=====================
                        self.fbForm.find('[name=uname]').val("");
                        self.fbForm.find('[name=body]').val("");
                        console.log("feedbacks :: ", self.feedBacks.models);

                    },
                    error: function(feedb, error) {
                        console.log("error", error.message);
                    }
                });
                return false;
            },
            close: function(e) {
                console.log("[saved] ::", e);
                this.$el.animate({
                    height: "toggle"
                }, 500);

                return false;
            },
        });

        var Goal = Parse.Object.extend("Goal", {
            defaults: {
                thisUser: null, //logged in user
                body: "I represent this content",
                achieved: false

            },
            // Ensure that each todo created has `content`.
            initialize: function() {
                if (!this.get("body")) {
                    this.set({"body": this.defaults.body});
                }
            },
            toggle: function() {
                this.save({achieved: !this.get("achieved")});
            }

        });



        var Goals = Parse.Collection.extend({
            model: Goal
        });

        /**
         * In charge of a form that allows user to input a wish/goal for their new journey
         * @type @exp;Parse@pro;Object@call;extend
         */
        var GoalView = Parse.View.extend({
            tagname: "div",
            className: "col-lg-8 col-lg-offset-2 newGoal",
            template: _.template($('#goal_view_template').html()),
            events: {
                "submit .goalForm": "goalForm",
                "click .close_btn": "close"
            },
            initialize: function(e) {

                this.gform = this.$(".goalForm");
                this.goals = new Goals();

            },
            render: function() {

                var thisUser = Parse.User.current(); //logged in user
                var nauth = true;
                if (thisUser)
                    nauth = false;

                this.$el.html(this.template({nologgin: nauth}));
                this.gform = this.$(".goalForm");

                return this;
            },
            goalForm: function(e) {
                console.log("[saved] ::", e);
                var self = this;
                var thisUser = Parse.User.current(); //logged in user
                var body = self.gform.find('[name=body]').val();

                if (body.trim() === "" || !thisUser)
                    return false;

                self.goals.create({body: body.trim(), thisUser: thisUser}, {
                    success: function(goal) {
                        console.log("[saved] ::", goal);

                        self.$el.animate({
                            height: "toggle"
                        }, 500);

                        self.gform.find('[name=body]').val("");
                    },
                    error: function(goal, error) {
                        console.log(error.message); //handle errors here
                    }
                });
                return false;
            },
            close: function(e) {
                console.log("[close] ::", e);
                this.$el.animate({
                    height: "toggle"
                }, 500);

                return false;
            },
        });

        /**
         * In charge of full menu(search, print, feedback, and goal buttons)
         * Later the facebook login button will have to be part of it too
         * @type @exp;Parse@pro;View@call;extend
         */
        var MenuViews = Parse.View.extend({
            el: $(".menu_holder"),
            events: {
                "keypress .asearch": "bestSearch",
                "click .wishesPrint": "wishesPrint",
                "click .newWishClose": "setaGoal",
                "click .wishesFeedback": "wishesFeedback",
                "click .wishesAbout": "wishesAbout",
                "click .loginFB": "loginFB",
                "click .search_type": "search_type"
            },
            initialize: function() {

                this.body = $(".form_holder"),
                        this.feedBackView = new FeedbView({caller: this});
                this.goalView = new GoalView({caller: this});
                this.printCardView = new PrintcardView({caller: this});

                this.sTYPE = "body";

                this.render();

            },
            render: function() {
                this.body.append(this.goalView.render().el);
                this.body.append(this.feedBackView.render().el);
                this.body.append(this.printCardView.render().el);
            }, refresh: function() {

                this.feedBackView.remove();
                this.goalView.remove();
                this.printCardView.remove();
                this.body.empty();

                this.feedBackView = new FeedbView({caller: this});
                this.goalView = new GoalView({caller: this});
                this.printCardView = new PrintcardView({caller: this});
                this.body.append(this.goalView.render().el);
                this.body.append(this.feedBackView.render().el);
                this.body.append(this.printCardView.render().el);
            },
            loginFB: function() {
                console.log("88888888888loginFB88888888888888", this.body);
//            I will be creating my search function here
                return true;
            },
            wishesAbout: function(e) {

//            I will be creating my search function here
                console.log("88888888888wishesAbout88888888888888", this.body);
                $(".about").animate({height: "toggle"}, 500);
                return false;
            }, search_type: function(e) {


                e.preventDefault();
                var type = $(e.target).html();
                console.log("type :: ", type);
                this.$(".for_toggle").text(type);
                this.sTYPE = (type.trim() === 'Names') ? 'title' : 'body';


            },
            bestSearch: function(e) {
                console.log("88888888888bestSearch88888888888888[ " + this.sTYPE + " ]", $(e.target).val());
                var keyword = $(e.target).val();
//            I will be creating my search function here
                var wishes = ttcn.getModels();

                console.log("8888888before8888888888888[ " + this.sTYPE + " ]", wishes);

                $(e.target).val();
                var orderedWishes = sortStrings(wishes, keyword.trim(), this.sTYPE);
                console.log("88888888888afterh88888888888888[ ", orderedWishes);
                ttcn.setModels(orderedWishes);
                ttcn.resetAll();

            },
            setaGoal: function(e) {
                console.log("88888888888setaGoal88888888888888", this.body);
                this.clearHolder(e);
                this.goalView.close(e); // opening the form

                return false;
            },
            wishesPrint: function(e) {
                console.log("88888888888loginFB88888888888888", this.body);
                this.clearHolder(e);
                this.printCardView.close(e); // opening the form
                return false;
            },
            wishesFeedback: function(e) {
                console.log("88888888888wishesFeedback88888888888888", this.body);
                this.clearHolder(e);
                this.feedBackView.close(e); //opening the form here
            },
            clearHolder: function(e) {
                console.log("88888888888loginFB88888888888888", this.body);
                //clear the form holder
                this.body.children().css({
                    display: "none"
                });
                return false;
            }
        });
        var menuView = new MenuViews();


//================================================================================================================



//==============================================================================


        /**
         * Backbone is used for its localstorage handling capability
         * @type @exp;Backbone@pro;Model@call;extend
         */
        var Image = Backbone.Model.extend({
            defaults: function() {

                return {
                    name: "His/Her name",
                    imageID: 0,
                    imageURL: "bt/img/bwishesy.png",
                    userID: 0,
                    uploadTime: new Date()
                };
            },
            getURL: function() {
                this.get("imageURL");
            },
            setTime: function(time) {
                this.set({uploadTime: time});
            }
        });

        var Wish = Backbone.Model.extend({
            defaults: function() {
                return {
                    userID: 0,
                    title: "His/Her name",
                    body: "I represent this content",
                    image: new Image(), //actual img model
                    imageID: 0,
                    selected: false

                };
            },
            setImage: function(img) { // image model here
                this.set({image: img});
                var img1 = this.get("image");
                return img1.get("imageID");
            },
            getImage: function() { // image model here
                return this.get("image");
            },
            isSelected: function() {
                return this.get("selected");
            },
            toggle: function(options) {

                if (options !== null) {
                    this.set({selected: options.select});
                }
                else {
                    this.set({selected: !this.get("selected")});
                }
            }


        });

        var Wish_list = Backbone.Collection.extend({
            model: Wish,
            localStorage: new Backbone.LocalStorage("wish-backbone"),
            initialize: function() {
                window.localS = this.localStorage;
                if (this.localStorage.name === "wish-backbone") {

                    this.localStorage.localStorage().clear();
                    this.localStorage.records = [];
                    this.reset();
                }
            },
            search: function(tname) {
                var mymodel = this.where({title: tname});

                if (mymodel.length < 1)
                    return null;

                return mymodel[0];
            },
            searchByImg: function(IMGid) {

//            console.log(this);
                var mymodels = this.where({imageID: IMGid});

//            console.log(mymodels);

                if (mymodels.length < 1)
                    return null;

                return mymodels;
            },
            searchByid: function(userID) {

                var wish = null;

                $.each(this.models, function(i, thisWish) {
                    //populate search result area
                    var uid = thisWish.get("userID");

                    if (uid === userID) {
                        wish = thisWish;
                        return wish;
                    }
                });
                return wish;
            },
            searchTag: function(options) {

                var sn = options.searchId;
                var holder = new Array();
                if (!sn)
                    return holder;

                var remaining = this.remaining(); //only search values that are not already displayed
                $.each(remaining, function(i, talk) {
                    //populate search result area
                    var tbody = talk.get("body");

                    if (tbody.toLowerCase().search(sn.toLowerCase()) > -1)
                        holder.push(talk.toJSON());
                });

                return holder;
            },
            clearStorage: function() {
                console.log(this.localStorage);
                if (this.localStorage.name === "wish-backbone") {

                    this.localStorage.localStorage().clear();
                    this.localStorage.records = [];
                    this.reset();
                }



            }
        });

        /**
         * create one facebook wish and add the picture of the person who posted it
         * @type @exp;Backbone@pro;View@call;extend
         */
        var WishView = Backbone.View.extend({
            tagName: "div",
            className: "row aWish addedWishs",
            template: _.template($('#talk_view_template').html()),
            events: {
                "click .showWishBody": "showWish",
                "mouseover": "changeLook",
                "mouseout": "resetLook"
            },
            initialize: function() {
                this.main = this.$el;
//            console.log("main");

                this.opacity = -1;
                this.stalk = null;
            },
            render: function() {

                var self = this;
                var data = this.model.toJSON();

                console.log("decideRender", data);

                var img = self.model.getImage();
                console.log("decideRender", img);
                //my search enginee is turning models into objects -- need to check wwhy
                try {
                    data.imageURL = img.get("imageURL");
                } catch (err) {
                    data.imageURL = img.imageURL;
                }

                this.$el.html(self.template(data));
                self.main = self.$el;
                self.listenTo(self.model, 'change', self.decideRender);
//            self.listenTo(self.model, 'destroy', self.remove);



                this.stalk = this.$(".talkBody");

                return this;
            },
            decideRender: function() { //this updates a particular wish view
                var self = this;
                var wish = this.model.toJSON();

                if (!wish.body) {

                    console.log("decideRender", wish);
                    console.log("wish.body", self);
                    self.remove();

                    return false;
                }

                return this;
            },
            showWish: function(e) {

            },
            changeLook: function(e) {
                e.preventDefault();
                this.opacity = this.$el.css("opacity");
                this.$el.css({
                    opacity: 0.5
                });
            },
            resetLook: function(e) {
                e.preventDefault();
                if (this.opacity !== -1) { //make sure to use value saved only if we have saved it
                    this.$el.css({
                        opacity: this.opacity
                    });
                }
            },
            cleanView: function() {

            }
        });



        /**
         * in chrage of displaying Facebook wishes on screen
         * @type @exp;Backbone@pro;View@call;extend
         */
        var WishCTNView = Backbone.View.extend({
            el: $("#allWishs"),
            imageTemplate: _.template($('#image_view_template').html()),
            events: {
                "keypress .asearch": "bestSearch"
            },
            initialize: function() {

                this.wishCount = 0;
                this.saveBefore = 0;
                this.distance = 10;

                var self = this;
                this.TL = new Wish_list(); //init the collection here

                this.input = this.$("#sumit_tag_inid");
                this.listenTo(self.TL, 'add', self.addOne);
                this.searchArea = this.$('.searchRes');
                this.WIDTH = $(document).outerWidth() / 2;

                this.counter = 0;


                // this.TL.bind('all', this.render);



            },
            setModels: function(models) {
                console.log("tltltlt ==99999this99999999=== ", this.TL.models);
                this.TL.models = models;
                console.log("tltltlt ==99999this99999999=== ", this.TL.models);
            }
            ,
            getModels: function() {
                return this.TL.models;
            },
            addToTL: function(wish) {
                this.TL.create(wish);

            },
            addOne: function(wish) {
                var self = this;
                if (self.saveBefore === 0) {
                    self.saveBefore = 65;
                }

                console.log("tltltltaaaa ", this.TL);

                console.log("tltltltssss ", this);
                var view = new WishView({model: wish});
                var item = view.render().el;

                this.$el.prepend(item);
                $(item).attr({title: "click to zoom on to me", talk_id: self.TL.indexOf(wish)});

                var h = $(item).outerHeight();
                var w = $(item).outerWidth();
                var pleft = (self.WIDTH / 2) - (w / 2);  //for 0
                if (self.counter === 1)
                    pleft = (3 * self.WIDTH / 2) - (w / 2);    //for 1
                if (self.counter === 2)
                    pleft = (self.WIDTH) - (w / 2);    //for 2

                $(item).css({
                    top: self.saveBefore + "px",
                    left: pleft + "px"
                });

                self.counter = (self.counter + 1) % 3;
                if (self.counter === 2 || self.counter === 0) {
                    var y = $(item).position();
                    self.saveBefore = y.top + h + self.distance;
                }
                this.positionImg();


//            ======update cover height ======
                var ht = self.saveBefore + $(item).height();
                console.log(ht);
                if (ht > $(".theImage").height())
                    $(".theImage").css({
                        height: ht
                    });


            },
            resetAll: function() {
                $(".addedImage").remove();
                $(".addedWishs").remove();
                var self = this;
                self.saveBefore = 65;

                self.WIDTH = $(document).outerWidth() / 2;

                self.counter = 0;


                self.TL.each(function(wish) { //double checking of talks of same image -- waste

                    var view = new WishView({model: wish});
                    var item = view.render().el;

                    self.$el.prepend(item);
                    $(item).attr({title: "click to zoom on to me", talk_id: self.TL.indexOf(wish)});

                    var h = $(item).outerHeight();
                    var w = $(item).outerWidth();
                    var pleft = (self.WIDTH / 2) - (w / 2);  //for 0
                    if (self.counter === 1)
                        pleft = (3 * self.WIDTH / 2) - (w / 2);    //for 1
                    if (self.counter === 2)
                        pleft = (self.WIDTH) - (w / 2);    //for 2

                    $(item).css({
                        top: self.saveBefore + "px",
                        left: pleft + "px"
                    });

                    self.counter = (self.counter + 1) % 3;
                    if (self.counter === 2 || self.counter === 0) {
                        var y = $(item).position();
                        self.saveBefore = y.top + h + self.distance;
                    }
                });

                self.positionImg();
            },
            positionImg: function() {
                // positioning the imageHolder
                var all = $(".addedWishs");

                $.each(all, function(i, el) {
                    var H = $(el).outerHeight();

                    var img = $(el).children(".circleImg");
//                console.log(img);
                    var h = $(img).outerHeight();

                    var pos = (H / 2) - (h / 2);

                    $(img).css({top: pos + "px"});
                });
            },
            render: function() {
                $(".addedImage").remove();
                $(".addedWishs").remove();

                this.wishCount = 0;
                this.saveBefore = 0;
                this.distance = 10;


                var self = this;
//            $.each(TL.searchByImg(this.image.get("imageID")), function(i, item) { //double checking of talks of same image -- waste
                self.TL.models.each(function(item) {
                    self.addOne(item);
                });

                this.positionImg();
            },
            cleanUp: function() {



                console.log("sss", this.TL.length);
                var self = this;

                self.TL.models.forEach(function(wish) {
                    wish.clear();
                });

                self.TL.clearStorage();
                //this.resetAll();

                self.wishCount = 0;
                self.saveBefore = 0;
                self.distance = 10;
                self.WIDTH = $(document).outerWidth() / 2;

                self.counter = 0;


            },
            bestSearch: function(e) {
                return false;
            }
        });


        var ttcn = new WishCTNView(); //cryfm








        /**
         * handling authentication and setting the right parameters for the data parser
         * @param {type} user : facebook user
         * @returns {void}
         */
        function statusChangeCallback(user) {
            console.log('statusChangeCallback');
            console.log(user);
            console.log("display", $(".pinSecond").attr("display"));
            loader(true); //start progess bar

            if (user) {
                // Logged into your app and Facebook.
                menuView.refresh();
                //=========================== parse login signedUp

                FB.api(
                        "/me",
                        function(response) {
                            if (response && !response.error) {

                                console.log("reppp", response);


                                //make sure no one is logged
                                //  FID = response.id;
                                var FID = response.id;
                                var BDAY = response.birthday;

//                            ================================================

                                var now = new Date();

                                var startDate = new Date(Date.parse(BDAY));

                                var currentYear = (startDate.getMonth() + 2) + "/" + startDate.getDate() + "/" + now.getFullYear();



                                console.log('--------------------------- ', currentYear);

                                var currentBday = Date.parse(currentYear);
                                //if the computed date is in the future, we go back a year
                                if (now < currentBday) {
                                    currentYear = (startDate.getMonth() + 2) + "/" + startDate.getDate() + "/" + (now.getFullYear() - 1);
                                    currentBday = Date.parse(currentYear);
                                }
//                            =================================================

                                var FNAME = response.name;

                                if (!user.get("active")) {
                                    user.set({
                                        "FID": FID,
                                        "name": FNAME,
                                        birthday: BDAY //we should not collect this later
                                    });

                                    user.save(null, {
                                        success: function() {

                                            // Hooray! Let them use the app now.
                                            console.log("cool u you are in now!");
                                            //$(".closePin").trigger("click");
                                            $(".FBLoggin").html("Logout");

                                            $(".closePin").trigger("click");
                                            $(".about").css({display: "none"});
                                            loadWishes(FID, currentBday);

                                        }
                                    });

                                } else {//users is a returning one


                                    //$(".closePin").trigger("click");
                                    $(".FBLoggin").html("Logout");

                                    $(".closePin").trigger("click");
                                    $(".about").css({display: "none"});


                                    loadWishes(FID, currentBday);

                                }


                            } else {
                                console.log(response.error);
                                loader(false); //end progess bar
                            }
                        });

            } else {

                console.log('Please log ' + 'into Facebook.');
                loader(false); //stop progess bar
            }


        }


        /**
         * getting data from facebook and parsing happens in here
         * @param {string} id facebook id of the logged in user -- very important in parsing process
         * @param {long} start time (milliseconds) of when you want to search data from
         * @param {long} end time (msec) specifying the end of period when you want to search data
         * @returns {void}
         */
        function loadWishes(id, start, end) {

            start = start / 1000;

            console.log("Facebook is connected 1400719773...", start);
            /* make the API call */
            FB.api(
                    "/me/feed?until=" + start + "&limit=50",
                    function(response) {
                        if (response && !response.error) {
                            /* handle the result */
                            console.log(response);
                            var count = 0;
                            $.each(response.data, function(i, obj) {



                                if (obj.message && obj.to) {



                                    var data = obj.to.data;

                                    //we pass if this is addressed to one person and that person is the logged in User
                                    if (data.length !== 1)
                                        return;

                                    if (data[0].id !== id)
                                        return;

                                    console.log("iout", count);


//============================ we get the user image and display it ===========
                                    FB.api(
                                            obj.from.id + "?fields=picture",
                                            function(response) {
                                                console.log(response);


                                                var im = new Image({
                                                    name: obj.from.name,
                                                    imageID: response.id,
                                                    imageURL: response.picture.data.url,
                                                    userID: obj.from.id

                                                });

                                                var wish = new Wish({title: obj.from.name, body: obj.message, userID: obj.from.id});
                                                wish.setImage(im);
                                                ttcn.addToTL(wish);

                                            });

//==============================================================================




                                }
                            });
                            loader(false); //stop progess bar


                        } else {
                            console.log(response.error);
                            loader(false); //stop progess bar
                        }
                    }
            );
        }

        /**
         * Login/logout controller -- to be replaced
         */
        $(".FBLoggin").click(function() {

            if (Parse.User.current()) {//logging out
                logout();
                return;
            }
            //logging in
            Parse.FacebookUtils.logIn('user_friends, public_profile,user_birthday,read_stream',
                    {
                        success: function(user) {
                            statusChangeCallback(user);
                        }
                    });

        });

        function logout() {
//        console.log("logout", response);

            ttcn.cleanUp();

            console.log("sss after donennnnnnneeee", 1);

            //logout of parse
            Parse.User.logOut();
            $(".FBLoggin").html("Facebook");
            $(".about").css({display: "block"});

            loader(false); //end progess bar
            menuView.refresh();
            //ttcn.resetAll();


        }


        $.ajaxSetup({cache: true});

        $.getScript('//connect.facebook.net/en_UK/all.js', function() {
            Parse.FacebookUtils.init({
                appId: '1442596856005738',
                cookie: true, // enable cookies to allow the server to access 
                // the session
                xfbml: true, // parse social plugins on this page
                version: 'v1.0' // use version 2.0
            });

            if (Parse.User.current()) {
                statusChangeCallback(Parse.User.current());

            } else {
                Parse.FacebookUtils.logIn('user_friends, public_profile,user_birthday,read_stream',
                        {
                            success: function(user) {
                                statusChangeCallback(user);
                            }
                        });

            }


        });


        /**
         * In charge of the loading animation -- image in the center
         * @param {type} status true means start loading animation
         * and false is to stop it
         * @returns {undefined}
         */
        function loader(status) {

            var i = 5;

            if (status) {
                if (load) { //we quit if load is assigned
                    return;
                }
                $(".loadHolder").css({opacity: 1, "z-index": 150});
                load = setInterval(function() {
                    $(".loading").css({
                        "box-shadow": "0 0 30px " + i + "px rgb(255, 221, 0)"

                    });

                    i = i % 16; //go back to 0 when you rich 15
                    i = (i >= 5) ? i + 1 : 5;

                }, 100);
            } else {
                if (!load) { //we do not clear if nothing is assigned to load
                    return;
                }
                clearInterval(load);

                $(".loadHolder").css({opacity: 0.2, "z-index": 0});

                load = null;
            }

        }
        var load = null;



    })(jQuery, Parse);
});

// ===============================================================================================================
//                                                Sorting strings here
// ===============================================================================================================
//                            modified to sort message objects {name: "", body : ""}
// ===============================================================================================================
/**
 * 
 * @param {type} strings
 * @param {type} w
 * @param {type} type : can be either "name" or "body"
 * @returns {Array}
 */
function sortStrings(strings, w, type) {

    var H = createHash(strings, w, type);

    var keys = new Array();
    for (var i in H) {

        keys.push(i);
    }

    var K = radixSort(keys);

    return swapStrings(strings, H, K);

}


// ===============================================================================================================
//                                                 Radix Sort here
// ===============================================================================================================

/**
 * get maximum value in array first == takes O(n)
 * @param {type} array
 * @returns {getMax.array|Number}
 */
function getMax(array) {

    if (!array)
        return -1;

    var max = array[0];

    for (var i = 0; i < array.length; i++) {
        if (array[i] > max)
            max = array[i];
    }

    return max;
}

/**
 * compute the # of digits of a maximum value
 * @param {type} array
 * @returns {unresolved}
 */
function computeMaxdigits(array) {
    var max = getMax(array);

    var md = max.toString();


    return md.length;

}

//index start at zero -- least significant
/**
 * get digits of a number given its index
 * @param {type} number
 * @param {type} index
 * @returns {Number}
 */
function getDigit(number, index) {
    var ns = number.toString();

    var ridx = ns.length - index - 1;

    if (ridx < 0)
        return 0;

    return ns.charAt(ridx);

}

/**
 * radix sort runtime = O(nk) where k is # digits of max value
 *      n is size of array
 * @param {type} array
 * @returns {@var;item}
 */
function radixSort(array) {

    //compute the radix number = number of digits in the maximum value

    var bucket = new Array(10);
    var mdigit = computeMaxdigits(array);
    //create buckets -- they are just stack data-structure
    // from 0 to 9
    for (var k = 0; k < mdigit; k++) {
        for (var i = 0; i < array.length; i++) {
            var d = getDigit(array[i], k);

            if (!bucket[d]) //init array/stack if not there
                bucket[d] = new Array();


            bucket[d].push(array[i]);

        }

        var j = 0;
        for (var i = bucket.length - 1; i >= 0; i--) {

            if (bucket[i])
                bucket[i].forEach(function(item) {
                    array[j] = item;
                    j += 1;
                });
        }

        //initialize bucket array
        bucket = new Array(10);

    }

    return array;

}

// ===============================================================================================================
// ===============================================================================================================
// ===============================================================================================================


/**
 * 
 * @param main
 * @param keyword
 * @return the number of time this keyword appears in main and 0 if main does
 * not contain keyword
 */
function getSubstring(main, keyword) { //runtime = length of main - keyword
    var count = 0;

    if (main.length < keyword.length) {
        return count;
    }

    for (var i = 0; i < main.length - keyword.length + 1; i++) {
        var usage = main.substring(i, i + keyword.length);
        var tmp = keyword;
        if (usage.toLowerCase() === tmp.toLowerCase()) { //we should use ignorecases????
            count += 1;
        }
    }

    return count;
}



/**
 * return indexList the Hashtable whose keys are frequency and values are
 * linkedlists of pointers to string with same frequency
 * @param strings object with 2 strings {name:"", body:""}
 * @param w
 * @param {String} type : can be either "name" or "body"
 * @return 
 */
function createHash(strings, w, type) { //runtime = O(nk) where n is array size, k is len of longest string in array

    var frequency;
    var indexList = {}; //json object
    var list = null; //the stac that hold indexes of string with same frequency

    for (var i = 0; i < strings.length; i++) { //O(n)
        frequency = getSubstring(strings[i].get(type), w); //O(k)

        if (indexList.hasOwnProperty(frequency.toString())) {// we have list-entry on this key so we access its head
            list = indexList[frequency.toString()];
        } else {
            list = new Array(); //just a stack

        }
        //update the hash table by making this new Node the head of the list
        list.push(i);
        indexList[frequency.toString()] = list;



    }
    return indexList;
}



//
//3.     for each k in K (starting from the begining of K)
//             swap string in S using pointers in H specified by current k
/**
 * I am swapping values of S (using K's values) starting at index 0 in S
 * return ordered S
 * @param S String []
 * @param H JSON of stacks
 * @param K sorted array of indexes
 * @return array of order string
 */
function swapStrings(S, H, K) { // runtime = O(n)

    var trackS = 0; //keep track of what index we are on in S   

    var tmpS = new Array(S.length); //String[S.length];

    var list = null;
    for (var i = 0; i < K.length; i++) {
        list = H[K[i].toString()];

        list.forEach(function(item) {
            var index = item;

            //swap(index, trackS, S); //here we need a check for indexes being less thanS.length
            tmpS[trackS] = S[index]; //not efficient though in terms of space

            trackS += 1;

        });
    }
    return tmpS;
}





// ===============================================================================================================
//                                                 end
// ===============================================================================================================