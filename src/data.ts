

const pointsArray = [
    [-1.4,7],
    [1, 7],
    [4, 10],
    [12.7, 10],
    [17.1, 6.3],
    [20, 6.3],
    [20, 2.5],
    [-1.4, 2.5]
]

const n = pointsArray.length;
const baseVertices = new Float32Array(2*n + 2);
const indices = new Uint32Array(3*n);
const center = [9, 5];


for(let i = 1; i<=n; i++){
    const point = pointsArray[i-1];
    baseVertices[2*i] = (point[0] - center[0])/10.7;
    baseVertices[2*i+1] = (point[1] - center[1]/3.75);
    indices[i*3] = 0;
    indices[i*3+1] = i;
    indices[i*3+2] = i+1;
}

// console.log(baseVertices);




export function getCar(size:number[] = [1, 1]) {
    const vertices = new Float32Array(2*n+2);
    for(let i = 1; i<=n; i++){
        const point = pointsArray[i];
        vertices[2*i] = baseVertices[2*i] * 2*size[0];
        vertices[2*i+1] = baseVertices[2*i+1] * size[1];
    }

    let path = `M ${vertices[2]} ${vertices[3]}`;
    for(let i = 2; i<=n; i++){
        path += `L ${vertices[2*i]} ${vertices[2*i+1]}`
    }
    path += 'Z';
    // console.log(vertices, path);
    
    return {
        vertices,
        indices,
        path2d: new Path2D(path)
    }
}
export const car = {
    
};