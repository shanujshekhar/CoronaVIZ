import numpy as np
import pandas as pd 
import math
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.spatial.distance import cdist
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.manifold import MDS
from sklearn.metrics import pairwise_distances

from flask import Flask, render_template, jsonify
import json
import sys

app = Flask(__name__)

@app.route("/")
def d3():
	return render_template('index.html')

@app.route('/USA')
def usa():

	f = open("static/us-states.json", "r")
	mapUSA = json.load(f)

	data_dict = {}
	data_dict['usafeatures'] = mapUSA['features']

	temp_dict = {}
	for i,st in enumerate([row['properties']['name'] for row in data_dict['usafeatures']]):
		temp_dict[st] = i		
	
	data_dict['dict'] = temp_dict

	def convertStates():
		cases = pd.DataFrame(columns=['State', 'Active', 'Deaths', 'Confirmed'])

		cases['State'] = [row['properties']['name'] for row in data_dict['usafeatures']]
		cases = cases.replace(np.nan, 0)

		data = pd.read_csv("static/COVID-19 Cases New.csv")
		dataUSA = data[data['Country_Region']=='US']
		dataUSA = dataUSA[['Date', 'Province_State', 'Case_Type', 'Cases', 'Prep_Flow_Runtime', 'Lat', 'Long']]

		temp_dict = {}
		for i,st in enumerate(cases['State']):
			temp_dict[st] = i
		
		# dataUSA = dataUSA[:1000]
		for index, row in dataUSA.iterrows():
			print (index)
			if row['Province_State'] in temp_dict:
				cases.at[temp_dict[row['Province_State']], row['Case_Type']] += int(row['Cases'])
		print (cases)

		cases.to_csv('static/USA_Cases.csv', index=False)

	data = pd.read_csv('static/USA_Cases.csv')
	data_dict['usadata'] = data.to_dict(orient='records')

	return data_dict

@app.route('/India')
def india():

	f = open("static/india.json", "r")
	mapIndia = json.load(f)

	data_dict = {}
	data_dict['indiafeatures'] = mapIndia['features']

	data = pd.read_csv('static/India_Cases.csv')
	data_dict['indiadata'] = data.to_dict(orient='records')

	return data_dict

@app.route('/USA_Pop')
def USA_population():
	data_dict = {}

	f = open("static/us-states.json", "r")
	mapUSA = json.load(f)
	data_dict['usafeatures'] = mapUSA['features']

	temp_dict = {}
	for i,st in enumerate([row['properties']['name'] for row in data_dict['usafeatures']]):
		temp_dict[st] = i		
	
	data_dict['dict'] = temp_dict

	data_cases = pd.read_csv('static/USA_Cases.csv')
	data_pop = pd.read_csv('static/USA_Population.csv')
	data = data_cases.join(data_pop.set_index('State'), on='State')

	data['Population'] = data['Confirmed'] / data['Population'] * 1000000
		
	data_dict['data'] = data.to_dict(orient='records')

	return data_dict

@app.route('/India_Pop')
def India_population():
	data_dict = {}
	f = open("static/india.json", "r")
	mapIndia = json.load(f)

	data_dict['indiafeatures'] = mapIndia['features']

	data_cases = pd.read_csv('static/India_Cases.csv')
	data_pop = pd.read_csv('static/India_Population.csv')
	data = data_cases.join(data_pop.set_index('State'), on='State')

	data['Population'] = data['Confirmed'] / data['Population'] * 1000000
	
	temp_dict = {}
	for i,st in enumerate(data['State']):
		temp_dict[st] = i		
	data_dict['dict'] = temp_dict

	# print (temp_dict)

	data_dict['data'] = data.to_dict(orient='records')

	return data_dict

@app.route('/USA_Counties')
@app.route('/county_specific')
@app.route('/state_specific_deaths')
def USA_counties():
	f = open("static/counties.json", "r")
	mapUSA = json.load(f)

	data_dict = {}
	data_dict['usa'] = mapUSA

	def convertCounties():
		data = pd.read_csv("static/us-counties.csv")

		counties = {}
		date_wise = {}

		for ind, row in data.iterrows():
			if(not math.isnan(row['fips']) and row['county'] != "Unknown"):
				fips = int(row['fips'])

				if fips in counties:
					counties[fips]['cases'] += row['cases']
					counties[fips]['deaths'] += row['deaths']
				else:
					counties[fips] = {'county': row['county'], 'state':row['state'], 'cases' : row['cases'], 'deaths' : row['deaths']}

				if row['date'] in date_wise:
					if fips in date_wise[row['date']]:
						date_wise[row['date']][fips]['cases'] = counties[fips]['cases']
						date_wise[row['date']][fips]['deaths'] = counties[fips]['deaths']
					else:
						date_wise[row['date']][fips] = {'county': row['county'], 'state':row['state'], 'cases' : counties[fips]['cases'], 'deaths' : counties[fips]['deaths']}
				else:
					
					date_wise[row['date']] = {fips : {'county': row['county'], 'state':row['state'], 'cases' : counties[fips]['cases'], 'deaths' : counties[fips]['deaths']}}

		with open('static/USA_Counties.json', 'w') as fp:
			json.dump(counties, fp)

		with open('static/USA_Counties_datewise.json', 'w') as fp:
			json.dump(date_wise, fp)

	# convertCounties()

	# print ("Dumped")
	f = open("static/USA_Counties.json", "r")
	data = json.load(f)
	data_dict['counties_data'] = data

	f = open("static/USA_Counties_datewise.json", "r")
	data = json.load(f)
	data_dict['counties_datewise'] = data

	data = pd.read_csv('static/USA_Cases.csv')
	data_dict['usadata'] = data.to_dict(orient='records')

	f = open("static/us-states.json", "r")
	mapUSA = json.load(f)	

	temp_dict = {}
	for i,st in enumerate([row['properties']['name'] for row in mapUSA['features']]):
		temp_dict[st] = i		
	
	data_dict['dict'] = temp_dict

	return data_dict

@app.route('/unemp')
def unemp():
	# f = open("static/us-counties.topojson", "r")
	# topo = json.load(f)
	# print(topo)
	f = open("static/counties.json", "r")
	mapUSA = json.load(f)

	data_dict = {}
	data_dict['usa'] = mapUSA
	return data_dict

if __name__ == '__main__':
	app.run(debug=True)
	# USA_counties()
	
