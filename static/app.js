
// most importantly, argon applications should only render when asked to do so,
// rather than in response to animation or other updates.  

// The original example is in the original-three-example.html file in this directory


var MAX_ANSWERS = 5;
var QUESTIONS = [
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

// set up Argon
var app = Argon.init();

var camera, scene, renderer, hud, raycaster;
var periodicTable, stage;

var objects = [];
var targets = {sphere: []};

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

function init() {
//  // some of the exact locations of content below have been changed slightly from the original
//  // example so that they work reasonably on smaller mobile phone screens.
//  for ( var i = 0; i < tableContent.length; i ++ ) {
//
//    var item = tableContent[ i ];
//
//    // var element = document.createElement( 'div' );
//    // element.className = 'element';
//    // element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';
//
//    // // if it's Argon make it bright red
//    // if (i==17) element.style.backgroundColor = 'rgba(127,0,0,1)';
//
//    // var number = document.createElement( 'div' );
//    // number.className = 'number';
//    // number.textContent = i + 1;
//    // element.appendChild( number );
//
//    // var symbol = document.createElement( 'div' );
//    // symbol.className = 'symbol';
//    // symbol.textContent = item[ 0 ];
//    // element.appendChild( symbol );
//
//    // var details = document.createElement( 'div' );
//    // details.className = 'details';
//    // details.innerHTML = item[ 1 ] + '<br>' + item[ 2 ];
//    // element.appendChild( details );
//
//    //let element = document.createElement("div");
//    element.className = "answer";
//    element.textContent = "Hello world!"
//
//    var object = new THREE.CSS3DObject( element );
//    object.position.x = Math.random() * 4000 - 2000;
//    object.position.y = Math.random() * 4000 - 2000;
//    object.position.z = Math.random() * 4000 - 2000;
//    THREE.SceneUtils.traverseHierarchy( object, function ( object ) { object.visible = false; } );
//    //object.matrixAutoUpdate = false;
//    objects.push( object0 );
//
//    // Add each object our root node
//    periodicTable.add(object);
//  }
//
//  // table
//
//  for ( var i = 0; i < objects.length; i ++ ) {
//
//    var item = tableContent[ i ];
//
//    var target = new THREE.Object3D();
//
//    target.position.x = ( item[ 3 ] * 140 ) - 1330;
//    target.position.y = - ( item[ 4 ] * 180 ) + 990;
//    target.position.z = - 1000;
//
//    targets.table.push( target );
//
//  }

  for(var i = 0; i < MAX_ANSWERS; i++){
    var element = document.createElement("div");
    element.className = "answer";
    element.textContent = "Hello world!";
    element.onclick = () => alert("hi");

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

  for ( var i = 0; i < objects.length; i ++ ) {

    var phi = Math.acos( -1 + ( 2 * i ) / objects.length );
    var theta = Math.sqrt( objects.length * Math.PI ) * phi;
    var target = new THREE.Object3D();

    target.position.x = 800 * Math.cos( theta ) * Math.sin( phi );
    target.position.y = 800 * Math.sin( theta ) * Math.sin( phi );
    target.position.z = 800 * Math.cos( phi );

    target.lookAt( vector );

    targets.sphere.push( target );

  }
    
  changeQuestion();

  // move the menu to the Argon HUD.  We don't duplicate it because we only
  // use it in mono mode
  var hudContainer = document.getElementById( 'hud' );
  hud.hudElements[0].appendChild(hudContainer);

  transform( targets.sphere, 1000);

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


function changeQuestion() {
    var current_question = Math.floor(Math.random() * QUESTIONS.length);
    document.getElementById('draw_question').innerHTML = QUESTIONS[current_question].question;
    var current_answer = QUESTIONS[current_question].answer;
    var wrong1 = -1;
    var wrong2 = -1;
    var wrong3 = -1;
    
    var wrongs = [];

    wrongs.push(current_question);
    
    for(i = 1; i < MAX_ANSWERS; i++) {
        var check = false;
        while (!check) {
            check = true;
            var newThing = Math.floor(Math.random() * (QUESTIONS.length));
            for (j = 0; j < wrongs.length; j++) {
                if (newThing === wrongs[j]) {
                    check = false;
                }
            }
        }
        
        wrongs.push(newThing);
    }
    
    objects[0].elements[0].textContent = current_answer;

    
    for(i = 0; i < wrongs.length; i++) {
        objects[i].elements[0].textContent = QUESTIONS[wrongs[i]].answer;
    }
}
    
    
    
    
    
    
    