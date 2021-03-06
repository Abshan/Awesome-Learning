let video;
let gestures;
let hand;
let grade;
let subject;
let no_questions;
let poses = [];
let boolIn = false;
let begin = 0;
let end = 0;
let inTime = false;
let started = false;
let ended = false;
let q_array = []; //question array
let a_array = []; //answer array
let queStarted = false;
let skip = false;
let swipe = false;
let backChck = false;
let startquestionChk = false;

// Start Question Button Event
const startQuestionButton = document.querySelector('#start-question');

startQuestionButton.addEventListener('click', (e) => {
    e.preventDefault();

    hand = document.getElementById('dominant_Hand').value;
    grade = document.getElementById('grade').value;
    subject = document.getElementById('subject').value;
    no_questions = parseInt(document.getElementById('no_questions').value);

    if (hand != "" && grade != "" && subject != "" && no_questions != "") {
        //Query to get the questions
        db.collection('questions').where("grade", "==", grade).where("subject", "==", subject).limit(no_questions).get().then((snapshot) => {
            snapshot.docs.forEach(doc => {
                q_array.push(doc.data());
            });

            if (q_array.length == 0) {
                alert('Currently ther are no questions available in the selected subject');
            } else {
                if(hand == 'Left'){
                    select('#m1').html('Swipe right using your left hand to start the questionnaire.');
                    select('#m2').html('Swipe left using your left hand to go to the previous question.');
                }else{
                    select('#m1').html('Swipe left using your right hand to start the questionnaire.');
                    select('#m2').html('Swipe right using your right hand to go to the previous question.');
                }
                document.querySelector('#welcome-screen').style.display = 'none';
                document.querySelector('#question-panel').style.display = 'block';
                queStarted = true;
            }
        })
    } else {
        alert('Please select all the preferences...');
    }
});


function setup() {

    const canvas = createCanvas(280, 210);
    canvas.parent('videoContainer');

    // Video capture
    video = createCapture(VIDEO);
    video.size(640, 480);

    let options = {
        detectionType: 'single',
        outputStride: 8
    }

    // Create a new gestureList method with a single detection
    gestures = gestureList.gestures(video, options, modelReady);
    // This sets up an event that fills the global variable "poses"
    // with an array every time new poses are detected
    gestures.on('pose', function (results) {
        poses = results;

        if (queStarted == true) {

            //True & false gesture detection
            try {
                if ((~~poses[0].pose.leftWrist.y < 220) && (~~poses[0].pose.leftWrist.x > 480) && (~~poses[0].pose.leftElbow.y < 360) && (ended == false)) {
                    if ($('input[value=False]:checked').length === 0) {
                        $('input[value=False]').prop('checked', true);
                        swipe = true;
                        document.getElementById('click').play();
                        swipeWait();
                    }
                }

                if ((~~poses[0].pose.rightWrist.y < 220) && (~~poses[0].pose.rightWrist.x < 160) && (~~poses[0].pose.rightElbow.y < 360) && (ended == false)) {
                    if ($('input[value=True]:checked').length === 0) {
                        $('input[value=True]').prop('checked', true);
                        swipe = true;
                        document.getElementById('click').play();
                        swipeWait();
                    }

                }



                //Swipe gesture detection
                if (hand == 'Right') {

                    if ((~~poses[0].pose.rightWrist.y > 100) && (~~poses[0].pose.rightWrist.y < 400)) {
                        if (boolIn == false && begin === 0) {
                            begin = ~~poses[0].pose.rightWrist.x + 80;
                            boolIn = true;
                        }
                        inTime = true;

                    } else {
                        if (inTime == true) {
                            if (boolIn == true && begin != 0 && end === 0) {
                                end = ~~poses[0].pose.rightWrist.x;

                                if (end > begin && ended == false && swipe == false) {
                                    if ($('input[value=True]:checked').length > 0 || $('input[value=False]:checked').length > 0) {
                                        $('.next').click();
                                        document.getElementById('swipe').play();
                                        swipe = true;
                                        swipeWait();
                                    }
                                    if (started == false && ended == false) {
                                        $('#next').click();
                                        started = true;
                                        swipe = true;
                                        swipeWait();
                                    }
                                }

                                // Swipe back gesture
                                if (end < begin - 220 && ended == false && backChck == false && swipe == false) {
                                    $('.back').click();
                                    document.getElementById('swipe').play();
                                    swipe = true;
                                    swipeWait();
                                }
                            }
                        }
                        inTime = false;
                        boolIn = false;
                        begin = 0;
                        end = 0;
                    }
                }

                if (hand == 'Left') {

                    if ((~~poses[0].pose.leftWrist.y > 100) && (~~poses[0].pose.leftWrist.y < 400)) {
                        if (boolIn == false && begin === 0) {
                            begin = ~~poses[0].pose.leftWrist.x - 80;
                            boolIn = true;
                            console.log('1st step working');
                        }
                        inTime = true;

                    } else {
                        if (inTime == true) {
                            if (boolIn == true && begin != 0 && end === 0) {
                                end = ~~poses[0].pose.leftWrist.x;

                                if (end < begin && ended == false && swipe == false) {
                                    console.log('2nd step working');
                                    if ($('input[value=True]:checked').length > 0 || $('input[value=False]:checked').length > 0) {
                                        $('.next').click();
                                        document.getElementById('swipe').play();
                                        swipe = true;
                                        swipeWait();
                                    }
                                    if (started == false && ended == false) {
                                        $('#next').click();
                                        started = true;
                                        swipe = true;
                                        swipeWait();
                                    }
                                }

                                // Swipe back gesture
                                if (end > begin + 220 && ended == false && backChck == false && swipe == false) {
                                    $('.back').click();
                                    document.getElementById('swipe').play();
                                    swipe = true;
                                    swipeWait();
                                }
                            }
                        }
                        inTime = false;
                        boolIn = false;
                        begin = 0;
                        end = 0;
                    }
                }


                //Skip gesture detection
                if ((~~poses[0].pose.leftWrist.y > 160) && (~~poses[0].pose.leftWrist.y < 400) && (~~poses[0].pose.leftWrist.x > 400)) {
                    if ((~~poses[0].pose.rightWrist.y > 160) && (~~poses[0].pose.rightWrist.y < 400) && (~~poses[0].pose.rightWrist.x < 220)) {
                        //alert("Skipped");
                        if (skip == false && ended == false && startquestionChk == true) {
                            $('input[value=False]').prop('checked', false);
                            $('input[value=True]').prop('checked', false);
                            document.getElementById('skip').play();
                            $('.next').click();
                            skip = true;
                            loading();
                        }
                    }
                }

            } catch{
                console.log('runtime error detected');
            }
        }
    });

    // Hide the video real element, and just show the canvas video
    video.hide();
}

function loading() {
    setTimeout(function () {
        skip = false;
    }, 5000);
}

function swipeWait() {
    setTimeout(function () {
        swipe = false;
    }, 1000);
}

function draw() {
    image(video, 0, 0, width, height);
}

function modelReady() {
    select('#status').html('Camera Feed Is Active')
}



// Question Panel
$(document).ready(function () {


    var outputs = $('.quiz'), // output div
        button = $('#next'), //start quiz button
        bacq = $('.back'),  //back button
        nexq = $('.next'), //next question button
        feedq = $('.feedback'), //Feedback Button
        returnq = $('.replay'); // play again button



    //Function that creates radio button
    var createRadio = function (index) {
        var ulist = $('<ul>');
        var items;
        var bli = $('<li>');
        var input;
        for (var i = 0; i < q_array[index].choices.length; i++) {
            items = $('<li>');
            input = '<input type="radio" id="answer" name="answer" value=' + q_array[index].choices[i] + '>';
            input += q_array[index].choices[i];
            items.append(input);
            ulist.append(items);
        }

        return ulist;
    }


    //Function that counts right answers and displays message accordingly
    var right = function (question, answer) {
        var div = $('<div></div>', { class: 'output' });
        var ul = $('<ul>', { class: 'final' });
        var li;
        var input;
        var paraq;
        for (var i = 0; i < question.length; i++) {
            if (question[i].answer === answer[i]) {
                display.correct++;
                li = $('<li>');
                paraq = $('<p style="color:#008000;">', { class: 'success' });
                paraq.append(question[i].question);
                li.append(paraq);
                for (var j = 0; j < question[i].choices.length; j++) {
                    if (question[i].choices[j] === answer[i]) {
                        input = '<input type="radio" id="answer" name=answer-' + i + ' value=' + question[i].choices[j] + ' checked="checked">';
                        input += question[i].choices[j];
                    } else {
                        input = '<input type="radio" id="answer" name=answer-' + i + ' value=' + question[i].choices[j] + '>';
                        input += question[i].choices[j];
                    }
                    li.append(input);
                    ul.append(li);
                }

            } else {
                li = $('<li>');
                paraq = $('<p style="color:#F00;">', { class: 'error' });
                paraq.append(question[i].question + '  <small>(' + question[i].answer + ')</small>');
                li.append(paraq);
                for (var j = 0; j < question[i].choices.length; j++) {
                    if (question[i].choices[j] === answer[i]) {
                        input = '<input type="radio" name=answer-' + i + ' value=' + question[i].choices[j] + ' checked>';
                        input += question[i].choices[j];
                    } else {
                        input = '<input type="radio" name=answer-' + i + ' value=' + question[i].choices[j] + '>';
                        input += question[i].choices[j];
                    }
                    li.append(input);
                    ul.append(li);
                }
            }
        }
        div.append(ul);
        return div;
    }

    //Function displays radios and questions
    var display = function () {
        if (display.index < q_array.length) {
            var div = $('<div></div>', { class: 'output' });
            var header = $('<h2>Question ' + (display.index + 1) + '</h2>');
            div.append(header);

            var paraq = $('<p>').append(q_array[display.index].question);
            div.append(paraq);

            var radio = createRadio(display.index);
            div.append(radio);

            outputs.append(div);

        } else {
            document.getElementById('win').play();
            var greet = $('<h3>');
            var message = right(q_array, a_array);
            greet.text('Congratualtions you got ' + display.correct + ' questions right out of ' + q_array.length);
            ended = true;
            outputs.append(greet);
            outputs.append(message);
            bacq.css('display', 'none');
            nexq.css('display', 'none');
            feedq.css('display', 'inline-block');
            returnq.css('display', 'inline-block');
            display.index = 0;
            display.correct = 0;

        }
    }

    //Function pushes user answers in answer array
    var check = function () {
        var radios = document.getElementsByName('answer'),
            ans;
        for (var i = 0; i < radios.length; i++) {
            if (radios[i].checked) {
                ans = radios[i].value;
                a_array.push(String(ans));
            }
        }
    }

    button.on('click', function () {
        $(this).css('display', 'none');
        outputs.css('display', 'block');
        document.getElementById('begin').play();
        nexq.css('display', 'inline-block');
        display.index = 0;
        display.correct = 0;
        startquestionChk = true;
        display();
    });

    nexq.on('click', function () {
        check();
        outputs.empty();
        display.index++;
        bacq.css('display', 'inline-block');
        display();
    });

    bacq.on('click', function () {
        outputs.empty();
        display.index--;
        a_array.pop();
        if (a_array.length == 0) {
            backChck = true;
            bacq.css('display', 'none');
        } else {
            backChck = false;
            bacq.css('display', 'inline-block');
        }
        display();
    });

    returnq.on('click', function () {
        $(this).css('display', 'none');
        outputs.css('display', 'none');
        feedq.css('display', 'none');
        outputs.empty();
        display.index = 0;
        display.correct = 0;
        a_array = [];
        button.css('display', 'inline-block');
        button.css('margin-top', '10px');
        ended = false;
        started = false;
        startquestionChk = false;
    })

    const homePage = document.querySelector('#web-logo');

    homePage.addEventListener('click', (e) => {
        e.preventDefault();

        var visibility = document.getElementById('question-panel').style.display;

        if (visibility == 'none') {

        } else {
            outputs.css('display', 'none');
            feedq.css('display', 'none');
            returnq.css('display', 'none');
            nexq.css('display', 'none');
            bacq.css('display', 'none');
            outputs.empty();
            display.index = 0;
            display.correct = 0;
            a_array = [];
            q_array = [];
            button.css('display', 'inline-block');
            button.css('margin-top', '10px');
            ended = false;
            started = false;
            queStarted = false;
            startquestionChk = false;
            document.querySelector('#welcome-screen').style.display = 'inline-block';
            document.querySelector('#question-panel').style.display = 'none';
        }
    })

    auth.onAuthStateChanged(user => {
        if (user) {
            
        } else {
            outputs.css('display', 'none');
            feedq.css('display', 'none');
            returnq.css('display', 'none');
            nexq.css('display', 'none');
            bacq.css('display', 'none');
            outputs.empty();
            display.index = 0;
            display.correct = 0;
            a_array = [];
            q_array = [];
            button.css('display', 'inline-block');
            button.css('margin-top', '10px');
            ended = false;
            started = false;
            queStarted = false;
            startquestionChk = false;
            document.getElementById('entry-form-id').reset();
        }
    });

});

