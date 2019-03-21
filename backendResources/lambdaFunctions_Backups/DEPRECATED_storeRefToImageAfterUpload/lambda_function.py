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

def addRefToImageAfterUpload(event, context):
    """
    This function fetches content from mysql RDS instance
    Beginning of lambda function
    """

    #item_count = 0
    status_code = 200
    body = None
    resultArr = None
    allUserImagesLocation = "https://s3.amazonaws.com/imageuploader-main-bucket/All_User_Images/"

    try:
        conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
    except:
        logger.error("ERROR: Unexpected error: Could not connect to MySql instance.")
        sys.exit()

    logger.info("SUCCESS: Connection to RDS mysql instance succeeded")
    
    with conn.cursor(pymysql.cursors.DictCursor) as cur:

        for record in event['Records']:
            #bucketName = record['s3']['bucket']['name']
            imageName = record['s3']['object']['key'] #expected when running actual program: All_User_Images/imagename.png
            imageName = imageName.split('/')[-1]
            allUserImagesLocation = allUserImagesLocation + imageName
            
            temp_add_url_query = ("INSERT INTO User_Account "
               "(userName, categories, imageName, refToImage, imgDictByTag, canView) "
               "VALUES (%s, JSON_ARRAY(), JSON_ARRAY(%s), JSON_ARRAY(%s), %s, %s) "
               "on duplicate key "
               "update imageName = values(imageName), refToImage = values(refToImage), imgDictByTag = values(imgDictByTag), canView = values(canView)")
               
            temp_add_url_query_data = ('!', imageName, allUserImagesLocation, '{}', '{}')
            
            cur.execute(temp_add_url_query, temp_add_url_query_data)
            
            conn.commit() #must commit() on conn, not cur
            
            body = allUserImagesLocation
            
        cur.close()
    

    response = {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(body)
    }
     
    conn.close()
    
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