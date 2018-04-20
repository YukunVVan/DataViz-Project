import pandas as pd
import numpy as np
import os
import sys

#nyc open data API, you need apptoken to run this cell
from sodapy import Socrata
client = Socrata("data.cityofnewyork.us", os.getenv("apptoken"))

#show some major types
results = client.get("fhrw-4uyv",
                     select = "created_date, complaint_type, latitude, longitude",
                     where="created_date > '2013-01-01T00:00:12.000'",
                     limit=67000)
df = pd.DataFrame.from_records(results)
df.dropna(inplace=True)
df.count()

countgroup = df.groupby(by='complaint_type').count()
countgroup.reset_index(inplace=True)
countgroup.sort_values('created_date', ascending=False, inplace=True)
countgroup.head(50)

#comlaint type "New Tree Request"
results1 = client.get("fhrw-4uyv",
                     select = "created_date, complaint_type, latitude, longitude",
                     where="complaint_type='New Tree Request' and created_date > '2013-01-01T00:00:12.000'",
                     limit=16700000)
df_newtree = pd.DataFrame.from_records(results1)
df_newtree.dropna(inplace=True)
df_newtree.count()

df_newtree.to_csv('new_tree_request_since_2013.csv')


