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

def get_user_handler(event, context):
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
            
            sqlQuery = "select * from User_Account"
            cur.execute(sqlQuery)
            resultArr = cur.fetchall() # returns a list of dict
            
            if not resultArr:
                status_code = 400
                body = 'Did not query any data'
            else:
                for i in range(len(resultArr)):
                    if resultArr[i]['userName'] == passedInUserName:
                        body = make_new_get_user_response(resultArr[i])
                        
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
    
    #return "Added %d items from RDS MySQL table" %(item_count)
    return response
    
    
def make_new_get_user_response(row):
    """ Returns an object containing only what needs to be sent back to the user. """
    return {
            'userName': row['userName'],
            'categories': row['categories'],
            'imageName': row['imageName'],
            'refToImage': row['refToImage'],
            'imgDictByTag': row['imgDictByTag']
           }