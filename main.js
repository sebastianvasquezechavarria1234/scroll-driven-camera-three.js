import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { Sky } from 'three/addons/objects/Sky.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

import Lenis from 'lenis';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let mixer;
let model;
let orbitControls;
let isFree = false;
let freeTarget = { pos: new THREE.Vector3(), target: new THREE.Vector3(), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 0, 0 ) };
let savedRawT = 0;

const clock = new THREE.Clock();
const container = document.getElementById( 'container' );

const lenis = new Lenis({
	lerp: 0.08,
	smoothWheel: true,
});

const stats = new Stats();
container.appendChild( stats.dom );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild( renderer.domElement );

const scene = new THREE.Scene();

const sky = new Sky();
sky.scale.setScalar( 10000 );
scene.add( sky );

const uniforms = sky.material.uniforms;
uniforms[ 'turbidity' ].value = 2;
uniforms[ 'rayleigh' ].value = 1;
uniforms[ 'mieCoefficient' ].value = 0.005;
uniforms[ 'mieDirectionalG' ].value = 0.8;
uniforms[ 'sunPosition' ].value.set( 0, 1, 0 );

const pmremGenerator = new THREE.PMREMGenerator( renderer );
const environment = pmremGenerator.fromScene( sky ).texture;
scene.environment = environment;

const camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 100 );
camera.position.set( 5, 2, 8 );

const cameraPath = [
	{ pos: new THREE.Vector3( 5, 2, 8 ), target: new THREE.Vector3( 0, 0.7, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 0, 0 ), title: 'Inicio', desc: 'Cámara: (5, 2, 8) mirando (0, 0.7, 0) | Modelo: posición (1, 1, 0) rotación (0°, 0°, 0°). Vista general de toda la escena.' },
	{ pos: new THREE.Vector3( 2, 0, 4 ), target: new THREE.Vector3( 2, -1, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 0, 0 ), title: 'Sesión 1', desc: 'Cámara: (2, 0, 4) mirando (2, -1, 0) | Modelo: posición (1, 1, 0) rotación (0°, 0°, 0°). La cámara desciende y mira hacia abajo a la derecha.' },
	{ pos: new THREE.Vector3( -2, 4.5, 2 ), target: new THREE.Vector3( 0.5, 0.8, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 0, 0 ), title: 'Sesión 2', desc: 'Cámara: (-2, 4.5, 2) mirando (0.5, 0.8, 0) | Modelo: posición (1, 1, 0) rotación (0°, 0°, 0°). La cámara sube al lado izquierdo, vista elevada.' },
	{ pos: new THREE.Vector3( -2, 1, 4), target: new THREE.Vector3(2, -2, 0  ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 1, 0 ), title: 'Sesión 3', desc: 'Cámara: (-2, 1, 4) mirando (2, -2, 0) | Modelo: posición (1, 1, 0) rotación (0°, 57°, 0°). El modelo empieza a girar en Y, mostrando su lado derecho.' },
	{ pos: new THREE.Vector3( 0, 4.5, 2 ), target: new THREE.Vector3( 1, 0.3, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 2, 0 ), title: 'Sesión 4', desc: 'Cámara: (0, 4.5, 2) mirando (1, 0.3, 0) | Modelo: posición (1, 1, 0) rotación (0°, 115°, 0°). El modelo sigue girando, la cámara lo ve desde arriba.' },
	{ pos: new THREE.Vector3( 2, 1, 5 ), target: new THREE.Vector3( 0, -1, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 3, 0 ), title: 'Sesión 5', desc: 'Cámara: (2, 1, 5) mirando (0, -1, 0) | Modelo: posición (1, 1, 0) rotación (0°, 172°, 0°). El modelo casi ha dado media vuelta, la cámara retrocede.' },
	{ pos: new THREE.Vector3( 2.8, 0, 3 ), target: new THREE.Vector3( 0, -1, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 5.5, 0 ), title: 'Sesión 6', desc: 'Cámara: (2.8, 0, 3) mirando (0, -1, 0) | Modelo: posición (1, 1, 0) rotación (0°, 315°, 0°). Modelo casi da la vuelta completa, cámara al nivel del suelo.' },
	{ pos: new THREE.Vector3( 2.3, .6, 4 ), target: new THREE.Vector3( -1.2, -2, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 7, 0 ), title: 'Sesión 7', desc: 'Cámara: (2.3, 0.6, 4) mirando (-1.2, -2, 0) | Modelo: posición (1, 1, 0) rotación (0°, 401°, 0°). El modelo completa el giro, la cámara mira al lado opuesto.' },
	{ pos: new THREE.Vector3( 3, -0.5, 3 ), target: new THREE.Vector3( 0, -0.5, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 7, 0 ), title: 'Sesión 8', desc: 'Cámara: (3, -0.5, 3) mirando (0, -0.5, 0) | Modelo: posición (1, 1, 0) rotación (0°, 401°, 0°). Cámara baja al mínimo, vista desde el piso.' },
	{ pos: new THREE.Vector3( 1.3, -0.5, 1), target: new THREE.Vector3( 0, -0.5, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 7, 0 ), title: 'Sesión 9', desc: 'Cámara: (1.3, -0.5, 1) mirando (0, -0.5, 0) | Modelo: posición (1, 1, 0) rotación (0°, 401°, 0°). Cámara se acerca al modelo desde el frente-bajo.' },
	{ pos: new THREE.Vector3( 1.5, 5.5, 1 ), target: new THREE.Vector3( 1.5, -0.5, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 7, 0 ), title: 'Sesión 10', desc: 'Cámara: (1.5, 5.5, 1) mirando (1.5, -0.5, 0) | Modelo: posición (1, 1, 0) rotación (0°, 401°, 0°). Cámara sube bruscamente, vista cenital hacia el modelo.' },
	{ pos: new THREE.Vector3( 3, 0, 3 ), target: new THREE.Vector3( 0, -0.5, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 5.5, 0 ), title: 'Sesión 11', desc: 'Cámara: (3, 0, 3) mirando (0, -0.5, 0) | Modelo: posición (1, 1, 0) rotación (0°, 315°, 0°). Modelo regresa sobre su rotación, cámara retrocede.' },
	{ pos: new THREE.Vector3( 0, 2, 5 ), target: new THREE.Vector3( 0, 0.5, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 0, 0 ), title: 'Sesión 12', desc: 'Cámara: (0, 2, 5) mirando (0, 0.5, 0) | Modelo: posición (1, 1, 0) rotación (0°, 0°, 0°). Modelo vuelve a su rotación original, cámara al frente.' },
	{ pos: new THREE.Vector3( -2, 4, 9 ), target: new THREE.Vector3( 0, 0.7, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 0, 0 ), title: 'Final', desc: 'Cámara: (-2, 4, 9) mirando (0, 0.7, 0) | Modelo: posición (1, 1, 0) rotación (0°, 0°, 0°). Vista de despedida, cámara se aleja a la izquierda.' },
];

function getScrollProgress() {
	return lenis.progress;
}

function easeInOutCubic( t ) {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow( -2 * t + 2, 3 ) / 2;
}

function remapProgress( t ) {
	const n = cameraPath.length;
	const hold = 0.035;
	const segments = n - 1;
	const segSize = 1 / segments;

	const rawSeg = t * segments;
	const segIdx = Math.min( Math.floor( rawSeg ), segments - 1 );
	const localT = rawSeg - segIdx;

	const transitionSize = 1 - hold * 2;

	if ( localT < hold ) {
		return segIdx / segments;
	} else if ( localT > 1 - hold ) {
		return ( segIdx + 1 ) / segments;
	} else {
		const p = ( localT - hold ) / transitionSize;
		return ( segIdx + easeInOutCubic( p ) ) / segments;
	}
}

function lerpVector3( a, b, t ) {
	return new THREE.Vector3(
		a.x + ( b.x - a.x ) * t,
		a.y + ( b.y - a.y ) * t,
		a.z + ( b.z - a.z ) * t
	);
}

function lerpEuler( a, b, t ) {
	return new THREE.Euler(
		a.x + ( b.x - a.x ) * t,
		a.y + ( b.y - a.y ) * t,
		a.z + ( b.z - a.z ) * t
	);
}

function updateCameraFromScroll() {
	const t = remapProgress( getScrollProgress() );
	const segments = cameraPath.length - 1;
	const segment = Math.min( Math.floor( t * segments ), segments - 1 );
	const localT = ( t * segments ) - segment;

	const from = cameraPath[ segment ];
	const to = cameraPath[ segment + 1 ];

	camera.position.copy( lerpVector3( from.pos, to.pos, localT ) );
	camera.lookAt( lerpVector3( from.target, to.target, localT ) );

	if ( model ) {
		model.position.copy( lerpVector3( from.modelPos, to.modelPos, localT ) );
		model.rotation.copy( lerpEuler( from.modelRot, to.modelRot, localT ) );
	}
}

const overlayTitle = document.getElementById( 'session-title' );
const overlayDesc = document.getElementById( 'session-desc' );
const overlayBtn = document.getElementById( 'session-btn' );

let lastSessionIndex = -1;

function exitChars( el, callback ) {
	const chars = el.querySelectorAll( '.char' );
	if ( !chars.length ) { callback(); return; }

	chars.forEach( ( c, i ) => {
		c.style.transition = `all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
		c.style.transitionDelay = `${i * 5}ms`;
		c.style.opacity = '0';
		c.style.transform = 'translateY(-20px)';
	} );

	setTimeout( callback, chars.length * 5 + 200 );
}

function enterChars( el, text, delay = 0, stagger = 15 ) {
	el.innerHTML = '';

	[ ...text ].forEach( ( char, i ) => {
		const span = document.createElement( 'span' );
		span.className = 'char';
		span.textContent = char === ' ' ? '\u00A0' : char;
		span.style.display = 'inline-block';
		span.style.opacity = '0';
		span.style.transform = 'translateY(40px)';
		el.appendChild( span );

		setTimeout( () => {
			span.style.transition = `all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
			span.style.opacity = '1';
			span.style.transform = 'translateY(0)';
		}, delay + i * stagger );
	} );
}

function animateText( el, newText, delay = 0, stagger = 15 ) {
	if ( el.dataset.text === newText ) return;
	el.dataset.text = newText;

	exitChars( el, () => enterChars( el, newText, delay, stagger ) );
}

function updateOverlay() {
	const t = getScrollProgress();
	const index = Math.min( Math.floor( t * ( cameraPath.length - 1 ) ), cameraPath.length - 1 );

	if ( index === lastSessionIndex ) return;
	lastSessionIndex = index;

	const wp = cameraPath[ index ];

	animateText( overlayTitle, wp.title, 0, 25 );
	animateText( overlayDesc, wp.desc, 30, 3 );
	overlayBtn.textContent = wp.btn || 'Explorar';
}

overlayBtn.addEventListener( 'click', () => {
	isFree = true;
	savedRawT = getScrollProgress();
	document.getElementById( 'overlay' ).classList.add( 'hidden' );
	document.getElementById( 'close-btn' ).style.display = 'block';
	lenis.stop();

	const rt = remapProgress( savedRawT );
	const segs = cameraPath.length - 1;
	const s = Math.min( Math.floor( rt * segs ), segs - 1 );
	const lt = ( rt * segs ) - s;
	const f = cameraPath[ s ];
	const t = cameraPath[ s + 1 ];

	freeTarget.pos.copy( lerpVector3( f.pos, t.pos, lt ) );
	freeTarget.target.copy( lerpVector3( f.target, t.target, lt ) );
	freeTarget.modelPos.set( 1, 1, 0 );
	freeTarget.modelRot.set( 0, 0, 0 );

	orbitControls = new OrbitControls( camera, renderer.domElement );
	orbitControls.target.copy( freeTarget.target );
	orbitControls.enableDamping = true;
	orbitControls.dampingFactor = 0.08;
	orbitControls.update();
} );

document.getElementById( 'close-btn' ).addEventListener( 'click', () => {
	isFree = false;

	const blurOverlay = document.getElementById( 'blur-overlay' );
	blurOverlay.style.display = 'block';
	requestAnimationFrame( () => {
		blurOverlay.classList.add( 'active' );
	} );

	const rt = remapProgress( savedRawT );
	const segs = cameraPath.length - 1;
	const s = Math.min( Math.floor( rt * segs ), segs - 1 );
	const lt = ( rt * segs ) - s;
	const f = cameraPath[ s ];
	const t = cameraPath[ s + 1 ];

	setTimeout( () => {
		camera.position.copy( lerpVector3( f.pos, t.pos, lt ) );
		camera.lookAt( lerpVector3( f.target, t.target, lt ) );

		if ( model ) {
			model.position.copy( lerpVector3( f.modelPos, t.modelPos, lt ) );
			model.rotation.copy( lerpEuler( f.modelRot, t.modelRot, lt ) );
		}

		overlayTitle.textContent = f.title;
		overlayDesc.textContent = f.desc;
		overlayBtn.textContent = f.btn || 'Explorar';
		lastSessionIndex = s;

		if ( orbitControls ) {
			orbitControls.dispose();
			orbitControls = null;
		}

		blurOverlay.classList.remove( 'active' );
		setTimeout( () => {
			blurOverlay.style.display = 'none';
			document.getElementById( 'overlay' ).classList.remove( 'hidden' );
			document.getElementById( 'close-btn' ).style.display = 'none';
			lenis.start();
		}, 500 );
	}, 500 );
} );

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'https://unpkg.com/three@0.170.0/examples/jsm/libs/draco/' );

const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );
loader.load( 'models/gltf/LittlestTokyo.glb', function ( gltf ) {

	model = gltf.scene;
	model.scale.set( 0.01, 0.01, 0.01 );
	scene.add( model );

	mixer = new THREE.AnimationMixer( model );
	mixer.clipAction( gltf.animations[ 0 ] ).play();

	renderer.setAnimationLoop( animate );

}, undefined, function ( e ) {

	console.error( e );

} );

window.onresize = function () {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

};

function animate( time ) {

	const delta = clock.getDelta();

	if ( isFree ) {
		if ( orbitControls ) orbitControls.update();
		if ( model ) {
			model.position.lerp( freeTarget.modelPos, 0.05 );
			model.rotation.x += ( freeTarget.modelRot.x - model.rotation.x ) * 0.05;
			model.rotation.y += ( freeTarget.modelRot.y - model.rotation.y ) * 0.05;
			model.rotation.z += ( freeTarget.modelRot.z - model.rotation.z ) * 0.05;
		}
		mixer.update( delta );
		stats.update();
		renderer.render( scene, camera );
		return;
	}

	mixer.update( delta );

	const rawT = getScrollProgress();
	const t = remapProgress( rawT );
	const segments = cameraPath.length - 1;
	const segment = Math.min( Math.floor( t * segments ), segments - 1 );
	const localT = ( t * segments ) - segment;
	const from = cameraPath[ segment ];
	const to = cameraPath[ segment + 1 ];

	const targetPos = lerpVector3( from.pos, to.pos, localT );
	const targetLook = lerpVector3( from.target, to.target, localT );

	lenis.raf( time );

	camera.position.copy( targetPos );
	camera.lookAt( targetLook );

	if ( model ) {
		model.position.copy( lerpVector3( from.modelPos, to.modelPos, localT ) );
		model.rotation.copy( lerpEuler( from.modelRot, to.modelRot, localT ) );
	}

	updateOverlay();
	stats.update();
	renderer.render( scene, camera );

}
