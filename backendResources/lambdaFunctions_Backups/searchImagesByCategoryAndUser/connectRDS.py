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

def search_images_by_category_user(event, context):
    """
    This function fetches content from mysql RDS instance
    Beginning of lambda function
    """

    #item_count = 0
    status_code = 200
    body = None
    resultArr = None

    try:
        conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
    except:
        logger.error("ERROR: Unexpected error: Could not connect to MySql instance.")
        sys.exit()

    logger.info("SUCCESS: Connection to RDS mysql instance succeeded")
    
    try:
        
        with conn.cursor(pymysql.cursors.DictCursor) as cur:
            # RDS DB instance has already been populated with sample user data.
            
            #passedInUserName = event['username']
            passedInUserName = event['query']['username']
            passedInCategory = event['query']['category']
            
            sqlQuery = "select * from User_Account"
            cur.execute(sqlQuery)
            resultArr = cur.fetchall() # returns a list of dict
            
            if not resultArr:
                status_code = 400
                body = 'Did not query any data'
            else:
                for i in range(len(resultArr)):
                    if resultArr[i]['userName'] == passedInUserName:
                        imgDict = json.loads(resultArr[i]['imgDictByTag'])
                        
                        if passedInCategory in imgDict:
                            body = imgDict[passedInCategory]
                            break
                        else:
                            logger.info("No such category found for this username.")
                            body = {
                                'false' : "No such category found for this username."
                            }
                            break
                        
                        
                if body == None:
                    logger.info("No username found.")
                    body = {
                        'false' : "No username found."
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