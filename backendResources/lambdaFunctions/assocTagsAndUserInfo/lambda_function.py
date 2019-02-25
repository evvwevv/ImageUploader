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
                #if resultArr[i]['userName'] == '!':
                #    curTempUserRow = resultArr[i] # save for when username isn't '!'
                #elif 
                
                if resultArr[i]['userName'] == passedInUserName:
                    #username already present in table
                    
                    # only run this query after categories list is updated
                    updateUserRow_Query = ("INSERT INTO User_Account "
                        "(userName, categories, imageName, refToImage, imgDictByTag, canView) "
                        "VALUES (%s, JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), %s, %s) "
                        "on duplicate key "
                        "update imageName = values(imageName), refToImage = values(refToImage), imgDictByTag = values(imgDictByTag), canView = values(canView)")
                    
                    #json.dumps converts python data to JSON formatted data
                    #json.loads converts json formatted data to python data
                    #json merge preserve takes 2 or more json documents
                    curUserName = passedInUserName
                    
                    oldTags = json.loads(resultArr[i]['categories'])
                    newTags = passedInTags
                    combinedTags = list(set(oldTags + newTags))
                    tagsArg = json.dumps(combinedTags)
                    
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
                    # later: if deleting a tag from combinedTags, must del corresponding
                    # tag from imgDictByTag
                    for t in newTags:
                        if t not in curImgDict:
                            curImgDict[t] = newImageL
                        else:
                            #uploadedImgName = json.loads(curTempUserRow['imageName'])[0]
                            if passedInImageName not in curImgDict[t]:
                                curImgDict[t].append(passedInImageName)
                                
                    imageDictArg = json.dumps(curImgDict)   
                    
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
                        canViewArg)
                    
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
                    "(userName, categories, imageName, refToImage, imgDictByTag, canView) "
                    "VALUES (%s, JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), JSON_MERGE_PRESERVE(JSON_ARRAY(), %s), %s, %s) "
                    "on duplicate key "
                    "update imageName = values(imageName), refToImage = values(refToImage), imgDictByTag = values(imgDictByTag), canView = values(canView)")
                    
                curUserName = passedInUserName
                
                #must turn to py list before calling dumps on it
                tagsArg = json.dumps(list(passedInTags))
                
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
                    
                addNewUser_Data = (curUserName, 
                    tagsArg, 
                    imagesArg, 
                    refsArg,
                    imageDict,
                    canViewArg)
                        
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
            'canView': row['canView']
           }
