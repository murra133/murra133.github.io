import csv
import json

data = {'maxVal':{
    'all':'0',
    'female':'0',
    'male':'0',
    'region':'0'
}}

mapCounrty = {}
cm = {}
s = set()
def cleanCountry(country):
    if country[-1] == "*":
        return country[0:len(country)-2]
    return country

with open('continents2.csv') as file:
    reader = csv.reader(file,delimiter=',')
    next(reader)
    for row in reader:
        cm[row[0]] = row[5]
        mapCounrty[row[2]] = row[0]
        s.add(row[5])

with open('suiciderateall.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    next(csv_reader)
    for row in csv_reader:
        country = cleanCountry(row[0])
        data[country] = {'all':{},
                        'female':{},
                        'male':{},
                        'GDP':{}}
        if country not in cm:
            print(country + " Not found")
        else:
            data[country]['region'] = cm[country]
        for i in range(1,len(row)):
            year = str(i + 1999)
            # if year not in data['maxVal']['all']:
            #     data['maxVal']['all'][year] = {row[i]}
            data[country]['all'][year] = row[i]
            if float(data['maxVal']['all']) < float(row[i]):
                data['maxVal']['all'] = row[i]
            

with open('suicideratefemale.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    next(csv_reader)
    for row in csv_reader:
        country = cleanCountry(row[0])
        for i in range(1,len(row)):
            year = str(i + 1999)
            data[country]['female'][year] = row[i]
            if float(data['maxVal']['female']) < float(row[i]):
                data['maxVal']['female'] = row[i]

with open('suicideratemale.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    next(csv_reader)
    for row in csv_reader:
        country = cleanCountry(row[0])
        for i in range(1,len(row)):
            year = str(i + 1999)
            data[country]['male'][year] = row[i]
            if float(data['maxVal']['male']) < float(row[i]):
                data['maxVal']['male'] = row[i]

countrySet = set()                
with open('world_country_gdp_usd.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    next(csv_reader)
    for row in csv_reader:
        year = int(row[2])
        if year > 1999 and year < 2020 and row[1] in mapCounrty and mapCounrty[row[1]] in data:
            GDP = row[4]
            if GDP == '':
                GDP = "0"
            data[mapCounrty[row[1]]]["GDP"][str(year)] = GDP
            countrySet.add(mapCounrty[row[1]])

with open("data.json", "w") as outfile:
    outfile.write(json.dumps(data))
    
for i in data:
    if i not in countrySet:
        print(i)
        
        
