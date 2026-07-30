import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { Sky } from 'three/addons/objects/Sky.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

import Lenis from 'lenis';

let mixer;
let model;

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
	{ pos: new THREE.Vector3( 5, 2, 8 ), target: new THREE.Vector3( 0, 0.7, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 0, 0 ) },
	{ pos: new THREE.Vector3( 2, 0, 4 ), target: new THREE.Vector3( 2, -1, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 0, 0 ) },
	{ pos: new THREE.Vector3( -2, 4.5, 2 ), target: new THREE.Vector3( 0.5, 0.8, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 0, 0 ) },
	{ pos: new THREE.Vector3( -2, 1, 4), target: new THREE.Vector3(2, -2, 0  ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 1, 0 ) },
	{ pos: new THREE.Vector3( 0, 4.5, 2 ), target: new THREE.Vector3( 1, 0.3, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 2, 0 ) },
	{ pos: new THREE.Vector3( 2, 1, 5 ), target: new THREE.Vector3( 0, -1, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 3, 0 ) },
	{ pos: new THREE.Vector3( 3, 3, 3 ), target: new THREE.Vector3( 0.5, 0.7, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 0, 0 ) },
	{ pos: new THREE.Vector3( 4, 1.5, 5 ), target: new THREE.Vector3( 0, 0.6, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 0, 0 ) },
	{ pos: new THREE.Vector3( 5, 2, 8 ), target: new THREE.Vector3( 0, 0.7, 0 ), modelPos: new THREE.Vector3( 1, 1, 0 ), modelRot: new THREE.Euler( 0, 0, 0 ) },
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

	lenis.raf( time );

	const delta = clock.getDelta();

	mixer.update( delta );

	updateCameraFromScroll();

	stats.update();

	renderer.render( scene, camera );

}
