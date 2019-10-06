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

def add_or_delete_permission_for_user_to_view_image(event, context):
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
            
            passedInUserName = event["body"]["username"] #owner of image
            passedInImageName = event["body"]["imagename"]
            passedInAction = event["body"]["action"] # can either be "add" or "delete"
            passedInTargetUserToMod = event["body"]["userToAddOrDeletePermission"]
            
            hashableUserAndImage = passedInUserName + "*" + passedInImageName
            imageLoc = allUserImagesLocation + hashableUserAndImage
            imageLoc = imageLoc.replace("@", "%40", 1)
            
            
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
                        "(userName, categories, imageName, refToImage, imgDictByTag, canView, imgDictByImage) "
                        "VALUES (%s, JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), %s, %s, %s) "
                        "on duplicate key "
                        "update categories = values(categories), imageName = values(imageName), refToImage = values(refToImage), imgDictByTag = values(imgDictByTag), canView = values(canView), imgDictByImage = values(imgDictByImage)")
                    
                    #json.dumps converts python data to JSON formatted data
                    #json.loads converts json formatted data to python data
                    #json merge preserve takes 2 or more json documents
                    curUserName = passedInUserName
                    
                    oldTags = json.loads(resultArr[i]['categories'])
                    tagsArg = json.dumps(oldTags)
                    
                    oldImages = json.loads(resultArr[i]['imageName'])
                    imagesArg = json.dumps(oldImages)
                    
                    oldRefs = json.loads(resultArr[i]['refToImage'])
                    refsArg = json.dumps(oldRefs)
                    
                    curImgDict = json.loads(resultArr[i]['imgDictByTag'])
                    imageDictArg = json.dumps(curImgDict)
                    
                    curImgDictByImage = json.loads(resultArr[i]['imgDictByImage'])
                    imageDictByImageArg = json.dumps(curImgDictByImage)
                   
                    canViewDict = json.loads(resultArr[i]['canView'])
                    imgToLookUp = hashableUserAndImage
                    
                    if passedInAction == "add":
                        
                        if imgToLookUp in canViewDict:
                            
                            if passedInTargetUserToMod in canViewDict[imgToLookUp]:
                                logger.info("%s already has permission to view %s.", passedInTargetUserToMod, imgToLookUp)
                                status_code = 400
                                body = {
                                    'false': "{} already has permission to view this image: {} .".format(passedInTargetUserToMod, imgToLookUp)
                                }
                                break
                            else:
                                canViewDict[imgToLookUp].append(passedInTargetUserToMod)
                                
                        else:
                            logger.info("Image, {} , doesn't exist in list of permissions (owner is {}).".format(passedInImageName, passedInUserName))
                            status_code = 404
                            body = {
                                'false': "Image, {} , doesn't exist in list of permissions (owner is {}).".format(passedInImageName, passedInUserName)
                            }
                            
                            
                    elif passedInAction == "delete":
                        
                        if imgToLookUp in canViewDict:
                            
                            if passedInTargetUserToMod not in canViewDict[imgToLookUp]:
                                logger.info("{} already has no permission to view this image: {}.".format(passedInTargetUserToMod, imgToLookUp))
                                status_code = 404
                                body = {
                                    'false': "{} already has no permission to view this image: {}.".format(passedInTargetUserToMod, imgToLookUp)
                                }
                                break
                            else:
                                canViewDict[imgToLookUp].remove(passedInTargetUserToMod)
                                
                        else:
                            logger.info("Image, {} , doesn't exist in list of permissions (owner is {}).".format(passedInImageName, passedInUserName))
                            status_code = 404
                            body = {
                                'false': "Image, {} , doesn't exist in list of permissions (owner is {}).".format(passedInImageName, passedInUserName)
                            }
                            
                            
                    else:
                        logger.info("action string-value should either be add OR delete")
                        status_code = 400
                        body = {
                            'false': "action string-value should either be: \"add\" OR \"delete\""
                        }
                        break
                        
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
                    
                    if body == None:
                        body = make_new_get_user_response(resultArr[i])
                    break
                
            #--------------------------
            #if body is still None, that means
            # passed in username is not currently in database
            if body == None:
                logger.info("Username (owner) {} not found in database.".format(passedInUserName))
                status_code = 404
                body = {
                    'false': "Username (owner) {} not found in database.".format(passedInUserName)
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
            'canView': row['canView'],
            'imgDictByImage': row['imgDictByImage']
           }
