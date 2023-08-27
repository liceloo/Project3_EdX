from pymongo import MongoClient
from flask import Flask, jsonify, render_template
import pandas as pd
from pprint import pprint
from bson import json_util, ObjectId
import json


app = Flask(__name__)

mongo = MongoClient(port=27017)

# pull out record
db = mongo['project3']
geo_data = db['geo_data']
med_income = db['med_income']
#dropping _id
#med_income.update({}, {'$unset': {'_id':1}}, multi=True)

@app.route('/')
def home():
    return 'welcome to project 3 </br>/alice'

@app.route('/alice')
def alice():
    return render_template("index.html")

@app.route("/median_income")
def median_income_data():
    #pull here from mongo
    page_sanitized = json.loads(json_util.dumps([i for i in med_income.find({})]))
    pprint(list([i for i in med_income.find({})]))
    return page_sanitized


@app.route('/geo_data')
def geo_data():
    page_sanitized = json.loads(json_util.dumps([i for i in db.geo_data.find({})]))
    pprint(list([i for i in db.geo_data.find({})]))
    return page_sanitized


#loop through databases
@app.route('/merged_data')
def merged_data():
    #grab geo_data --> features.geometry.coordinates & properties.geoid10
    geo_raw = json.loads(json_util.dumps([i for i in db.geo_data.find({})]))
    income = json.loads(json_util.dumps([i for i in med_income.find({})]))
    #grab median_income --> Median_Income
    #step 1
    dict_2021 = {
        #zipcode: income
    }
    dict_2020 = {}
    dict_2019 = {}
    

    #loop through all geo_data, input median_income for each zipcode
    for ind in income:
        if ind['Year'] == 2021:
            dict_2021[ind['Zipcode']] = ind['Median_Income']
        if ind['Year'] == 2020:
            dict_2020[ind['Zipcode']] = ind['Median_Income']
        if ind['Year'] == 2019:
            dict_2019[ind['Zipcode']] = ind['Median_Income']
    
    #return final_dict
    #loop thru geojson --> find zipcode in each property and update in properties income
    geo_loop_2021 = geo_raw[0]['features']
    geo_loop_2020 = geo_raw[0]['features']
    geo_loop_2019 = geo_raw[0]['features']

    for i in range(len(geo_loop_2021)):
        for key, val in dict_2021.items():
            if geo_loop_2021[i]['properties']['zcta5ce10'] == str(key):
                geo_loop_2021[i]['properties']['medianIncome'] = dict_2021[key]
        
        for key, val in dict_2020.items():
            if geo_loop_2020[i]['properties']['zcta5ce10'] == str(key):
                geo_loop_2020[i]['properties']['medianIncome'] = dict_2020[key]
        
        for key, val in dict_2019.items():
            if geo_loop_2019[i]['properties']['zcta5ce10'] == str(key):
                geo_loop_2019[i]['properties']['medianIncome'] = dict_2019[key]
                
    test_dict = geo_raw[0]
    del test_dict['_id']
    return test_dict
    #return page_santizied



if __name__ == "__main__":
    app.run(debug = True)
