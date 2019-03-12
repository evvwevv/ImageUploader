export class GalleryImage {
    imageUrl: string;
    tags: string[];
    constructor(imageUrl: string, tags: string[]) {
        this.imageUrl = imageUrl;
        this.tags = tags;
    }
}