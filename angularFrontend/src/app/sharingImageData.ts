export class SharingImageData {
    username: string;
    imagename: string;
    action: string;
    userToAddOrDeletePermission: string;
    constructor(username: string, imagename: string, action: string, userToAddOrDeletePermission: string) {
        this.username = username;
        this.imagename = imagename;
        this.action = action;
        this.userToAddOrDeletePermission = userToAddOrDeletePermission;
    }
}