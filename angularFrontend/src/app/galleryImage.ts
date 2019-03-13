export class GalleryImage {
    imageUrl: string;
    imageName: string;
    tags: string[];
    constructor(imageUrl: string, imageName: string, tags: string[]) {
        this.imageUrl = imageUrl;
        this.imageName = imageName
        this.tags = tags;
    }
}