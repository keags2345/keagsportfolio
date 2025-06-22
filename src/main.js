import * as THREE from 'three';
import './style.scss'
import smokeVertexShader from "./shaders/smoke/vertex.glsl";
import smokeFragmentShader from "./shaders/smoke/fragment.glsl";
import themeVertexShader from "./shaders/theme/vertex.glsl";
import themeFragmentShader from "./shaders/theme/fragment.glsl";
import { OrbitControls } from './utils/orbitControls.js';
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import gsap from "gsap"

const canvas = document.querySelector("#experience-canvas");
const sizes ={
  width: window.innerWidth,
  height: window.innerHeight
};

const modals = {
  Name:document.querySelector(".modal.Name"),
};

// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 
  45, 
  sizes.width / sizes.height, 
  0.1, 
  1000 
);
camera.position.set( -5.116486390563189, 
2.3337333591461946, 4.899790787134163);

const renderer = new THREE.WebGLRenderer({canvas:canvas, antialias: true});
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


// Scrolling and angle restrictions
const controls = new OrbitControls( camera, renderer.domElement );
controls.minDistance = 2;
controls.maxDistance = 10;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI/2;
controls.minAzimuthAngle = -Math.PI/2.5;
controls.maxAzimuthAngle = 0;




controls.enableDamping = true;
controls.dampingFactor = 0.08;


controls.update();
controls.target.set(0.5393740914563012, 1.0057838936593084, 
0.09878860580496839)



// const canvas = document.querySelector("#experience-canvas");
// const sizes ={
//   width: window.innerWidth,
//   height: window.innerHeight
// };

// const modals = {
//   Name:document.querySelector(".modal.Name"),
// };


let touchHappened = false;
document.querySelectorAll(".modal-exit-button").forEach(button=>{
  button.addEventListener("touchend", 
    (e)=>{
    touchHappened = true;
    e.preventDefault();
    const modal = e.target.closest(".modal");
    hideModal(modal);
  },{ passive: false }
);

  button.addEventListener("click", 
    (e)=>{
     if (touchHappened) return;  
    e.preventDefault();
    const modal = e.target.closest(".modal");
    hideModal(modal);
  },{passive: false});
});

const showModal = (modal) =>{
  modal.style.display = "block";
  isModalOpen = true;
  controls.enabled = false;

  if(currentHoveredObject){
    playHoverAnimation(currentHoveredObject, false);
    currentHoveredObject = null;
  }
  document.body.style.cursor = "default";
  currentIntersects = [];

  gsap.set(modal, {opacity: 0});

  gsap.to(modal, {
    opacity: 1,
    duration: 0.5,
  });

};

const hideModal = (modal) =>{
  isModalOpen = false;
  controls.enabled = true;

  gsap.to(modal, {
    opacity: 0,
    duration: 0.5,
    onComplete: ()=>{
      modal.style.display = "none";

    },
  });
};

let isModalOpen = false;

const manager = new THREE.LoadingManager();
const overlay = document.querySelector(".overlay");

const loadingScreen = document.querySelector(".loading-screen");
const loadingScreenButton = document.querySelector(".loading-screen-button");

 manager.onLoad = function () {
  loadingScreenButton.style.border = "8px solid vars.$base-black";
  loadingScreenButton.style.background = "vars.base-white";
  loadingScreenButton.style.color = "vars.$base-white";
  loadingScreenButton.style.boxShadow = "rgba(0, 0, 0, 0.24) 0px 3px 8px";
  loadingScreenButton.textContent = "welcome";
  loadingScreenButton.style.cursor = "pointer";
  loadingScreenButton.style.transition =
    "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
  let isDisabled = false;

  function handleEnter() {
    if (isDisabled) return;

    loadingScreenButton.style.cursor = "default";
    loadingScreenButton.style.border = "6px solid vars.$base-black";
    loadingScreenButton.style.background = "vars.$base-black";
    loadingScreenButton.style.color = "vars.$base-white";
    loadingScreenButton.style.boxShadow = "none";
    //loadingScreenButton.textContent = "Welcome";
    loadingScreen.style.background = "vars.$base-black";
    isDisabled = true;
    playReveal();
  }
  
  loadingScreenButton.addEventListener("mouseenter", () => {
    loadingScreenButton.style.transform = "scale(1.3)";
  });

  loadingScreenButton.addEventListener("touchend", (e) => {
    touchHappened = true;
    e.preventDefault();
    handleEnter();
  });

  loadingScreenButton.addEventListener("click", (e) => {
    if (touchHappened) return;
    handleEnter();
  });

  loadingScreenButton.addEventListener("mouseleave", () => {
    loadingScreenButton.style.transform = "none";
  });
};

function playReveal() {
  const tl = gsap.timeline();

  tl.to(loadingScreen, {
    scale: 0.5,
    duration: 1.2,
    delay: 0.25,
    ease: "back.in(1.8)",
  }).to(
    loadingScreen,
    {
      y: "200vh",
      transform: "perspective(1000px) rotateX(45deg) rotateY(-35deg)",
      duration: 1.2,
      ease: "back.in(1.8)",
      onComplete: () => {
        isModalOpen = false;
        playIntroAnimation();
        loadingScreen.remove();
      },
    },
    "-=0.1"
  );
}



const raycasterObjects = [];
let currentIntersects = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let currentHoveredObject = null;


// Setting up links
const socialLinks = {
  "Github": "https://github.com/keags2345/keagsportfolio",
  "Linkedin": "https://linkedin.com/in/keagansih",
};

// Loaders
const textureLoader = new THREE.TextureLoader();

// Model Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader(manager);
loader.setDRACOLoader(dracoLoader);

// Glass reflections lol
const environmentMap = new THREE.CubeTextureLoader()
	.setPath( 'textures/skybox/' )
	.load( [
				'px.webp',
				'nx.webp',
				'py.webp',
				'ny.webp',
				'pz.webp',
				'nz.webp'
			] );

// Setting up textures      
const textureMap = {
  BackgroundWindows: {
    day:"/textures/room/day/Backgroundwindow(FINAL).webp",
    night:"/textures/room/night/BackgroundWindow(NIGHTFINAL).webp"
  },
  Blindsbedaircon: {
    day:"/textures/room/day/Blinds+bed+aircon(FINAL).webp",
    night:"/textures/room/night/Blinds+bed+aircon(NIGHTFALL).webp"
  },
  Everythingelse: {
    day:"/textures/room/day/Everythingelse(FINAL).webp",
    night:"/textures/room/night/Everythingelse(NIGHTFALL).webp",
  },
  Pegboard: {
    day:"/textures/room/day/Pegboard+name+logo(FINAL).webp",
    night:"/textures/room/night/Pegboard+name+logo(NIGHTFALL).webp",
  },
  Tablethings: {
    day:"/textures/room/day/Tablethings+switch(FINAL).webp",
    night:"/textures/room/night/Tablethings+switch(NIGHTFALL).webp",
  },
  FLOORWALLROOF: {
    day:"/textures/room/day/WALL+FLOOR+ROOF(FINAL).webp",
    night:"/textures/room/night/WALL+FLOOR+ROOF(NIGHTFALL).webp",
  },
};

const loadedTextures = {
  day: {},
  night: {},
};


Object.entries(textureMap).forEach(([key, paths]) => {
  // Load and config day textures
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace

  loadedTextures.day[key] = dayTexture;

  // Load and configure night texture
  const nightTexture = textureLoader.load(paths.night);
  nightTexture.flipY = false;
  nightTexture.colorSpace = THREE.SRGBColorSpace

  loadedTextures.night[key] = nightTexture;
});

// Smoke Shader setup
const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64);
smokeGeometry.translate(0, 0.3, 0);
smokeGeometry.scale(0.08, 0.15, 3);

const perlinTexture = textureLoader.load("/Shaders/perlin.png");
perlinTexture.wrapS = THREE.RepeatWrapping;
perlinTexture.wrapT = THREE.RepeatWrapping;

//Later add other perlin stuff

const smokeMaterial = new THREE.ShaderMaterial({
  vertexShader: smokeVertexShader,
  fragmentShader: smokeFragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uPerlinTexture: new THREE.Uniform(perlinTexture),
  },
  side: THREE.DoubleSide,
  transparent: true,
  depthWrite: false,
});

const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
smoke.position.y = 1.83;
scene.add(smoke);


// Computer Vid
const videoElement = document.createElement("video");
videoElement.src = "/textures/video/screenvideo_.mp4";
videoElement.loop = true;
videoElement.muted = true;
videoElement.playsInline = true;
videoElement.autoplay = true;
videoElement.play()

const videoTexture = new THREE.VideoTexture(videoElement)
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;


//Adding photo
const photoTexture =new THREE.TextureLoader().load("/textures/photos/myphoto.jpg");
photoTexture.colorSpace = THREE.SRGBColorSpace;
photoTexture.flipY = false;


//
window.addEventListener("mousemove", (e)=>{
  touchHappened = false;
  pointer.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
});

window.addEventListener("touchstart", (e)=>{
  if (isModalOpen) return;
  e.preventDefault();
  pointer.x = ( e.touches[0].clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( e.touches[0].clientY / window.innerHeight ) * 2 + 1;
}, 
{passive: false}

);

window.addEventListener(
  "touchend", 
  (e)=>{
  if (isModalOpen) return;
  e.preventDefault();
  handleRaycasterInteraction();
}, 
{passive: false}
);

function handleRaycasterInteraction(){
  if(currentIntersects.length> 0){
    const object = currentIntersects[0].object;

    Object.entries(socialLinks).forEach(([key,url]) =>{
      if(object.name.includes(key)){
        const newWindow = window.open();
        newWindow.opener = null;
        newWindow.location = url;
        newWindow.target = "blank";
        newWindow.rel = "nooopener noreferrer";

      }

    });

    if (object.name.includes("Name")) {
      showModal(modals.Name);
    }

    
    
  }
}

window.addEventListener("click", handleRaycasterInteraction);

function playIntroAnimation() {
  const t1 = gsap.timeline({
    defaults:{
    duration: 0.8,
    ease: "back.out(1.8)",
    }

  });

t1.to(keagan.scale, {
  z: 1,
  x: 1,
  y: 1,
}).to(toy.scale, {
  z: 1,
  x: 1,
  y: 1,
}, "-=0.7"
).to(linkedin.scale, {
  z: 1,
  x: 1,
  y: 1,
},"-=0.7"
).to(github.scale, {
  z: 1,
  x: 1,
  y: 1,
},"-=0.7"
).to(photo.scale, {
  z: 1,
  x: 1,
  y: 1,
}, "-=0.7"
);
}

//Declare stuff
let github, linkedin, toy, photo, keagan, chairtop, mugPosition;

//LOADING MODEL
loader.load("/models/Hopefullyfinalv15-v1.glb", (glb)=> {

  glb.scene.traverse(child => {
    if(child.isMesh) {
      if (child.name.includes("Raycaster")) {
        raycasterObjects.push(child);
      }
      
      if (child.name.includes("Hover")){
        child.userData.initialScale = new THREE.Vector3().copy(child.scale);
        child.userData.initialPosition = new THREE.Vector3().copy(
          child.position
        );
        child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
        
      }
      
      if (child.name.includes("Github")) {
        github = child;
        child.scale.set(0,0,0);
      } else if (child.name.includes("Linkedin")) {
        linkedin = child;
        child.scale.set(0,0,0);
      } else if (child.name.includes("Toy")) {
        toy = child;
        child.scale.set(0,0,0);
      } else if (child.name.includes("Photo")) {
        photo = child;
        child.scale.set(0,0,0);
      } else if (child.name.includes("Name")) {
        keagan = child;
        child.scale.set(0,0,0);
      }
      if (child.name.includes("Chairtop")) {
        chairtop = child;
        child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
      }

      if (child.name.includes("Mug")) {
        mugPosition = child.position.clone();
      }

      

      if(child.name.includes("glass") || child.name.includes("Lamp")){
        child.material = new THREE.MeshPhysicalMaterial({
				  transmission: 1,
				  opacity: 1,
				  metalness: 0,
				  roughness: 0.05,
				  ior: 2,
				  thickness: 0.01,
				  specularIntensity: 1,
          envMap: environmentMap,
				  envMapIntensity: 1,
				  lightIntensity: 1,
				  exposure: 1,
				  
          });
        }
      if (child.name.includes("Monitorscreen")) {
           child.material = new THREE.MeshBasicMaterial({
            map: videoTexture
           });
        }

      else if (child.name.includes("Photo")){
        child.material = new THREE.MeshBasicMaterial({
          map: photoTexture
        });
       }
      
        else {

          Object.keys(textureMap).forEach((key) => {
            if(child.name.includes(key)) {
             const material = new THREE.MeshBasicMaterial({
              map:loadedTextures.night[key],
          });

          child.material = material;

          if(child.material.map){
            child.material.map.minFilter = THREE.LinearFilter;
          }
        }
      }); 
        }
    }

  
  });

    if (mugPosition) {
    smoke.position.set(
      mugPosition.x,
      mugPosition.y +0.1,
      mugPosition.z
    );
  }

  scene.add(glb.scene);
  playIntroAnimation();
});


// Event Listeners
window.addEventListener("resize", ()=>{
  sizes.width = window.innerWidth;
  
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

});

function animate() {}

function playHoverAnimation (object, isHovering){
  gsap.killTweensOf(object.scale);
  gsap.killTweensOf(object.rotation);
  gsap.killTweensOf(object.position);

  if (object.name.includes("Mug")) {
    gsap.killTweensOf(smoke.scale);
    if (isHovering) {
      gsap.to(smoke.scale, {
        x: 1.4,
        y: 1.4,
        z: 1.4,
        duration: 0.5,
        ease: "back.out(2)",
      });
    } else {
      gsap.to(smoke.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        ease: "back.out(2)",
      });
    }
  }



  if (isHovering) {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x * 1.2,
      y: object.userData.initialScale.y * 1.2,
      z: object.userData.initialScale.z * 1.2,
      duration: 0.3,
      ease: "bounce.out(1.3)",
    });
    // gsap.to(object.rotation, {
    // z: object.userData.initialRotation.z + Math.PI / 8,
    // duration: 0.5,
    // ease: "bounce.out(1.9)",
  
    // });
  } else {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x,
      y: object.userData.initialScale.y,
      z: object.userData.initialScale.z,
      duration: 0.3,
      ease: "bounce.out(1.3)",
    });
    gsap.to(object.rotation, {
    z: object.userData.initialRotation.z,
    duration: 0.3,
    ease: "bounce.out(1.8)",

    });
  }
}

const clock = new THREE.Clock();

// Render Function
const render = (timestamp) =>{
  controls.update();

  const elapsedTime = clock.getElapsedTime();

  // Update Shader Univform
  smokeMaterial.uniforms.uTime.value = elapsedTime;

  //Chair rotation
  if (chairtop) {

    const time = timestamp * 0.001;
    const baseAmplitude = -Math.PI / 6;

    const rotationOffset =
      baseAmplitude *
      Math.sin(time * 0.5) *
      (1 - Math.abs(Math.sin(time * 0.5)) * 0.3);

    chairtop.rotation.y = chairtop.userData.initialRotation.y + rotationOffset;
  }


  //Raycaster
  if(!isModalOpen){ 
  raycaster.setFromCamera(pointer, camera);

  //calculate objects intersecting the picking ray
  currentIntersects = raycaster.intersectObjects(raycasterObjects);

  for ( let i = 0; i < currentIntersects.length; i ++ ) {
    

	}

  if(currentIntersects.length>0){
    const currentIntersectObject = currentIntersects[0].object;

    if(currentIntersectObject.name.includes("Hover")){
      if(currentIntersectObject !== currentHoveredObject){

        if(currentHoveredObject){
          playHoverAnimation(currentHoveredObject, false);
        }


        playHoverAnimation(currentIntersectObject, true);
        currentHoveredObject = currentIntersectObject;
      }

    }
    
    if(currentIntersectObject.name.includes("Pointer")){
      document.body.style.cursor = "pointer";
    } else{
      document.body.style.cursor = "default";
  }
    } else {
      if(currentHoveredObject){
        playHoverAnimation(currentHoveredObject, false);
        currentHoveredObject = null;
      }
      document.body.style.cursor = "default";
    }
  }

  renderer.render( scene, camera );

  window.requestAnimationFrame(render);
};

render();