export class SharedImage {
    imageUrl: string;
    imageName: string;
    originalOwner: string
    constructor(imageUrl: string, imageName: string, originalOwner: string) {
        this.imageUrl = imageUrl;
        this.imageName = imageName
        this.originalOwner = originalOwner;
    }
}