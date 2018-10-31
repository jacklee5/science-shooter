
// most importantly, argon applications should only render when asked to do so,
// rather than in response to animation or other updates.  

// The original example is in the original-three-example.html file in this directory

//menu stuff
var spookCount = 0;
var BGM = new Audio('sfx/Jobel.mp3');
var SETS = {
  "set1": [
    {question: "What is the only non-metal element that is liquid at room temperature?", answer: "Bromine"},
    {question: "What is the only metal element that is liquid at room temperature?", answer: "Mercury"},
    {question: "What noble gas has the least amount of protons?", answer: "Helium"},
    {question: "What element has 82 protons?", answer: "Lead"},
    {question: "What alkaline earth metal is most likely to have an atom with 13 neutrons?", answer: "Magnesium"}
  ],
  "set2":[
    {question: "What is the only non-metal element that is liquid at room temperature?", answer: "Bromine"},
    {question: "What is the only metal element that is liquid at room temperature?", answer: "Mercury"},
    {question: "What noble gas has the least amount of protons?", answer: "Helium"},
    {question: "What element has 82 protons?", answer: "Lead"},
    {question: "What alkaline earth metal is most likely to have an atom with 13 neutrons?", answer: "Magnesium"},
    {question: "What are the visible wavelengths?", answer: "400-700nm"},
    {question: "What is the speed of light?", answer: "3.00 * 10^6 m/s"},
    {question: "What element is all life based on", answer: "Carbon"},
    {question: "What is the terminal election acceptor in cell respiration?", answer: "Oxygen"},
    {question: "What is the number chromosomes in a human male?", answer: "46"},
    {question: "What is value of accelation due to gravity?", answer: "9.8 m/s^2"},
    {question: "What type of light occurs just above the visible spectrum in energy?", answer: "Infrared"}
  ]
};
var QUESTIONS = [];
var timing = false;

(() => {
  var helpButton = document.getElementById("help-button");
  var playButton = document.getElementById("play-button");
  var backButton = document.getElementById("back-button");
  var startMenu = document.getElementById("start-menu");
  var goodjob = document.getElementById("goodjob");
  var badjob = document.getElementById("badjob");
  var p1 = document.getElementById("p1");
  var p2 = document.getElementById("p2");
  helpButton.addEventListener("click", () => {
    p1.style.display = "none";
    p2.style.display = "block";
  });
  backButton.addEventListener("click", () => {
    p1.style.display = "block";
    p2.style.display = "none";
  });
  playButton.addEventListener("click", () => {
    var setSelect = document.getElementById("set-select");
    QUESTIONS = SETS[setSelect.options[setSelect.selectedIndex].value];
    console.log(QUESTIONS);
    changeQuestion();
    timing = true;
    startMenu.style.display = "none";
    BGM.loop = true;
    BGM.play();
  });
  goodjob.addEventListener("touchstart", () => {
    goodjob.style.display = "none";
    timing = true;
  });
  badjob.addEventListener("touchstart", () => {
    badjob.style.display = "none";
    timing = true;
  })
})();

var MAX_ANSWERS = 5;

//dependencies D:
var CESIUM_BASE_URL = '../resources/cesium/';
// grab some handles on APIs we use
var Cesium = Argon.Cesium;
var Cartesian3 = Argon.Cesium.Cartesian3;
var ReferenceFrame = Argon.Cesium.ReferenceFrame;
var JulianDate = Argon.Cesium.JulianDate;
var CesiumMath = Argon.Cesium.CesiumMath;
var plane = new THREE.Plane();
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var offset = new THREE.Vector3();
var intersection = new THREE.Vector3();
var tempPos = new THREE.Vector3();
var INTERSECTED, SELECTED;

// set up Argon
var app = Argon.init();

var camera, scene, renderer, hud, raycaster;
var periodicTable, stage;

var objects = [];
var targets = {sphere: []};

var score = 0;

// In argon, we use a custom version of the CSS3DRenderer called CSS3DArgonRenderer.
// This version of the renderer supports stereo in a way that fits with Argon's renderEvent,
// especially supporting the user providing multiple divs for the potential multiple viewports
// in stereo mode.
renderer = new THREE.CSS3DArgonRenderer();
// The CSS3DArgonHUD has a similar interface to a renderer, and provides a simple abstraction
// for multiple HTML HUD's that can be used in stereo mode.  We do not
// use the HUD features here (instead, just removing the buttons below when in Stereo mode)
hud = new THREE.CSS3DArgonHUD();

// argon creates the domElement for the view, which we add our renderer dom to
app.view.setLayers([
  {source: renderer.domElement}, 
  {source: hud.domElement}
])

// argon will pass us the camera projection details in each renderEvent callback.  This
// is necessary to handle different devices, stereo/mono switching, etc.   argon will also
// tell us the position of the camera to correspond to user movement
camera = new THREE.PerspectiveCamera();
scene = new THREE.Scene();
raycaster = new THREE.Raycaster();

// add a new Object3D, periodicTable, that serves as the root of the periodic table in local coordinates.
// Since the camera is moving in AR, and we want to move the content with us, but have it
// oriented relative to the world, putting it in a sub-graph under the stage object
// let's us move the location of the content with us.  Content should not be added to the 
// scene directly unless it is going to be updated as the user moves through the world 
// (since the world coordinate system is abitrarily chosen to be near the user, and could
// change at any time)

periodicTable = new THREE.Object3D()
periodicTable.scale.setScalar(0.001);

stage = new THREE.Object3D;

// Add the periodicTable node to our stage
stage.add(periodicTable)
scene.add(stage);
scene.add(camera);

// need init to run after everything loads
window.addEventListener( 'load', init );

// The original animate function was called once to start the 
// requestAnimationFrame update cycle.  We don't do that with Argon
//    animate();

function addPoint(){
    var notCole = new Audio('sfx/NotCole.mp3');
    notCole.volume = .5;
    notCole.play();
  document.getElementById("score").textContent = ++score;
  changeQuestion();
  document.getElementById("goodjob").style.display = "block";
}

function init() {

  for(var i = 0; i < MAX_ANSWERS; i++){
    var element = document.createElement("div");
    element.className = "answer";
    element.textContent = "Hello world!";
    element.addEventListener("touchstart", (e) => {
      var el = e.target;
      timing = false;
      if(Number(el.dataset.correct)) {
        addPoint();
        spookCount = 0;
      } else {
        spookCount++;
        if (spookCount >= 10) {
            alert("It looks like you're having a bad time.");
            new Audio('sfx/Help.mp3').play();
            spookCount = 0;
        } else { 
            var yourBad = new Audio('sfx/YourBad.mp3');
            yourBad.volume = .5;
            yourBad.play();
        }

        document.getElementById("badjob").style.display = "block";
        changeQuestion();
      }
      
    });
    element.style.pointerEvents = "auto";

    var object = new THREE.CSS3DObject( element );
    object.position.x = 0;
    object.position.y = 0;
    object.position.z = 0;
    object.id = "id" + i.toString();
    objects.push( object );

    periodicTable.add(object);
  }


  // sphere

  var vector = stage.position;

  for ( var i = 0; i < MAX_ANSWERS; i ++ ) {

    var phi = Math.acos( -1 + ( 2 * i ) / MAX_ANSWERS );
    var theta = Math.sqrt( MAX_ANSWERS * Math.PI ) * phi;
    var target = new THREE.Object3D();

    target.position.x = 800 * Math.cos( theta ) * Math.sin( phi );
    target.position.y = 800 * Math.sin( theta ) * Math.sin( phi );
    target.position.z = 800 * Math.cos( phi );

    target.lookAt( vector );

    targets.sphere.push( target );

  }

  // move the menu to the Argon HUD.  We don't duplicate it because we only
  // use it in mono mode
  var hudContainer = document.getElementById( 'hud' );
  hud.hudElements[0].appendChild(hudContainer);

  transform(targets.sphere, 1000);

}

function transform( targets, duration ) {
  TWEEN.removeAll();
      for ( var i = 0; i < objects.length; i ++ ) {

        var object = objects[ i ];
        var target = targets[ i ];

        new TWEEN.Tween( object.position )
          .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
          .easing( TWEEN.Easing.Exponential.InOut )
          .start();

        new TWEEN.Tween( object.rotation )
          .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
          .easing( TWEEN.Easing.Exponential.InOut )
          .start();

      }

      // An EXTREMELY important difference between creating desktop 3D content and 
      // AR content using Argon is that we should not render except when argon tells
      // us to.  In this way, Argon can decide when to render based on the kind of Reality 
      // being rendered, and the device being used.  So, we do not leverage the Tween.onUpdate
      // callback. 
      new TWEEN.Tween( this )
        .to( {}, duration * 2 )
//					.onUpdate( render )
        .start();
  
}

// the updateEvent is called each time the 3D world should be
// rendered, before the renderEvent.  The state of your application
// should be updated here.  Here, we call TWEEN.update()
app.updateEvent.on(function () {
    // get the position and orientation (the "pose") of the stage
    // in the local coordinate frame.
    var stagePose = app.getEntityPose(app.stage);

    // set the position of our THREE user object to match it
    stage.position.copy(stagePose.position);
    stage.quaternion.copy(stagePose.orientation);

    if (app.userTracking === '6DOF') {
      if (app.displayMode === 'head') {
        periodicTable.position.set(0, Argon.AVERAGE_EYE_HEIGHT, 0);
      } else {
        periodicTable.position.set(0, Argon.AVERAGE_EYE_HEIGHT / 2, 0);
      }
    } else {
      const userStagePose = app.getEntityPose(app.user, app.stage);
      periodicTable.position.set(0, userStagePose.position.y, 0);
    }

    // update the moving DIVs, if need be
    TWEEN.update();  

    let dir = camera.getWorldDirection();
});

// for the CSS renderer, we want to use requestAnimationFrame to 
// limit the number of repairs of the DOM.  Otherwise, as the 
// DOM elements are updated, extra repairs of the DOM could be 
// initiated.  Extra repairs do not appear to happen within the 
// animation callback.
var viewport = null;
var subViews = null;
app.renderEvent.on(function () {
    viewport = app.view.viewport;
    subViews = app.view.subviews;

    rAFpending = false;
    // set the renderer to know the current size of the viewport.
    // This is the full size of the viewport, which would include
    // both views if we are in stereo viewing mode
    renderer.setSize(viewport.width, viewport.height);
    hud.setSize(viewport.width, viewport.height);

    // There is 1 subview in monocular mode, 2 in stereo mode.
    // If we are in mono view, show the buttons.  If not, hide them, 
    // since we can't interact with them in an HMD
    if (subViews.length > 1 || !app.focus.hasFocus) {
      hud.domElement.style.display = 'none';
    } else {
      hud.domElement.style.display = 'block';
    }

    // we pass the view number to the renderer so it knows 
    // which div's to use for each view
    for (var _i = 0, _a = subViews; _i < _a.length; _i++) {
        var subview = _a[_i];
        var frustum = subview.frustum;

        // set the position and orientation of the camera for 
        // this subview
        camera.position.copy(subview.pose.position);
        camera.quaternion.copy(subview.pose.orientation);
        // the underlying system provide a full projection matrix
        // for the camera.  Use it, and then update the FOV of the 
        // camera from it (needed by the CSS Perspective DIV)
        camera.projectionMatrix.fromArray(subview.frustum.projectionMatrix);
        camera.fov = THREE.Math.radToDeg(frustum.fovy);

        // set the viewport for this view
        var _b = subview.viewport, x = _b.x, y = _b.y, width = _b.width, height = _b.height;
        renderer.setViewport(x, y, width, height, _i);
        hud.setViewport(x, y, width, height, _i);

        // render this view.
        renderer.render(scene, camera, _i);
        hud.render(_i);
    }
});

//var question = 'What is element 113?'
//document.getElementById('draw_question').innerHTML = question;
//var current_answer

function changeQuestion(){
  if(QUESTIONS.length === 0) return;
  var q = Math.floor(Math.random() * QUESTIONS.length);
  document.getElementById("draw_question").innerHTML = QUESTIONS[q].question;
  var a = QUESTIONS[q].answer;

  for(var i = 0; i < MAX_ANSWERS; i++){
    var ans = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)].answer;
    while(ans === a){
      ans = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)].answer;
    }
    objects[i].elements[0].textContent = ans;
    objects[i].elements[0].dataset.correct = "0";
  }

  let el = objects[Math.floor(Math.random() * MAX_ANSWERS)].elements[0];
  el.textContent = a;
  el.dataset.correct = "1";
}

//timer stuff
setInterval(() => {
  if(!timing) return;
  let el = document.getElementById("time");
  if(!Number(el.textContent)){
    document.getElementById("gameover").style.display = "block";
    document.getElementById("final-score").textContent = score;
  }else{
    el.textContent = Number(el.textContent) - 1;
  }
}, 1000)
    
    
    
    
    
    
    