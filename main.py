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

	def newConvertStates():
		data = pd.read_csv("static/us-states.csv")
		states = {}

		# print (data['date'])
		data = data[data['date']=='2020-05-01']
		data.to_csv('static/USA_Cases.csv', index=False)


	# newConvertStates()

	# Data for Covid Cases - States Wise
	data = pd.read_csv('static/USA_Cases.csv')
	
	
	temp_dict = {}
	for i, st in enumerate(data['state']):
		temp_dict[st] = i		
	
	data_dict['dict'] = temp_dict

	temp_dict = {}
	for i,st in enumerate([row['properties']['name'] for row in data_dict['usafeatures']]):
		temp_dict[st] = i		
	
	data_dict['pop_dict'] = temp_dict

	data_dict['usadata'] = data.to_dict(orient='records')
	

	# Data for Population
	data_cases = pd.read_csv('static/USA_Cases.csv')
	data_pop = pd.read_csv('static/USA_Population.csv')
	data_pop.columns = ['state', 'Population']
	data = data_cases.join(data_pop.set_index('state'), on='state')

	data['Population'] = data['cases'] / data['Population'] * 1000000
	data = data.dropna()
	data_dict['data'] = data.to_dict(orient='records')


	# Data for Covid Cases - Counties Wise
	f = open("static/USA_Counties.json", "r")
	data = json.load(f)
	data_dict['counties_data'] = data

	f = open("static/USA_States_datewise.json", "r")
	data = json.load(f)
	data_dict['states_datewise'] = data

	f = open("static/counties.json", "r")
	mapUSA = json.load(f)
	data_dict['usa'] = mapUSA

	return data_dict

@app.route('/India')
def india():

	# Data for Covid Cases
	f = open("static/india.json", "r")
	mapIndia = json.load(f)

	data_dict = {}
	data_dict['indiafeatures'] = mapIndia['features']

	data_cases = pd.read_csv('static/India_Cases.csv')

	data_dict['indiadata'] = data_cases.to_dict(orient='records')

	temp_dict = {}
	for i, st in enumerate(data_cases['State']):
		temp_dict[st] = i		
	
	data_dict['dict'] = temp_dict

	# Data for Population
	data_pop = pd.read_csv('static/India_Population.csv')
	data = data_cases.join(data_pop.set_index('State'), on='State')

	data['Population'] = data['Confirmed'] / data['Population'] * 1000000
	
	data_dict['data'] = data.to_dict(orient='records')

	return data_dict

# @app.route("/")
@app.route('/USA_Counties')
@app.route('/county_specific')
@app.route('/date_specific')
@app.route('/usa_widespread')
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
					counties[fips]['cases'] = row['cases']
					counties[fips]['deaths'] = row['deaths']
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

	def convertStates_datewise():
		df = pd.read_csv('static/us-states.csv')
		
		date_wise = {}
		states = {}

		for i, row in df.iterrows():
			st = row['state']

			if st in states:
				states[st]['cases'] = row['cases']
				states[st]['deaths'] = row['deaths']
			else:
				states[st] = {'cases' : row['cases'], 'deaths' : row['deaths']}

			if row['date'] in date_wise:
				date_wise[row['date']][st] = {'cases' : states[st]['cases'], 'deaths' : states[st]['deaths']}
			else:
				date_wise[row['date']] = {st : {'cases' : states[st]['cases'], 'deaths' : states[st]['deaths']}}

		with open('static/USA_States_datewise.json', 'w') as fp:
			json.dump(date_wise, fp)

	# convertStates_datewise()

	f = open("static/USA_Counties.json", "r")
	data = json.load(f)
	data_dict['counties_data'] = data

	f = open("static/USA_Counties_datewise.json", "r")
	data = json.load(f)
	data_dict['counties_datewise'] = data

	f = open("static/USA_States_datewise.json", "r")
	data = json.load(f)
	data_dict['states_datewise'] = data

	data = pd.read_csv('static/USA_Cases.csv')
	data_dict['usadata'] = data.to_dict(orient='records')

	f = open("static/us-states.json", "r")
	mapUSA = json.load(f)	

	temp_dict = {}
	for i, st in enumerate(data['state']):
		temp_dict[st] = i		
	
	data_dict['dict'] = temp_dict

	return data_dict

@app.route('/unemp')
def unemployment():
	

	def convertCounties():
		county_data = pd.read_csv('static/CO_UNEMP-1.csv')

		dates = {'07MAR' : '2020-03-07', '14MAR' : '2020-03-14', '21MAR' : '2020-03-21', '28MAR' :'2020-03-28', '04APR' : '2020-04-04', '11APR' : '2020-04-11', '18APR' : '2020-04-18', '25APR' : '2020-04-25', '02MAY' : '2020-05-02'}

		counties_datewise = {'2020-03-07' : {}, '2020-03-14' : {}, '2020-03-21' : {}, '2020-03-28' : {}, '2020-04-04' : {}, '2020-04-11' : {}, '2020-04-18' : {}, '2020-04-25' : {}, '2020-05-02' : {}}
		
		fips = county_data['CO']
		county_data.set_index("CO", inplace = True)

		for col, date in dates.items():
			print (date)
			for f in fips:
				row = county_data.loc[[f]]
				counties_datewise[date][str(f)] = {'county' : row['NAME'][f].replace(' County', ''), 'unemp' : str(row['UE' + col][f]), 'percent' : str(row['PU' + col][f])}


		with open('static/unemp_counties_datewise.json', 'w') as fp:
			json.dump(counties_datewise, fp)

		
	def convertStates():
		state_data = pd.read_csv('static/ST_UNEMP-1.csv')

		dates = {'07MAR' : '2020-03-07', '14MAR' : '2020-03-14', '21MAR' : '2020-03-21', '28MAR' :'2020-03-28', '04APR' : '2020-04-04', '11APR' : '2020-04-11', '18APR' : '2020-04-18', '25APR' : '2020-04-25', '02MAY' : '2020-05-02'}

		states_datewise = {'2020-03-07' : {}, '2020-03-14' : {}, '2020-03-21' : {}, '2020-03-28' : {}, '2020-04-04' : {}, '2020-04-11' : {}, '2020-04-18' : {}, '2020-04-25' : {}, '2020-05-02' : {}}
		
		fips = state_data['ST']
		state_data.set_index("ST", inplace = True)

		for col, date in dates.items():
			print (date)
			for f in fips:
				row = state_data.loc[[f]]
				states_datewise[date][row['NAME'][f]] = {'fips' : int(f), 'unemp' : str(row['UE' + col][f]), 'percent' : str(row['PU' + col][f])}

		with open('static/unemp_states_datewise.json', 'w') as fp:
			json.dump(states_datewise, fp)


	# convertCounties()
	# convertStates()

	f = open("static/counties.json", "r")
	mapUSA = json.load(f)

	data_dict = {}
	data_dict['usa'] = mapUSA

	f = open("static/unemp_counties_datewise.json", "r")
	data = json.load(f)
	data_dict['counties_datewise'] = data

	f = open("static/unemp_states_datewise.json", "r")
	data = json.load(f)
	data_dict['states_datewise'] = data

	data = pd.read_csv('static/USA_Cases.csv')

	temp_dict = {}
	for i, st in enumerate(data['state']):
		temp_dict[st] = i		
	
	data_dict['dict'] = temp_dict

	# Data for Lineplot
	def convertData():
		data = pd.read_csv('static/unemp_10years.csv')
		data_years = {}
		columns = data.columns

		for ind, row in data.iterrows():
			data_years[int(row['Year'])] = []
			for col in columns:
				if col!='Year':
					data_years[int(row['Year'])].append({'month' : col, 'value' : row[col]})

		print (data_years)

		with open('static/unemp_years.json', 'w') as fp:
			json.dump(data_years, fp)

	# convertData()
	f = open("static/unemp_years.json", "r")
	data = json.load(f)
	data_dict['unemp_years'] = data

	return data_dict

if __name__ == '__main__':
	app.run(debug=True, use_reloader=True)
	# unemployment()
	
