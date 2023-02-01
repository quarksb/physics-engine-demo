import './style.css'
import RAPIER from '@dimforge/rapier2d-compat'
import { getCar } from './data';

let w = 1400;
let h = 700;
let ctx: CanvasRenderingContext2D;

initCanvas();
RAPIER.init().then(()=>{
  const gravity = {x:0, y: -100};
  const world = new RAPIER.World(gravity);

  setBorder(world);
  const objectArray = [
    initRigid(world, {type:'ball', translation:[320, 500], size: [50], friction:1., restitution:0.2}),
    initRigid(world, {type:'ball', translation:[680, 500], size: [50], friction:1., restitution:0.2}),
    // initRigid(world, {type:'cuboid', translation:[500, 200], size: [80, 10] }),
    
    // initRigid(world, {type:'cuboid', translation:[200, 400], size: [100, 50], }),
    // initRigid(world, {type:'ball', translation:[w-200, h-200], size: [100], linvel: [-100, -100], angvel:100, friction: 1}),
    // initStar(world, {type:'trimesh', translation:[w-200, 200], size: [100], num: 10}),
    // initStar(world, {type:'trimesh', translation:[w/2, 200], size: [100], angvel:10, num: 8})
    initCar(world, {type: 'trimesh', translation:[500, 450], size:[100,20], density:1, friction:1, restitution:0.2}),
    initCar(world, {type: 'trimesh', translation:[700, 0], size:[200,20],density:10, friction:1, restitution:0.2, })
  ];

  const body1 = objectArray[0].rigidBody;
  const body2 = objectArray[1].rigidBody;
  const body3 = objectArray[2].rigidBody;
  // let x = { x: 1.0, y: 0.0 };
  const params = RAPIER.JointParams.ball({ x: 130.0, y: 30.0 },{ x: 0.0, y: 0.0 });
  let joint1 = world.createJoint(params, body3, body1);
  const  params1 = RAPIER.JointParams.ball({ x: -120.0, y: 30.0 },{ x: 0.0, y: 0.0 });
  let joint2 = world.createJoint(params1, body3, body2);
  
  let vec = 40
  joint2.configureMotorVelocity(-vec, 0.01);
  joint1.configureMotorVelocity(-vec, 0.01);

  function keyboard(event) {
    let keyCode = event.keyCode;
    console.log(keyCode);
    
    if(keyCode == 37){
      vec-=5;
    }
    if(keyCode == 39){
      vec+=5;
    }
    joint2.configureMotorVelocity(-vec, 0.01);
      joint1.configureMotorVelocity(-vec, 0.01);
  }
  document.addEventListener("keydown", keyboard);

  const vecArray = []
  const posArray = []
  
  let animation;
  const gameLoop = ()=>{
    world.step();

    clear();
    
    for(let i=0; i<objectArray.length; i++){
      const { rigidBody, path } = objectArray[i];
      const position = rigidBody.translation();
      const rotation = rigidBody.rotation();
      const linvel = rigidBody.linvel();

      
      // vecArray.push(linvel.y);
      // posArray.push(position.y);
      // if(position.y<200){
      //   debugger
      // }
      
      
      // oldVal = linvel.y;
      drawPath(position.x, position.y, rotation, path);
    }
    animation = requestAnimationFrame(gameLoop)
    // 
  }
  // setInterval(gameLoop, 30)

  gameLoop();
})

function initRigid(world:RAPIER.World, {type='cuboid',size = [100, 100],translation=[0,0],linvel=[0,0],angvel=0,density=1,friction = 0, restitution = 1}) {
  const rigidBodyDesc = RAPIER.RigidBodyDesc.newDynamic()
  .setTranslation(translation[0],translation[1])
  .setLinvel(linvel[0], linvel[1])
  .setAngvel(angvel)
  // .setAngularDamping(.2)
  .setCcdEnabled(true);
  const rigidBody = world.createRigidBody(rigidBodyDesc);

  const colliderDesc = RAPIER.ColliderDesc[type](...size).setDensity(density).setRestitution(restitution).setFriction(friction);
  const collider = world.createCollider(colliderDesc, rigidBody.handle);
  collider.setCollisionGroups(0x00010003);
  collider.setActiveEvents(RAPIER.ActiveEvents.CONTACT_EVENTS);
  let path: Path2D;
  if(type === 'cuboid'){
    path =  new Path2D(`M ${-size[0]} ${-size[1]}L ${size[0]}, ${-size[1]} L ${size[0]}, ${size[1]} L${-size[0]}, ${size[1]}Z`);
  }else{
    path = new Path2D(`M ${-size[0]} 0 A ${size[0]} ${size[0]}, 0, 1, 1, ${size[0]}, 0 A ${size[0]} ${size[0]}, 0, 1, 1, ${-size[0]}, 0`);
  }
   
  return { rigidBody, path };
}

function initStar(world:RAPIER.World, { translation=[0,0],linvel=[0,0],angvel=0, density=1,friction = 0, num = 10,}) {
  const rigidBodyDesc = RAPIER.RigidBodyDesc.newDynamic()
  .setTranslation(translation[0],translation[1])
  .setLinvel(linvel[0], linvel[1])
  .setAngvel(angvel)
  const rigidBody = world.createRigidBody(rigidBodyDesc);
  
  // const indices = new Uint32Array(10);
  const n = num;
  const k = 2*Math.PI/n;
  const vertices = new Float32Array(2*n + 2);
  const indices = new Uint32Array(3*n);
  for(let i=1; i<=n; i++){
    const r = i%2?100:50;
    const angle = i*k;
    vertices[2*i]=r*Math.cos(angle);
    vertices[2*i+1]=r*Math.sin(angle);
    indices[i*3] = 0;
    indices[i*3+1] = i;
    indices[i*3+2] = i+1;
  }

  let path = `M ${vertices[2]} ${vertices[3]}`;
  for(let i = 2; i<=n; i++){
    path += `L ${vertices[2*i]} ${vertices[2*i+1]}`
  }
  path += 'Z';
  
  const colliderDesc = RAPIER.ColliderDesc.trimesh(vertices, indices).setDensity(5).setRestitution(1).setFriction(0);
  const collider = world.createCollider(colliderDesc, rigidBody.handle);
  // collider.setCollisionGroups(0x00010003);
  return {rigidBody, path: new Path2D(path)};
}

function initCar(world:RAPIER.World, { translation=[0,0],size= [100, 30], linvel=[0,0],angvel=0, density=1,friction = 0, num = 10,}) {
  const rigidBodyDesc = RAPIER.RigidBodyDesc.newDynamic()
  .setTranslation(translation[0],translation[1])
  .setLinvel(linvel[0], linvel[1])
  .setAngvel(angvel)
  const rigidBody = world.createRigidBody(rigidBodyDesc);
  
  // const indices = new Uint32Array(10);
  const { vertices, indices, path2d } = getCar(size);
  
  const colliderDesc = RAPIER.ColliderDesc.trimesh(vertices, indices).setDensity(density).setRestitution(1).setFriction(0);
  const collider = world.createCollider(colliderDesc, rigidBody.handle);
  // collider.setCollisionGroups(0x00010003);
  return {rigidBody, path:path2d};
}

function initCanvas(){
  const app = document.querySelector<HTMLDivElement>('#app')!
  const canvas = <HTMLCanvasElement>document.createElement('canvas');
  app.appendChild(canvas);
  canvas.width = w;
  canvas.height = h;
  ctx = canvas.getContext('2d')!;
  const r = 100;
  // loadImage('')
  const gradient = ctx.createLinearGradient(-100,-100,100,100);
  gradient.addColorStop(0, '#C6FFDD');
  gradient.addColorStop(0.5, '#FBD786');
  gradient.addColorStop(1, '#f7797d');
  ctx.setTransform(1,0,0,-1,0,h);
  ctx.fillStyle = gradient;
  // ctx.fillStyle='pink';
  // ctx?.fillRect(0, 0, w, h);
}

function clear(){
  // ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  // ctx.fillRect(0, 0, w, h);
  ctx.clearRect(0,0,w,h);
}

// drawPath(100, 100);
function drawPath(x:number = 0, y:number = 0, rotation = 0, path){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(rotation);
  ctx.fill(path);
  ctx.restore();
}

function setBorder(world){
  
  for(let i=0; i<4; i++){
    const angle = i*Math.PI/2;
    const x = (0.5+Math.cos(angle))*w;
    const y = (0.5+Math.sin(angle))*h;

    const rigidBodyDesc = RAPIER.RigidBodyDesc.newKinematicPositionBased().setTranslation(x, y);
    const rigidBody = world.createRigidBody(rigidBodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.cuboid(w/2, h/2).setDensity(0).setRestitution(1).setFriction(1);
    const collider = world.createCollider(colliderDesc, rigidBody.handle);
    // collider.setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.DEFAULT|RAPIER.ActiveCollisionTypes.KINEMATIC_STATIC);
    // collider.setCollisionGroups(0x00020001);
  }
  
}







