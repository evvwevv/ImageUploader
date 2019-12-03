export class GalleryImage {
    imageUrl: string;
    imageName: string;
    tags: string[];
    sharedUsers: string[];
    constructor(imageUrl: string, imageName: string, tags: string[], sharedUsers: string[]) {
        this.imageUrl = imageUrl;
        this.imageName = imageName
        this.tags = tags;
        this.sharedUsers = sharedUsers;
    }
}