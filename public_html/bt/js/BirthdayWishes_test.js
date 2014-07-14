/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//global var
SEARCH_MODE = false;
window.feedBacks = null;
window.Printcard = null;
window.goals = null;
(function($, Parse) {
    Parse.initialize("iqzupv596Guq487ZlrZsFgOpu8gVXqORR7r2RrIR", "dscOJXcCVLoqgwRcvft8AsWyoetCil1yJChyOizz");


//========= save to Parse
    if (!window.Printcard)
        window.Printcard = Parse.Object.extend("PrintCard", {
            defaults: function() {

                return {
                    thisUser: null, //logged in user
                    email: "none",
                    hardCopy: false
                };
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
        },
        toggle: function() {
            this.save({reviewed: !this.get("reviewed")});
        }

    });

    var FeedBacks = Parse.Collection.extend({
        model: Feedback

    });
    if (!window.feedBacks)
        window.feedBacks = new FeedBacks();

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
        model: Goal,
    });
    if (!window.goals)
        window.goals = new Goals();



//================================================================================================================






//    $(document).ready(function() {
    var hardCopys = false;
    //save information about card printing
    $(".hcopy").click(function(e) {
        e.preventDefault();
        var hardCopy = $(e.target).html();
        if (hardCopy.trim() === "YES") {
            hardCopys = true;
        } else {
            hardCopys = false;
        }
        console.log("hardCopy :: ", hardCopy);
    });

    $(".printForm").submit(function(e) {
        e.preventDefault();

        var pcForm = $(e.target);
        console.log("printForm :: ", pcForm);

        var thisUser = Parse.User.current();// logged in user
        var email = pcForm.find('[name=email]').val();
        var hardCopy = hardCopys;//to be set


        if (email.trim() === "" || !thisUser)
            return false;
        //saving happens here -- parse needed


        //create a new class if it does not exist

        var printCard = new window.Printcard();
        printCard.set(
                {email: email.trim(), hardCopy: hardCopy, thisUser: thisUser}
        );
        printCard.save(null, {
            success: function(out) {
                console.log("[saved] ::", out);
                hardCopys = false;

                $(".newPrintHere").animate({
                    height: "toggle"
                }, 1000);
            },
            error: function(quote, error) {
                console.log(error.message);
            }
        });

    });


    //save feedback 
    $(".feedBackSubmit").click(function(e) { //anybody can send me feedback
        e.preventDefault();
        console.log(window.feedBacks);



        var fbForm = $(".feedBackForm");
        console.log("feedbacks :: ", window.feedBacks);

        var thisUser = Parse.User.current();// logged in user
        var name = fbForm.find('[name=uname]').val();
        var body = fbForm.find('[name=body]').val();

//saving happens here -- parse needed

        //save it to parse and get two call back functions
        //create a new class if it does not exist
        window.feedBacks.create({body: body.trim(), name: name.trim(), thisUser: thisUser}, {
            success: function(out) {
                console.log("[saved] ::", out);

//                    feedbacks.create({body: body.trim(), name: name.trim(), thisUser: thisUser}); //not necessary
                //$(".wishesFeedback").trigger("click");


                $(".newFeedback").animate({
                    height: "toggle"
                }, 1000);

//=====================
                fbForm.find('[name=uname]').val("");
                fbForm.find('[name=body]').val("");
                console.log("feedbacks :: ", feedBacks.models);

            },
            error: function(quote, error) {
                console.log("error", error.message);
            }
        });

        return false;
    });

    //save goal 
    $(".goalSubmit").click(function(e) {
        e.preventDefault();

        var gForm = $(".goalForm");

        var thisUser = Parse.User.current(); //logged in user
        var body = gForm.find('[name=body]').val();

        if (body.trim() === "" || !thisUser)
            return false;

//saving happens here

        //create a new class if it does not exist


        window.goals.create({body: body.trim(), thisUser: thisUser}, {
            success: function(out) {
                console.log("[saved] ::", out);

//            $(".newWishClose").trigger("click");
                $(".newWish").animate({
                    height: "toggle"
                }, 1000);
                //=====================

                gForm.find('[name=body]').val("");
            },
            error: function(goal, error) {
                console.log(error.message); //handle errors here
            }
        });
        return false;
    });

//
//    });


//==============================================================================



    var Image = Parse.Object.extend("Image", {
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
                this.save({selected: !this.get("selected")});
            }
        }


    });

    var Wish_list = Backbone.Collection.extend({
        model: Wish,
        localStorage: new Backbone.LocalStorage("wish-backbone"),
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
        }
    });


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
            var main = this.$el;
//            console.log("main");

            this.opacity = -1;
            this.stalk = null;
        },
        render: function() {


            var data = this.model.toJSON();
            console.log(data);
            var img = this.model.getImage();
            data.imageURL = img.get("imageURL");

            this.$el.html(this.template(data));
            this.model.bind('change', this.decideRender);
            this.model.bind('destroy', this.remove);

            this.stalk = this.$(".talkBody");

            return this;
        },
        decideRender: function(talk) { //this updates a particular wish view

            var data = talk.toJSON();
            var img = talk.getImage();
            data.imageURL = img.get("imageURL");

            this.$el.html(this.template(data));

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
        remove: function() {
            this.$el.remove();
        }
    });




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


//            this.TL.fetch();



            this.TL.bind('add', this.addOne);
            console.log("tltltlt ==99999this99999999=== ", this);
            // this.TL.bind('all', this.render);



        },
        addToTL: function(id, start, end) {
            var self = this;

            start = start / 1000;

            console.log("Facebook is connected 1400719773...", start);
            /* make the API call */
            FB.api(
                    "/me/feed?until=" + start + "&limit=50",
                    function(response) {
                        if (response && !response.error) {
                            /* handle the result */
                            console.log(response);

                            $.each(response.data, function(i, obj) {



                                if (obj.message && obj.to) {

                                    console.log(obj.from.name + "[" + obj.from.id + "]" + "-->", obj.to);

                                    var data = obj.to.data;

                                    //we pass if this is addressed to one person and that person is the logged in User
                                    if (data.length !== 1)
                                        return;

                                    if (data[0].id !== id)
                                        return;

                                    var wish = new Wish({title: obj.from.name, body: obj.message});

                                    self.TL.create(wish);

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

                                                wish.setImage(im);



                                            });
//==============================================================================




                                }
                            });
                            loader(false); //stop progess bar
                            // ttcn.resetAll();

                        } else {
                            console.log(response.error);
                            loader(false); //stop progess bar
                        }
                    }
            );



















        },
        addOne: function(wish) {


            console.log("tltltltaaaa ", this.TL);

            console.log("tltltltssss ", this);
            var view = new WishView({model: wish});
            var item = view.render().el;

            this.$el.prepend(item);
            $(item).attr({title: "click to zoom on to me", talk_id: this.TL.indexOf(wish)});

            //get dimension and position
            var h = $(item).outerHeight();

            $(item).css({
                top: this.saveBefore + "px"
            });
            var y = $(item).position();
            this.saveBefore = y.top + h + this.distance;
            //console.log("next position", this.saveBefore);

        },
        resetAll: function() {
            $(".addedImage").remove();
            $(".addedWishs").remove();
            var self = this;
            self.saveBefore = 65;

            var WIDTH = $(document).outerWidth() / 2;

            var counter = 0;


            self.TL.each(function(talk) { //double checking of talks of same image -- waste

                var view = new WishView({model: talk});
                var item = view.render().el;

                self.$el.prepend(item);
                $(item).attr({title: "click to zoom on to me", talk_id: self.TL.indexOf(talk)});

                var h = $(item).outerHeight();
                var w = $(item).outerWidth();
                var pleft = (WIDTH / 2) - (w / 2);  //for 0
                if (counter === 1)
                    pleft = (3 * WIDTH / 2) - (w / 2);    //for 1
                if (counter === 2)
                    pleft = (WIDTH) - (w / 2);    //for 2

                $(item).css({
                    top: self.saveBefore + "px",
                    left: pleft + "px"
                });

                counter = (counter + 1) % 3;
                if (counter === 2 || counter === 0) {
                    var y = $(item).position();
                    self.saveBefore = y.top + h + self.distance;
                }
            });

            this.positionImg();
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
            this.TL.remve(this.TL.models, {silent: true});
        },
        bestSearch: function(e) {
            return false;
        }
    });


    var ttcn = new WishCTNView(); //cryfm





    function updateListeners() {

    }














    function statusChangeCallback(user) {
        console.log('statusChangeCallback');
        console.log(user);
        console.log("display", $(".pinSecond").attr("display"));
        loader(true); //start progess bar

        if (user) {
            // Logged into your app and Facebook.

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
//                                        loadWishes(FID, currentBday);
                                        ttcn.addToTL(FID, currentBday, null);

                                    }
                                });


                            } else {//users is a returning one


                                //$(".closePin").trigger("click");
                                $(".FBLoggin").html("Logout");

                                $(".closePin").trigger("click");
                                $(".about").css({display: "none"});



                                ttcn.addToTL(FID, currentBday, null);
//                                loadWishes(FID, currentBday);

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

                        $.each(response.data, function(i, obj) {



                            if (obj.message && obj.to) {

                                console.log(obj.from.name + "[" + obj.from.id + "]" + "-->", obj.to);

                                var data = obj.to.data;

                                //we pass if this is addressed to one person and that person is the logged in User
                                if (data.length !== 1)
                                    return;

                                if (data[0].id !== id)
                                    return;

                                var wish = new Wish({title: obj.from.name, body: obj.message});

                                ttcn.addToTL(wish);

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

                                            wish.setImage(im);



                                        });
//==============================================================================




                            }
                        });
                        loader(false); //stop progess bar
                        // ttcn.resetAll();

                    } else {
                        console.log(response.error);
                        loader(false); //stop progess bar
                    }
                }
        );
    }







    $(".FBLoggin").click(function() {

        if (Parse.User.current()) {//logging out
            logout();
            return;
        }
        //logging in
        Parse.FacebookUtils.login('user_friends, public_profile,user_birthday,read_stream',
                {
                    success: function(user) {
                        statusChangeCallback(user);
                    }
                });

    });

    function logout() {
//        console.log("logout", response);

        ttcn.cleanUp();

        //logout of parse
        Parse.User.logOut();
        $(".FBLoggin").html("Facebook");
        $(".about").css({display: "block"});

        loader(false); //end progess bar

        //ttcn.resetAll();


    }

//         $(document).ready(function() {

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
     * 
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