from flask import Flask, render_template, request, url_for, flash, jsonify
# import altair as alt
import pandas as pd
import json
import psycopg2
# from flask import Flask, request, session, g, redirect, url_for, abort, \
#      render_template, flash
app = Flask(__name__)

def getData(by,filter):
    host = "datavis.cauuh8vzeelb.us-east-1.rds.amazonaws.com"
    database = "top5"
    user = "teamwonder"
    password = "visproject"

    qfilter = []
    for f in filter:
        if filter[f] == 'all':
            continue
        if f == "fromyear":
            qfilter.append("date > "+str(filter[f]))
            continue
        if f == "toyear":
            qfilter.append("date < "+str(filter[f]))
            continue
        qfilter.append(str(f)+' = '+str(filter[f]))

    if qfilter:
        querytext = ("SELECT " + by + ", COUNT(gid) FROM tabletop5 " +
                     "WHERE " + " AND ".join(qfilter) + " GROUP BY "+ by + ";")
    else:
        querytext = ("SELECT " + by + ", COUNT(gid) FROM tabletop5 " +
                     " GROUP BY "+ by + ";")
    print(querytext)

    con = psycopg2.connect(host=host, database=database, user=user, password=password)
    cur = con.cursor()
    cur.execute(querytext)
    rows = cur.fetchall()
    return rows


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/normal/<zipcode>/<category>/<fromyear>/<toyear>',methods=['GET', 'POST'])
def normal(zipcode,category,fromyear,toyear):
    # f = request.get_json(force=True)
    # print(f)
    filter = {"incident_z":zipcode,"complaint_":category,"fromyear":fromyear,"toyear":toyear}
    bycat = getData("complaint_",filter)
    print(bycat)
    return jsonify(bycat)

if __name__ == '__main__':
   app.run(debug = True)
