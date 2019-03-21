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

def updateTagsGivenUserAndImage(event, context):
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
          
            passedInUserName = event["body"]["username"]
            passedInImage = event["body"]["image"]
            passedInTags = event["body"]["tags"]
            
            allUserImagesLocation = allUserImagesLocation + passedInImage
            
            getAllRowsQuery = "select * from User_Account"
            cur.execute(getAllRowsQuery)
            
            resultArr = cur.fetchall() # returns a list of dict
        
            #this function assumes no pre-uploaded data (! or !!) in db
            for i in range(len(resultArr)):
                if resultArr[i]['userName'] == passedInUserName:
        
                    # only run this query after updated info
                    updateUserRow_Query = ("INSERT INTO User_Account "
                        "(userName, categories, imageName, refToImage, imgDictByTag, canView) "
                        "VALUES (%s, JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), %s, %s) "
                        "on duplicate key "
                        "update imageName = values(imageName), categories = values(categories), refToImage = values(refToImage), imgDictByTag = values(imgDictByTag), canView = values(canView)")
                    
                    #json.dumps converts python data to JSON formatted data
                    #json.loads converts json formatted data to python data
                    #json merge preserve takes 2 or more json documents
                    curUserName = passedInUserName
                    curImage = passedInImage
                    
                    oldTags = json.loads(resultArr[i]['categories'])
                    newTags = passedInTags
                    combinedTags = list(set(oldTags + newTags))
                    
                    #future: check if passed in image is in list. if not, image is presumed invalid
                    oldImages = json.loads(resultArr[i]['imageName'])
                    if curImage not in oldImages:
                        oldImages.append(curImage)
                    
                    imagesArg = json.dumps(oldImages)
                    
                    oldRefs = json.loads(resultArr[i]['refToImage'])
                    
                    if allUserImagesLocation not in oldRefs:
                        
                        oldRefs.append(allUserImagesLocation)
                    refsArg = json.dumps(oldRefs)
                    
                    curImgDict = json.loads(resultArr[i]['imgDictByTag'])
                    
                    #note: if t is not in list of updated passed in tags, 
                    #search through list of images and delete the corresponding image. 
                    #If t is in list of updated  passed in tags,  check if image is already in list. 
                    #If not already in list, append image name to it
                    
                    #NOTE: blindly adds images
                    for n in newTags:
                        
                        if n not in curImgDict:
                            #brand new tag not in dict
                            newListImage = []
                            newListImage.append(curImage)
                            curImgDict[n] = newListImage
                            logger.info("SUCCESS: added new key-value pair to imgDictByTag")
                        
                        else:
                            
                            if curImgDict[n] == None:
                                newListImage = []
                                newListImage.append(curImage)
                                curImgDict[n] = newListImage
                                logger.info("SUCCESS: added new key-value pair to imgDictByTag; tag is in dictionary, but empty list")
                            else:
                                
                                if curImage not in curImgDict[n]:
                                    curImgDict[n] = curImgDict[n] + list(curImage)
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
                                curImgDict[k].remove(curImage)
                                
                                logger.info("Removing image %s from key (not in combinedTags) %s...", curImage, k)
                                
                                if len(curImgDict[k]) == 0:
                                    del curImgDict[k]
                                    combinedTags.remove(k)
                                    logger.info("Empty image list...Removing key (not in combinedTags) %s from dict...", k)
                                #still need to remove tags with no images from dict
                    
                      
                    tagsArg = json.dumps(combinedTags) 
                                
                    imageDictArg = json.dumps(curImgDict)   
                    
                    canViewDict = json.loads(resultArr[i]['canView'])
                    canViewArg = json.dumps(canViewDict)
                    
                    updateUserRow_Query_Data = (curUserName, 
                        tagsArg, 
                        imagesArg, 
                        refsArg,
                        imageDictArg,
                        canViewArg)
                    
                    cur.execute(updateUserRow_Query, updateUserRow_Query_Data)
                    
                    conn.commit()
                    
                    #update resultArr with a new select statement...
                    cur.execute(getAllRowsQuery)
                    resultArr = cur.fetchall() # returns a list of dict
                    body = make_new_get_user_response(resultArr[i])
                    break
                
                
            #if body is still None, that means
            # passed in username is not currently in database
            if body == None:
                logger.info("Passed in username not found in database.")
                body = {
                    'false': "Passed in username not found in database."
                }
                
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
            'canView': row['canView']
           }
