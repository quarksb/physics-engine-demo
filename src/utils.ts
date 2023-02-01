export function loadImage(url:string){
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.src = url;
    })
}