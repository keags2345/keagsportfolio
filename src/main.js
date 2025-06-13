import * as THREE from 'three';
import './style.scss'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
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


document.querySelectorAll(".modal-exit-button").forEach(button=>{
  button.addEventListener("click", (e)=>{
    const modal = e.target.closest(".modal");
    hideModal(modal);
  });
});

const showModal = (modal) =>{
  modal.style.display = "block";

  gsap.set(modal, {opacity: 0});

  gsap.to(modal, {
    opacity: 1,
    duration: 0.5,
  });

};

const hideModal = (modal) =>{
  gsap.to(modal, {
    opacity: 0,
    duration: 0.5,
    onComplete: ()=>{
      modal.style.display = "none";

    },
  });
};

const raycasterObjects = [];
let currentIntersects = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const socialLinks = {
  "Github": "https://github.com/",
  "Linkedin": "https://linkedin.com/in/keagansih",
};

// Loaders
const textureLoader = new THREE.TextureLoader();

// Model Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

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

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 
  45, 
  sizes.width / sizes.height, 
  0.1, 
  1000 
);
camera.position.set( -5.116486390563189, 
2.3337333591461946, 4.899790787134163);

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

window.addEventListener("mousemove", (e)=>{
  pointer.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
});

window.addEventListener("click", (e)=>{
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
});

loader.load("/models/Hopefullyfinalv11-v1.glb", (glb)=> {

  glb.scene.traverse(child => {
    if(child.isMesh) {
      if (child.name.includes("Raycaster")) {
        raycasterObjects.push(child);
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
      } else if (child.name.includes("Monitorscreen")) {
           child.material = new THREE.MeshBasicMaterial({
            map: videoTexture
           });
        }
      
        else {

          Object.keys(textureMap).forEach((key) => {
            if(child.name.includes(key)) {
             const material = new THREE.MeshBasicMaterial({
              map:loadedTextures.day[key],
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
  scene.add(glb.scene);
});


const renderer = new THREE.WebGLRenderer({canvas:canvas, antialias: true});
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.update();
controls.target.set(0.5393740914563012, 1.0057838936593084, 
0.09878860580496839)

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

const render = () =>{
  controls.update();

  // console.log(camera.position);
  // console.log("0000000")
  // console.log(controls.target);

  //Raycaster
  raycaster.setFromCamera(pointer, camera);

  //calculate objects intersecting the picking ray
  currentIntersects = raycaster.intersectObjects(raycasterObjects);

  for ( let i = 0; i < currentIntersects.length; i ++ ) {
    

	}

  if(currentIntersects.length>0){
    const currentIntersectObject = currentIntersects[0].object;

    if(currentIntersectObject.name.includes("Pointer")){
      document.body.style.cursor = "pointer";
    } else{
      document.body.style.cursor = "default";
  }
    } else {
      document.body.style.cursor = "default";
    }


  renderer.render( scene, camera );

  window.requestAnimationFrame(render);
};

render();