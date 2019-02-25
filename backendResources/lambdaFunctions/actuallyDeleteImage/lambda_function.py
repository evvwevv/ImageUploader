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

def delActualImage(event, context):
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
            passedInImageName = event["body"]["imagename"]
            imageLoc = allUserImagesLocation + passedInImageName
            
            #curTempUserRow = None #store row as a dict with '!' as username (primary key)
            
            getAllRowsQuery = "select * from User_Account"
            cur.execute(getAllRowsQuery)
            
            resultArr = cur.fetchall() # returns a list of dict
        
            for i in range(len(resultArr)):
                #if resultArr[i]['userName'] == '!!':
                #    curTempUserRow = resultArr[i] # save for when username isn't '!!'
                #elif 
                
                if resultArr[i]['userName'] == passedInUserName:
                    #username already present in table
                    
                    # only run this query after categories list is updated
                    # for tags and imagenames, duplicates are NOT currently removed
                    updateUserRow_Query = ("INSERT INTO User_Account "
                        "(userName, categories, imageName, refToImage, imgDictByTag, canView) "
                        "VALUES (%s, JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), %s, %s) "
                        "on duplicate key "
                        "update categories = values(categories), imageName = values(imageName), refToImage = values(refToImage), imgDictByTag = values(imgDictByTag), canView = values(canView)")
                    
                    #json.dumps converts python data to JSON formatted data
                    #json.loads converts json formatted data to python data
                    #json merge preserve takes 2 or more json documents
                    curUserName = passedInUserName
                    
                    oldTags = json.loads(resultArr[i]['categories'])
                    
                    oldImages = json.loads(resultArr[i]['imageName'])
                    imageToBeDel = passedInImageName 
                    
                    if imageToBeDel in oldImages:
                        oldImages.remove(imageToBeDel)
                        
                    imagesArg = json.dumps(oldImages)
                    
                    oldRefs = json.loads(resultArr[i]['refToImage'])
                    refToBeDel = imageLoc
                    
                    if refToBeDel in oldRefs:
                        oldRefs.remove(refToBeDel)
                        
                    refsArg = json.dumps(oldRefs)
                    
                    curImgDict = json.loads(resultArr[i]['imgDictByTag'])
                    
                    curKeys = curImgDict.keys() 
                    copyOfKeys = []
                    
                    for keyss in curKeys:
                        copyOfKeys.append(keyss)
                    
                    #note: tags with no images should not be kept in db
                    for t in copyOfKeys:

                        if imageToBeDel in curImgDict[t]:
                            curImgDict[t].remove(imageToBeDel)
                            if len(curImgDict[t]) == 0:
                                del curImgDict[t]
                                oldTags.remove(t)
                        else:
                            logger.info("image to be deleted somehow not found in list of images for a tag.")
                            body = {
                                'false': "Failure to delete: image to be deleted somehow not found in list of images for a tag.",
                                'imageName': imageToBeDel
                            }
                            break
                    
                    tagsArg = json.dumps(oldTags)
                    
                    if body != None:
                        break
                    else:
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
                
            #--------------------------
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
