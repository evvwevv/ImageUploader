import sys
import logging
import rds_mysql_config #name of config file you created to store db instance info
import pymysql
import json
#rds settings
rds_host  = "rds-mysql-imageuploader.cw1ohpfyqn5w.us-east-1.rds.amazonaws.com"
name = rds_mysql_config.db_username
password = rds_mysql_config.db_password
db_name = rds_mysql_config.db_name

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def addImageAssociatedData(event, context):
    """
    This function fetches content from mysql RDS instance
    Beginning of lambda function
    """
    
    status_code = 200
    body = None
    resultArr = None
    allUserImagesLocation = "https://s3.amazonaws.com/imageuploader-main-bucket/All_User_Images/"
    
    try:
        conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5) # db connection is not autocommitted by default. So commit to save your changes.
    except:
        logger.error("ERROR: Unexpected error: Could not connect to MySql instance.")
        sys.exit()

    logger.info("SUCCESS: Connection to RDS mysql instance succeeded")
    
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cur:
            
            #passedInUserName = event["username"]
            #passedInTags = event["tags"]
            passedInUserName = event["body"]["username"]
            passedInTags = event["body"]["tags"]
            passedInImageName = event["body"]["imagename"]
            imageLoc = allUserImagesLocation + passedInImageName
            
            #curTempUserRow = None #store row as a dict with '!' as username (primary key)
            
            getAllRowsQuery = "select * from User_Account"
            cur.execute(getAllRowsQuery)
            
            resultArr = cur.fetchall() # returns a list of dict
        
            for i in range(len(resultArr)):
               
                if resultArr[i]['userName'] == passedInUserName:
                    #username already present in table
                    
                    # only run this query after categories list is updated
                    updateUserRow_Query = ("INSERT INTO User_Account "
                        "(userName, categories, imageName, refToImage, imgDictByTag, canView, imgDictByImage) "
                        "VALUES (%s, JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), %s, %s, %s) "
                        "on duplicate key "
                        "update categories = values(categories), imageName = values(imageName), refToImage = values(refToImage), imgDictByTag = values(imgDictByTag), canView = values(canView), imgDictByImage = values(imgDictByImage)")
                    
                    #json.dumps converts python data to JSON formatted data
                    #json.loads converts json formatted data to python data
                    #json merge preserve takes 2 or more json documents
                    curUserName = passedInUserName
                    
                    oldTags = json.loads(resultArr[i]['categories'])
                    newTags = passedInTags
                    #combinedTags = list(set(oldTags + newTags))
                    tagsArg = json.dumps(oldTags)
                    
                    oldImages = json.loads(resultArr[i]['imageName'])
                    newImages = passedInImageName
                    newImageL = []
                    newImageL.append(newImages)
                    imagesArg = json.dumps(list(set(oldImages + newImageL)))
                    
                    oldRefs = json.loads(resultArr[i]['refToImage'])
                    newRefs = imageLoc
                    newRefL = []
                    newRefL.append(newRefs)
                    refsArg = json.dumps(list(set(oldRefs + newRefL)))
                    
                    curImgDict = json.loads(resultArr[i]['imgDictByTag'])
                    
                    #note: only want to associate passed in tags with uploaded image
                    for n in newTags:
                        if n not in curImgDict:
                            curImgDict[n] = newImageL
                            logger.info("SUCCESS: added new key-value pair to imgDictByTag")
                        else:
                            
                            if curImgDict[n] == None:
                                curImgDict[n] = newImageL
                                logger.info("SUCCESS: added new key-value pair to imgDictByTag; tag is in dictionary, but empty list")
                            else:
                                
                                if passedInImageName not in curImgDict[n]:
                                    curImgDict[n].append(passedInImageName)
                                    logger.info("SUCCESS: already exists in both new tags and dict, ensured image in list for that tag")
                           
                    # delete tags present in dict, but not new tags.
                    
                    curKeys = curImgDict.keys() 
                    copyOfKeys = []
                    
                    for keyss in curKeys:
                        copyOfKeys.append(keyss)
                    
                    for k in copyOfKeys:
                
                        #do not use combinedTags as after adding tag to it, this condition never triggers.
                        if k not in newTags: 
                            
                            if curImgDict[k] != None and len(curImgDict[k]) > 0:
                                
                                if passedInImageName in curImgDict[k]:
                                    curImgDict[k].remove(passedInImageName)
                                    logger.info("Removing image %s from key[tag] not found in new tags %s...", passedInImageName, k)
                                
                                    if len(curImgDict[k]) == 0:
                                        del curImgDict[k]
                                        logger.info("Empty image list...Removing key[tag] not found in new tags %s from dict...", k)
                               
                    imageDictArg = json.dumps(curImgDict)   
                    
                    # iamge dict indexed by image name, with value the list of tags
                    curImgDictByImage = json.loads(resultArr[i]['imgDictByImage'])
                 
                    
                    #newImages is just one image and not a list
                    if newImages not in curImgDictByImage:
                        newTagsList = list(passedInTags)
                        curImgDictByImage[newImages] = newTagsList
                        logger.info("SUCCESS: added new key-value pair to imgDictByImage and user already exists.")
                    else:
                        
                        if curImgDictByImage[newImages] == None:
                            newTagsList = list(passedInTags)
                            curImgDictByImage[newImages] = newTagsList
                            logger.info("SUCCESS: added new key-value pair to imgDictByImage; image key exists, but no tags list ; user already exists.")
                        else:
                            
                            for t in newTags:
                                if t not in curImgDictByImage[newImages]:
                                    curImgDictByImage[newImages].append(t)
                                    logger.info("SUCCESS: already exists in both new tags and list of tags in dicts at key, ensured tag in list for that image")
                                
                            #delete tags present in list of tags, but not in newTags
                           
                            curTagsListCopy = curImgDictByImage[newImages].copy()
                                
                            for t in curTagsListCopy:
                                if t not in newTags:
                                    curImgDictByImage[newImages].remove(t)
                                    logger.info("Removing tag %s from key (imagename) %s...", t, newImages)
                                    
                        
                    
                    
                        
                    imageDictByImageArg = json.dumps(curImgDictByImage)
                    
                    # who has permission to view
                    canViewDict = json.loads(resultArr[i]['canView'])
                    
                    #ensure username is in there
                    if curUserName not in canViewDict:
                        canViewDict[curUserName] = True
                    
                    canViewArg = json.dumps(canViewDict)
                    
                    updateUserRow_Query_Data = (curUserName, 
                        tagsArg, 
                        imagesArg, 
                        refsArg,
                        imageDictArg,
                        canViewArg,
                        imageDictByImageArg)
                    
                    cur.execute(updateUserRow_Query, updateUserRow_Query_Data)
                    
                    conn.commit()
                    
                    #update resultArr with a new select statement...
                    cur.execute(getAllRowsQuery)
                    resultArr = cur.fetchall() # returns a list of dict
                    body = make_new_get_user_response(resultArr[i])
                    break
                
            #-----------------------------------------    
            #if body is still None, that means
            # passed in username is not currently in database
            if body == None:
                logger.info("Passed in username not found in database. Adding it to database...")
                
                addNewUser_Query = ("INSERT INTO User_Account "
                    "(userName, categories, imageName, refToImage, imgDictByTag, canView, imgDictByImage) "
                    "VALUES (%s, JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), %s, %s, %s) "
                    "on duplicate key "
                    "update imageName = values(imageName), refToImage = values(refToImage), imgDictByTag = values(imgDictByTag), canView = values(canView), imgDictByImage = values(imgDictByImage)")
                    
                curUserName = passedInUserName
                
                #must turn to py list before calling dumps on it
                #tagsL = list(passedInTags)
                dummyTagsList = [] #don't bother updating this field
                tagsL = list(passedInTags)
                tagsArg = json.dumps(dummyTagsList)
                
                newImage = passedInImageName
                newImageL = []
                newImageL.append(newImage)
                imagesArg = json.dumps(newImageL)
                
                newRef = imageLoc
                newRefL = []
                newRefL.append(newRef)
                refsArg = json.dumps(newRefL)
                
                imagesIndexedByTag = {}
                
                for t in passedInTags:
                    imagesIndexedByTag[t] = newImageL
                
                imageDict = json.dumps(imagesIndexedByTag)
                
                canViewDict = {}
                    
                #add username so it can view
                if curUserName not in canViewDict:
                    canViewDict[curUserName] = True
                
                canViewArg = json.dumps(canViewDict)
                
                imagesIndexedByImage = {}
                imagesIndexedByImage[newImage] = tagsL
                
                imageDictByImage = json.dumps(imagesIndexedByImage)
                
                addNewUser_Data = (curUserName, 
                    tagsArg, 
                    imagesArg, 
                    refsArg,
                    imageDict,
                    canViewArg,
                    imageDictByImage)
                        
                cur.execute(addNewUser_Query, addNewUser_Data)
                    
                conn.commit()
                
                cur.execute(getAllRowsQuery)
                resultArr = cur.fetchall() # returns a list of dict
                
                for j in range(len(resultArr)):
                    if resultArr[j]['userName'] == passedInUserName:
                        body = make_new_get_user_response(resultArr[j])
                        break
                
            cur.close()
        
    finally:
        conn.close()
    
    response = {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(body)
    }
    
    return response
    
    
def make_new_get_user_response(row):
    """ Returns an object containing only what needs to be sent back to the user. """
    return {
            'userName': row['userName'],
            'categories': row['categories'],
            'imageName': row['imageName'],
            'refToImage': row['refToImage'],
            'imgDictByTag': row['imgDictByTag'],
            'canView': row['canView'],
            'imgDictByImage': row['imgDictByImage']
           }
