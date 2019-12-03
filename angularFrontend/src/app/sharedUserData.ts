export class SharedUserData {
    imageName: string;
    users: string[];
    constructor(imageName: string, users: string[]) {
        this.imageName = imageName;
        this.users = users;
    }
}