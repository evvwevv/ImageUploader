export class ImageData {
    username: string;
    imagename: string;
    tags: string[];
    constructor(username: string, imagename: string, tags: string[]) {
        this.username = username;
        this.imagename = imagename;
        this.tags = tags;
    }
}