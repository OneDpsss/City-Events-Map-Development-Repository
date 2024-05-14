import os
from dotenv import load_dotenv

load_dotenv()

api_id = os.getenv('API_ID')
api_hash = os.getenv('API_HASH')
SHUTTLE_KEY = os.getenv('SHUTTLE_KEY')
bot_token = os.getenv('BOT_TOKEN')
my_chat_id = os.getenv('MY_CHAT_ID')

prompt = """in JSON format in Russian language { "title": "Describe the event title, focusing on key aspects and 
excluding additional details.", "address": "Specify the event location in the following format: City (if possible), 
Street (if possible), Building (if possible). Note that all events take place in Nizhny Novgorod. Do not separate 
into separate entities.", "description": "Rephrase the information to provide a more precise context and avoid 
unnecessary emotional inserts.", "priority": { where "3": "High importance: Events that significantly affect all or 
most of the city's residents. National or global news related to the city or its residents. Major changes in 
infrastructure, politics, economy, or public life of the city.", "2": "Medium importance: Events affecting specific 
areas or groups of city residents. Important local events such as cultural events, festivals, or sports competitions. 
Significant updates in the education, healthcare, or transportation system.", "1": "Low importance: Events of 
interest to specific circles of people or useful only to a small portion of the population. Routine news related to 
local organizations or companies. Minor changes in the city environment, such as opening or closing small 
businesses.", "0": "Minimal importance: Events unlikely to attract the attention of the majority of city residents. 
Personal announcements, advertisements, or events affecting only individuals or small groups." } } In Russian 
Language"""

